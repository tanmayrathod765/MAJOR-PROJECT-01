const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    category: {
      type: String,
      enum: [
        "weather",
        "flood",
        "heatwave",
        "cyclone",
        "earthquake",
        "fire",
        "lightning",
        "mock-drill",
        "preparedness",
      ],
      required: true,
    },
    severity: {
      type: String,
      enum: ["info", "low", "moderate", "high", "extreme"],
      default: "info",
    },
    source: { type: String, required: true, trim: true },
    sourceEventId: { type: String, trim: true },
    institution: { type: mongoose.Schema.Types.ObjectId, ref: "Institution" },
    targetAudience: {
      type: [String],
      enum: ["student", "teacher", "admin"],
      default: ["student", "teacher", "admin"],
    },
    status: {
      type: String,
      enum: ["active", "expired", "cancelled"],
      default: "active",
    },
    startsAt: { type: Date, default: Date.now },
    expiresAt: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isMockDrill: { type: Boolean, default: false },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    lastUpdatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

alertSchema.index({ source: 1, sourceEventId: 1 }, { unique: true, sparse: true });
alertSchema.index({ status: 1, expiresAt: 1, institution: 1 });

module.exports = mongoose.model("Alert", alertSchema);
