const Lesson = require("../models/Lesson");
const Quiz = require("../models/Quiz");
const asyncHandler = require("../utils/asyncHandler");

// List active lessons
const listLessons = asyncHandler(async (req, res) => {
  const { grade, disasterType } = req.query;

  const filter = {
    isActive: true,
  };

  if (grade) {
    filter.grade = grade;
  }

  if (disasterType) {
    filter.disasterType = disasterType;
  }

  const lessons = await Lesson.find(filter)
    .select("_id title grade disasterType order")
    .sort({ order: 1, _id: 1 });

  res.status(200).json({
    success: true,
    count: lessons.length,
    lessons,
  });
});

// Get a single lesson with quiz questions,
// but never expose correct answers before submission
const getLessonById = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findOne({
    _id: req.params.id,
    isActive: true,
  }).lean();

  if (!lesson) {
    res.status(404);
    throw new Error("Lesson not found");
  }

  const quiz = await Quiz.findOne({
    lesson: lesson._id,
  }).lean();

  let safeQuiz = null;

  if (quiz) {
    safeQuiz = {
      _id: quiz._id,
      lesson: quiz.lesson,
      questions: quiz.questions.map((question) => ({
        _id: question._id,
        questionText: question.questionText,
        options: question.options,
      })),
    };
  }

  res.status(200).json({
    success: true,
    lesson,
    quiz: safeQuiz,
  });
});

// Create a new lesson
const createLesson = asyncHandler(async (req, res) => {
  const {
    title,
    grade,
    disasterType,
    content,
    order,
  } = req.body;

  if (!title || !grade || !disasterType || !content) {
    res.status(400);
    throw new Error(
      "title, grade, disasterType and content are required"
    );
  }

  const lesson = await Lesson.create({
    title,
    grade,
    disasterType,
    content,
    order: order ?? 0,
  });

  res.status(201).json({
    success: true,
    lesson,
  });
});

// Create or replace the quiz for a lesson
const createOrUpdateQuiz = asyncHandler(async (req, res) => {
  const { questions } = req.body;
  const { id: lessonId } = req.params;

  if (!Array.isArray(questions) || questions.length === 0) {
    res.status(400);
    throw new Error("questions must be a non-empty array");
  }

  const lesson = await Lesson.findById(lessonId);

  if (!lesson) {
    res.status(404);
    throw new Error("Lesson not found");
  }

  for (let i = 0; i < questions.length; i += 1) {
    const question = questions[i];

    if (
      !question.questionText ||
      !Array.isArray(question.options) ||
      question.options.length < 2
    ) {
      res.status(400);
      throw new Error(
        `Question ${i + 1} must have questionText and at least 2 options`
      );
    }

    if (
      !Number.isInteger(question.correctOptionIndex) ||
      question.correctOptionIndex < 0 ||
      question.correctOptionIndex >= question.options.length
    ) {
      res.status(400);
      throw new Error(
        `Question ${i + 1} has an invalid correctOptionIndex`
      );
    }
  }

  const quiz = await Quiz.findOneAndUpdate(
    { lesson: lessonId },
    {
      lesson: lessonId,
      questions,
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  );

  res.status(200).json({
    success: true,
    quiz,
  });
});

module.exports = {
  listLessons,
  getLessonById,
  createLesson,
  createOrUpdateQuiz,
};