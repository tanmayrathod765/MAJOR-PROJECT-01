const mongoose = require("mongoose");

const alertSyncSchema = new mongoose.Schema(
  {
    provider: { type: String, required: true, unique: true },
    lastSuccessfulSyncAt: Date,
    lastAttemptAt: Date,
    status: { type: String, enum: ["never", "ok", "stale", "error"], default: "never" },
    message: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("AlertSync", alertSyncSchema);
