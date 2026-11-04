const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://127.0.0.1:8000";

const requestChat = async (payload) => {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    Number(process.env.AI_SERVICE_TIMEOUT_MS || 12000)
  );

  try {
    const response = await fetch(`${AI_SERVICE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(body.detail || body.message || "AI service unavailable");
      error.status = response.status;
      throw error;
    }

    if (!body.answer || typeof body.answer !== "string") {
      throw new Error("AI service returned an invalid response");
    }

    return body;
  } finally {
    clearTimeout(timeout);
  }
};

const requestRiskProfile = async (location) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number(process.env.AI_SERVICE_TIMEOUT_MS || 12000));
  try {
    const response = await fetch(`${AI_SERVICE_URL}/api/risk-profile`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(location || {}),
      signal: controller.signal,
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || !body.location || !body.riskLevel) {
      throw new Error("Risk profile service returned an invalid response");
    }
    return body;
  } finally {
    clearTimeout(timeout);
  }
};

module.exports = { requestChat, requestRiskProfile };
