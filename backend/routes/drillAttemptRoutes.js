const express = require("express");

const {
  submitAttempt,
  addDiaryEntry,
  getMyAttempts,
  getStudentAttemptsForTeacher,
  getStudentsForReview,
} = require("../controllers/drillAttemptController");

const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// Student submits a completed drill
router.post(
  "/",
  protect,
  authorize("student"),
  submitAttempt
);

// Student adds/updates their diary entry
router.patch(
  "/:id/diary",
  protect,
  authorize("student"),
  addDiaryEntry
);

// Logged-in student gets their own attempts
router.get(
  "/mine",
  protect,
  authorize("student"),
  getMyAttempts
);

// Teacher/admin gets a student's attempts

router.get(
  "/students",
  protect,
  authorize("teacher", "admin"),
  getStudentsForReview
);

router.get(
  "/student/:studentId",
  protect,
  authorize("teacher", "admin"),
  getStudentAttemptsForTeacher
);

module.exports = router;