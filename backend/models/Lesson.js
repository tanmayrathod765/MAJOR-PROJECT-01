const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    grade: {
      type: String,
      required: true,
      trim: true,
    },

    disasterType: {
      type: String,
      enum: ["earthquake", "fire", "flood", "general"],
      required: true,
    },

    content: {
      type: String,
      required: true,
    },

    order: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Lesson", lessonSchema);