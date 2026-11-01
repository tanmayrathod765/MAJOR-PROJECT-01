const DrillAttempt = require("../models/DrillAttempt");
const DrillScenario = require("../models/DrillScenario");
const asyncHandler = require("../utils/asyncHandler");
const User = require("../models/User");
// Submit a completed drill attempt
const submitAttempt = asyncHandler(async (req, res) => {
  const {
    scenarioId,
    pathTaken,
    finalEndingType,
    timeTakenSeconds,
  } = req.body;

  // Basic validation
  if (
    !scenarioId ||
    !Array.isArray(pathTaken) ||
    !finalEndingType ||
    timeTakenSeconds === undefined
  ) {
    res.status(400);
    throw new Error(
      "scenarioId, pathTaken, finalEndingType and timeTakenSeconds are required"
    );
  }

  if (pathTaken.length === 0) {
    res.status(400);
    throw new Error("pathTaken must contain at least one entry");
  }

  if (timeTakenSeconds < 0) {
    res.status(400);
    throw new Error("timeTakenSeconds cannot be negative");
  }

  // Validate final ending type
  const validEndingTypes = ["safe", "injured", "critical"];

  if (!validEndingTypes.includes(finalEndingType)) {
    res.status(400);
    throw new Error(
      "finalEndingType must be safe, injured, or critical"
    );
  }

  // Find scenario
  const scenario = await DrillScenario.findById(scenarioId);

  if (!scenario) {
    res.status(404);
    throw new Error("Drill scenario not found");
  }

  // Calculate mistakes
  const mistakesCount = pathTaken.filter(
    (entry) => entry.wasCorrectChoice === false
  ).length;

  // Score starts at 100
  let score = 100;

  // Mistake penalty
  score -= mistakesCount * 15;

  // Ending penalty
  if (finalEndingType === "injured") {
    score -= 20;
  } else if (finalEndingType === "critical") {
    score -= 40;
  }

  // Time penalty
  // First 60 seconds have no penalty.
  // Every 10 seconds over 60 = -1 point.
  // Maximum time penalty = 20 points.
  if (timeTakenSeconds > 60) {
    const timePenalty = Math.min(
      Math.floor((timeTakenSeconds - 60) / 10),
      20
    );

    score -= timePenalty;
  }

  // Score cannot go below 0
  score = Math.max(0, score);

  const attempt = await DrillAttempt.create({
    student: req.user._id,
    scenario: scenario._id,
    difficulty: scenario.difficulty,
    pathTaken,
    finalEndingType,
    timeTakenSeconds,
    mistakesCount,
    score,
  });

  const populatedAttempt = await DrillAttempt.findById(attempt._id).populate(
    "scenario",
    "title disasterType"
  );

  res.status(201).json({
    success: true,
    attempt: populatedAttempt,
  });
});

// Add/update disaster diary entry
const addDiaryEntry = asyncHandler(async (req, res) => {
  const { diaryEntry } = req.body;

  if (diaryEntry === undefined) {
    res.status(400);
    throw new Error("diaryEntry is required");
  }

  if (typeof diaryEntry !== "string") {
    res.status(400);
    throw new Error("diaryEntry must be a string");
  }

  if (diaryEntry.length > 500) {
    res.status(400);
    throw new Error("Diary entry cannot exceed 500 characters");
  }

  const attempt = await DrillAttempt.findById(req.params.id);

  if (!attempt) {
    res.status(404);
    throw new Error("Drill attempt not found");
  }

  // Only the student who owns the attempt can update it
  if (attempt.student.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to update this drill attempt");
  }

  attempt.disasterDiaryEntry = diaryEntry;

  const updatedAttempt = await attempt.save();

  res.status(200).json({
    success: true,
    attempt: updatedAttempt,
  });
});

// Get logged-in student's own attempts
const getMyAttempts = asyncHandler(async (req, res) => {
  const attempts = await DrillAttempt.find({
    student: req.user._id,
  })
    .populate("scenario", "title disasterType")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: attempts.length,
    attempts,
  });
});

// Teacher/admin views a student's attempts
const getStudentAttemptsForTeacher = asyncHandler(async (req, res) => {
  const attempts = await DrillAttempt.find({
    student: req.params.studentId,
  })
    .populate("scenario", "title disasterType")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: attempts.length,
    attempts,
  });
});

const getStudentsForReview = asyncHandler(async (req, res) => {
  const students = await User.find({
    role: "student",
    institution: req.user.institution,
  })
    .select("_id name email grade institution")
    .sort({ name: 1 });

  res.json({
    success: true,
    count: students.length,
    students,
  });
});

module.exports = {
  submitAttempt,
  addDiaryEntry,
  getMyAttempts,
  getStudentAttemptsForTeacher,
  getStudentsForReview,
};