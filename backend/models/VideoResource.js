const mongoose = require("mongoose");

const videoResourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 180 },
    description: { type: String, required: true, trim: true, maxlength: 1000 },
    resourceType: {
      type: String,
      enum: ["youtube", "external"],
      required: true,
    },
    url: { type: String, required: true, trim: true },
    youtubeVideoId: { type: String, default: "" },
    thumbnailUrl: { type: String, default: "" },
    category: {
      type: String,
      enum: [
        "earthquake",
        "fire",
        "flood",
        "first-aid",
        "emergency-response",
        "heat-wave",
        "lightning",
        "school-safety",
        "general",
      ],
      required: true,
    },
    grade: { type: String, trim: true, default: "" },
    sourceOrganization: { type: String, trim: true, default: "" },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    sourceKind: {
      type: String,
      enum: ["curated", "teacher"],
      default: "teacher",
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("VideoResource", videoResourceSchema);
