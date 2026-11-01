const mongoose = require("mongoose");

const pathEntrySchema = new mongoose.Schema(
  {
    nodeId: {
      type: String,
      required: true,
      trim: true,
    },

    chosenOptionText: {
      type: String,
      trim: true,
    },

    wasCorrectChoice: {
      type: Boolean,
    },
  },
  { _id: false }
);

const drillAttemptSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    scenario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DrillScenario",
      required: true,
    },

    difficulty: {
      type: String,
      enum: ["beginner", "advanced"],
      required: true,
    },

    pathTaken: {
      type: [pathEntrySchema],
      required: true,
    },

    finalEndingType: {
      type: String,
      enum: ["safe", "injured", "critical"],
      required: true,
    },

    timeTakenSeconds: {
      type: Number,
      required: true,
    },

    mistakesCount: {
      type: Number,
      required: true,
      default: 0,
    },

    score: {
      type: Number,
      required: true,
    },

    disasterDiaryEntry: {
      type: String,
      maxlength: 500,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("DrillAttempt", drillAttemptSchema);