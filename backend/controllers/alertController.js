const asyncHandler = require("../utils/asyncHandler");
const Alert = require("../models/Alert");
const AlertSync = require("../models/AlertSync");
const Institution = require("../models/Institution");

const refreshExpired = async () => {
  await Alert.updateMany(
    { status: "active", expiresAt: { $lte: new Date() } },
    { $set: { status: "expired" } }
  );
};

const accessibleFilter = (req) => ({
  status: "active",
  $or: [
    { institution: { $exists: false } },
    ...(req.user.institution ? [{ institution: req.user.institution }] : []),
  ],
  targetAudience: req.user.role,
});

const listAlerts = asyncHandler(async (req, res) => {
  await refreshExpired();
  const alerts = await Alert.find(accessibleFilter(req))
    .sort({ severity: -1, startsAt: -1 })
    .limit(50)
    .lean();
  res.json({ success: true, alerts });
});

const getAlert = asyncHandler(async (req, res) => {
  const alert = await Alert.findOne({ _id: req.params.id, ...accessibleFilter(req) }).lean();
  if (!alert) {
    res.status(404);
    throw new Error("Alert not found");
  }
  res.json({ success: true, alert });
});

const createMockDrill = asyncHandler(async (req, res) => {
  const { title, message, category, severity, institution, startsAt, expiresAt } = req.body;
  if (!title || !message || !institution) {
    res.status(400);
    throw new Error("Title, message, and institution are required");
  }
  const institutionRecord = await Institution.findById(institution);
  if (!institutionRecord) {
    res.status(404);
    throw new Error("Institution not found");
  }
  const isInstitutionAdmin = institutionRecord.adminUsers.some(
    (id) => id.toString() === req.user._id.toString()
  );
  const isTeacherInInstitution =
    req.user.role === "teacher" &&
    req.user.institution?.toString() === institutionRecord._id.toString();
  if (!isInstitutionAdmin && !isTeacherInInstitution) {
    res.status(403);
    throw new Error("You are not authorized to target this institution");
  }
  const alert = await Alert.create({
    title,
    message,
    category: category || "mock-drill",
    severity: severity || "moderate",
    source: "institution-mock-drill",
    institution,
    targetAudience: ["student", "teacher", "admin"],
    startsAt: startsAt || new Date(),
    expiresAt,
    createdBy: req.user._id,
    isMockDrill: true,
    metadata: { label: "MOCK DRILL" },
  });
  res.status(201).json({ success: true, alert });
});

const cancelAlert = asyncHandler(async (req, res) => {
  const alert = await Alert.findById(req.params.id);
  if (!alert) {
    res.status(404);
    throw new Error("Alert not found");
  }
  const isOwner = alert.createdBy?.toString() === req.user._id.toString();
  if (req.user.role !== "admin" && !isOwner) {
    res.status(403);
    throw new Error("Not authorized to cancel this alert");
  }
  alert.status = "cancelled";
  await alert.save();
  res.json({ success: true, alert });
});

const status = asyncHandler(async (req, res) => {
  const provider = process.env.WEATHER_PROVIDER || "mock";
  const sync = await AlertSync.findOne({ provider }).lean();
  const lastSuccessfulSyncAt = sync?.lastSuccessfulSyncAt || null;
  const staleAfterMs =
    Number(process.env.ALERT_STALE_AFTER_MINUTES || 45) * 60 * 1000;
  const isStale =
    !lastSuccessfulSyncAt ||
    Date.now() - new Date(lastSuccessfulSyncAt).getTime() > staleAfterMs ||
    sync?.status === "error";
  res.json({
    success: true,
    provider,
    isDemo: provider === "mock",
    lastSuccessfulSyncAt,
    status: sync?.status || "never",
    isStale,
    staleAfterMinutes: Number(process.env.ALERT_STALE_AFTER_MINUTES || 45),
  });
});

module.exports = { listAlerts, getAlert, createMockDrill, cancelAlert, status };
