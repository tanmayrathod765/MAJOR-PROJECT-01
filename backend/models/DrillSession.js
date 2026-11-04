const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    currentNodeId: {
      type: String,
      default: null,
      trim: true,
    },

    status: {
      type: String,
      enum: ["not_started", "in_progress", "completed"],
      default: "not_started",
    },

    attempt: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DrillAttempt",
      default: null,
    },
  },
  { _id: false }
);

const drillSessionSchema = new mongoose.Schema(
  {
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
    },

    scenario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DrillScenario",
      required: true,
    },

    studentIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    status: {
      type: String,
      enum: ["scheduled", "active", "completed"],
      default: "scheduled",
    },

    startedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    progress: {
      type: [progressSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("DrillSession", drillSessionSchema);