const mongoose = require("mongoose");

const videoProgressSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    resource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VideoResource",
      required: true,
    },
    completed: { type: Boolean, default: false },
    lastAccessedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

videoProgressSchema.index({ student: 1, resource: 1 }, { unique: true });

module.exports = mongoose.model("VideoProgress", videoProgressSchema);
