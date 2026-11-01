const Lesson = require("../models/Lesson");
const Quiz = require("../models/Quiz");
const QuizAttempt = require("../models/QuizAttempt");
const asyncHandler = require("../utils/asyncHandler");

// Submit a student's quiz attempt
const submitQuizAttempt = asyncHandler(async (req, res) => {
  const { answers } = req.body;
  const { id: lessonId } = req.params;

  if (!Array.isArray(answers)) {
    res.status(400);
    throw new Error("answers must be an array");
  }

  const lesson = await Lesson.findOne({
    _id: lessonId,
    isActive: true,
  });

  if (!lesson) {
    res.status(404);
    throw new Error("Lesson not found");
  }

  const quiz = await Quiz.findOne({
    lesson: lessonId,
  });

  if (!quiz) {
    res.status(404);
    throw new Error("Quiz not found for this lesson");
  }

  if (answers.length !== quiz.questions.length) {
    res.status(400);
    throw new Error(
      `Expected ${quiz.questions.length} answers`
    );
  }

  for (let i = 0; i < answers.length; i += 1) {
    const answer = answers[i];
    const question = quiz.questions[i];

    if (
      !Number.isInteger(answer) ||
      answer < 0 ||
      answer >= question.options.length
    ) {
      res.status(400);
      throw new Error(
        `Invalid answer index for question ${i + 1}`
      );
    }
  }

  let score = 0;

  const breakdown = quiz.questions.map((question, index) => {
    const selectedOptionIndex = answers[index];
    const correct =
      selectedOptionIndex === question.correctOptionIndex;

    if (correct) {
      score += 1;
    }

    return {
      questionNumber: index + 1,
      questionText: question.questionText,
      selectedOptionIndex,
      correctOptionIndex: question.correctOptionIndex,
      isCorrect: correct,
      explanation: question.explanation || "",
    };
  });

  const attempt = await QuizAttempt.create({
    student: req.user._id,
    quiz: quiz._id,
    answers,
    score,
    totalQuestions: quiz.questions.length,
  });

  res.status(201).json({
    success: true,
    attempt,
    breakdown,
  });
});

// Get logged-in student's quiz attempts
const getMyQuizAttempts = asyncHandler(async (req, res) => {
  const attempts = await QuizAttempt.find({
    student: req.user._id,
  })
    .populate({
      path: "quiz",
      populate: {
        path: "lesson",
        select: "title grade disasterType",
      },
    })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: attempts.length,
    attempts,
  });
});

module.exports = {
  submitQuizAttempt,
  getMyQuizAttempts,
};