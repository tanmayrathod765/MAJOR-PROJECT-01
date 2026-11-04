const crypto = require("crypto");
const Alert = require("../models/Alert");
const AlertSync = require("../models/AlertSync");

let syncInProgress = false;

const fingerprint = (value) =>
  crypto.createHash("sha256").update(value).digest("hex").slice(0, 32);

const normalizeImdAlerts = (payload) => {
  const records = Array.isArray(payload)
    ? payload
    : payload?.data || payload?.warnings || payload?.warning || [];
  if (!Array.isArray(records)) {
    throw new Error("IMD response did not contain a warning list");
  }
  return records
    .filter((item) => item && (item.description || item.message || item.warning || item.event))
    .map((item) => {
      const message = String(
        item.description || item.message || item.warning || item.event
      ).trim();
      const title = String(
        item.title || item.headline || item.event || "IMD weather warning"
      ).trim();
      const sourceEventId = String(
        item.id || item.warning_id || item.eventId || fingerprint(`${title}|${message}`)
      );
      return {
        title,
        message,
        sourceEventId,
        category: String(item.category || item.event || "weather").toLowerCase(),
        severity: String(item.severity || "moderate").toLowerCase(),
        startsAt: item.startsAt || item.start_time || item.valid_from || new Date(),
        expiresAt: item.expiresAt || item.end_time || item.valid_to,
        location: item.district || item.location || item.area,
      };
    });
};

const syncImdAlerts = async (now) => {
  const url = process.env.IMD_API_URL;
  const apiKey = process.env.IMD_API_KEY;
  const bearerToken = process.env.IMD_BEARER_TOKEN;
  if (!url || !apiKey || !bearerToken) {
    throw new Error("IMD_API_URL, IMD_API_KEY, and IMD_BEARER_TOKEN are required");
  }

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    Number(process.env.WEATHER_REQUEST_TIMEOUT_MS || 12000)
  );
  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "x-api-key": apiKey,
        Authorization: `Bearer ${bearerToken}`,
      },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`IMD request failed with status ${response.status}`);
    const alerts = normalizeImdAlerts(await response.json());
    for (const alert of alerts) {
      await Alert.findOneAndUpdate(
        { source: "IMD", sourceEventId: alert.sourceEventId },
        {
          ...alert,
          source: "IMD",
          severity: ["info", "low", "moderate", "high", "extreme"].includes(alert.severity)
            ? alert.severity
            : "moderate",
          category: [
            "weather",
            "flood",
            "heatwave",
            "cyclone",
            "earthquake",
            "fire",
            "lightning",
          ].includes(alert.category)
            ? alert.category
            : "weather",
          targetAudience: ["student", "teacher", "admin"],
          isMockDrill: false,
          status: "active",
          lastUpdatedAt: now,
          metadata: { provider: "IMD", location: alert.location || null },
        },
        { upsert: true, setDefaultsOnInsert: true }
      );
    }
    return alerts.length;
  } finally {
    clearTimeout(timeout);
  }
};

const syncAlerts = async () => {
  if (syncInProgress) return { skipped: true };
  syncInProgress = true;
  const provider = process.env.WEATHER_PROVIDER || "mock";
  const now = new Date();
  try {
    await AlertSync.findOneAndUpdate(
      { provider },
      { provider, lastAttemptAt: now },
      { upsert: true }
    );

    if (provider === "imd") {
      await syncImdAlerts(now);
    } else if (provider === "mock") {
      const mockAlertEnabled = process.env.MOCK_ALERT_ENABLED === "true";
      if (mockAlertEnabled) {
      const sourceEventId = fingerprint(
        `${process.env.MOCK_ALERT_TITLE || "Preparedness reminder"}|${process.env.MOCK_ALERT_MESSAGE || "Review your emergency plan."}`
      );
      await Alert.findOneAndUpdate(
        { source: "demo-provider", sourceEventId },
        {
          title: process.env.MOCK_ALERT_TITLE || "Preparedness reminder",
          message:
            process.env.MOCK_ALERT_MESSAGE ||
            "This is a demo preparedness notification, not a live emergency warning.",
          category: "preparedness",
          severity: "info",
          source: "demo-provider",
          sourceEventId,
          isMockDrill: false,
          startsAt: now,
          expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
          lastUpdatedAt: now,
          status: "active",
        },
        { upsert: true, setDefaultsOnInsert: true }
      );
      }
    } else {
      throw new Error(`Unsupported weather provider: ${provider}`);
    }

    await AlertSync.findOneAndUpdate(
      { provider },
      {
        status: "ok",
        lastSuccessfulSyncAt: now,
        message:
          provider === "imd"
            ? "IMD warning feed synchronized"
            : "Mock provider active; demo preparedness alert synchronized",
      }
    );
    return { skipped: false, provider, status: "ok" };
  } catch (error) {
    await AlertSync.findOneAndUpdate(
      { provider },
      {
        status: "error",
        message: "Provider refresh failed; previously fetched alerts may be stale.",
      },
      { upsert: true }
    );
    return { skipped: false, provider, status: "error", message: error.message };
  } finally {
    syncInProgress = false;
  }
};

const startAlertPolling = () => {
  const minutes = Number(process.env.WEATHER_POLL_INTERVAL_MINUTES || 15);
  const interval = Math.max(minutes, 5) * 60 * 1000;
  syncAlerts().catch(() => {});
  return setInterval(() => syncAlerts().catch(() => {}), interval);
};

module.exports = { syncAlerts, startAlertPolling };
