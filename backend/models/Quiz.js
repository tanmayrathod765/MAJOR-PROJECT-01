const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    questionText: {
      type: String,
      required: true,
      trim: true,
    },

    options: {
      type: [String],
      required: true,
      validate: {
        validator: (options) => options.length >= 2,
        message: "Each question must have at least 2 options",
      },
    },

    correctOptionIndex: {
      type: Number,
      required: true,
      min: 0,
    },

    explanation: {
      type: String,
      default: "",
    },
  },
  {
    _id: true,
  }
);

const quizSchema = new mongoose.Schema(
  {
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
      unique: true,
    },

    questions: {
      type: [questionSchema],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Quiz", quizSchema);