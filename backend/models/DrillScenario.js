const mongoose = require("mongoose");

const optionSchema = new mongoose.Schema(
  {
    optionText: {
      type: String,
      required: true,
      trim: true,
    },

    nextNodeId: {
      type: String,
      required: true,
      trim: true,
    },

    isCorrectChoice: {
      type: Boolean,
      default: false,
    },

    feedback: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const nodeSchema = new mongoose.Schema(
  {
    nodeId: {
      type: String,
      required: true,
      trim: true,
    },

    situationText: {
      type: String,
      required: true,
      trim: true,
    },

    isEnding: {
      type: Boolean,
      default: false,
    },

    endingType: {
      type: String,
      enum: ["safe", "injured", "critical", null],
      default: null,
    },

    options: {
      type: [optionSchema],
      default: [],
    },
  },
  { _id: false }
);

const drillScenarioSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    disasterType: {
      type: String,
      enum: ["earthquake", "fire", "flood"],
      required: true,
    },

    difficulty: {
      type: String,
      enum: ["beginner", "advanced"],
      required: true,
    },

    description: {
      type: String,
      trim: true,
    },

    startNodeId: {
      type: String,
      required: true,
      trim: true,
    },

    nodes: {
      type: [nodeSchema],
      required: true,
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

module.exports = mongoose.model("DrillScenario", drillScenarioSchema);