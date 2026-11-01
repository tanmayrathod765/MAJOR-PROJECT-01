const express = require("express");

const {
  listLessons,
  getLessonById,
  createLesson,
  createOrUpdateQuiz,
} = require("../controllers/lessonController");

const {
  submitQuizAttempt,
  getMyQuizAttempts,
} = require("../controllers/quizAttemptController");

const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// IMPORTANT:
// This must come before /:id so "quiz-attempts" is not treated as an id.
router.get(
  "/quiz-attempts/mine",
  protect,
  authorize("student"),
  getMyQuizAttempts
);

// Lesson list
router.get(
  "/",
  protect,
  listLessons
);

// Get lesson + safe quiz questions
router.get(
  "/:id",
  protect,
  getLessonById
);

// Create lesson
router.post(
  "/",
  protect,
  authorize("admin", "teacher"),
  createLesson
);

// Create or replace lesson quiz
router.post(
  "/:id/quiz",
  protect,
  authorize("admin", "teacher"),
  createOrUpdateQuiz
);

// Submit quiz
router.post(
  "/:id/quiz/submit",
  protect,
  authorize("student"),
  submitQuizAttempt
);

module.exports = router;