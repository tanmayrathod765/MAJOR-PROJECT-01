const DrillSession = require("../models/DrillSession");
const DrillScenario = require("../models/DrillScenario");
const User = require("../models/User");
const DrillAttempt = require("../models/DrillAttempt");
const asyncHandler = require("../utils/asyncHandler");

// Create a new class drill session
const createSession = asyncHandler(async (req, res) => {
  const { scenarioId, studentIds } = req.body;

  if (!scenarioId || !Array.isArray(studentIds)) {
    res.status(400);
    throw new Error("scenarioId and studentIds array are required");
  }

  if (studentIds.length === 0) {
    res.status(400);
    throw new Error("At least one student is required");
  }

  // Validate scenario
  const scenario = await DrillScenario.findById(scenarioId);

  if (!scenario) {
    res.status(404);
    throw new Error("Drill scenario not found");
  }

  // Remove duplicate student IDs
  const uniqueStudentIds = [...new Set(studentIds.map((id) => id.toString()))];

  // Validate all students
  const students = await User.find({
    _id: { $in: uniqueStudentIds },
    role: "student",
  }).select("_id");

  if (students.length !== uniqueStudentIds.length) {
    res.status(400);
    throw new Error("One or more studentIds are invalid or not students");
  }

  // Create progress entry for every student
  const progress = uniqueStudentIds.map((studentId) => ({
    student: studentId,
    currentNodeId: null,
    status: "not_started",
    attempt: null,
  }));

  const session = await DrillSession.create({
    teacher: req.user._id,
    institution: req.user.institution,
    scenario: scenario._id,
    studentIds: uniqueStudentIds,
    status: "scheduled",
    progress,
  });

  const populatedSession = await DrillSession.findById(session._id)
    .populate("scenario", "title disasterType difficulty")
    .populate("studentIds", "name email");

  res.status(201).json({
    success: true,
    session: populatedSession,
  });
});

// Start a scheduled session
const startSession = asyncHandler(async (req, res) => {
  const session = await DrillSession.findById(req.params.id);

  if (!session) {
    res.status(404);
    throw new Error("Drill session not found");
  }

  if (session.status === "active") {
    res.status(400);
    throw new Error("Session is already active");
  }

  if (session.status === "completed") {
    res.status(400);
    throw new Error("Session is already completed");
  }

  session.status = "active";
  session.startedAt = new Date();

  const updatedSession = await session.save();

  res.status(200).json({
    success: true,
    session: updatedSession,
  });
});

// Student updates their current position in the drill
const updateMyProgress = asyncHandler(async (req, res) => {
  const { currentNodeId } = req.body;

  if (!currentNodeId) {
    res.status(400);
    throw new Error("currentNodeId is required");
  }

  const session = await DrillSession.findById(req.params.id);

  if (!session) {
    res.status(404);
    throw new Error("Drill session not found");
  }

  // Find this student inside the session
  const progressEntry = session.progress.find(
    (entry) =>
      entry.student.toString() === req.user._id.toString()
  );

  if (!progressEntry) {
    res.status(404);
    throw new Error("You are not part of this drill session");
  }

  progressEntry.currentNodeId = currentNodeId;
  progressEntry.status = "in_progress";

  await session.save();

  res.status(200).json({
    success: true,
    progress: progressEntry,
  });
});

// Student marks their session progress as completed
const completeMyProgress = asyncHandler(async (req, res) => {
  const { attemptId } = req.body;

  if (!attemptId) {
    res.status(400);
    throw new Error("attemptId is required");
  }

  const session = await DrillSession.findById(req.params.id);

  if (!session) {
    res.status(404);
    throw new Error("Drill session not found");
  }

  const progressEntry = session.progress.find(
    (entry) =>
      entry.student.toString() === req.user._id.toString()
  );

  if (!progressEntry) {
    res.status(404);
    throw new Error("You are not part of this drill session");
  }

  // Verify the attempt belongs to this student
  const attempt = await DrillAttempt.findById(attemptId);

  if (!attempt) {
    res.status(404);
    throw new Error("Drill attempt not found");
  }

  if (attempt.student.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("This attempt does not belong to you");
  }

  // Verify attempt belongs to the same scenario
  if (attempt.scenario.toString() !== session.scenario.toString()) {
    res.status(400);
    throw new Error(
      "Attempt does not belong to this session's scenario"
    );
  }

  progressEntry.status = "completed";
  progressEntry.attempt = attempt._id;

  // Check whether every student has completed
  const allCompleted = session.progress.every(
    (entry) => entry.status === "completed"
  );

  if (allCompleted) {
    session.status = "completed";
    session.completedAt = new Date();
  }

  await session.save();

  res.status(200).json({
    success: true,
    sessionStatus: session.status,
    progress: progressEntry,
    completed: allCompleted,
  });
});

// Get complete live session progress
const getSessionProgress = asyncHandler(async (req, res) => {
  const session = await DrillSession.findById(req.params.id)
    .populate("teacher", "name email")
    .populate("institution", "name")
    .populate("scenario", "title disasterType difficulty")
    .populate("progress.student", "name email")
    .populate("progress.attempt", "score finalEndingType");

  if (!session) {
    res.status(404);
    throw new Error("Drill session not found");
  }

  res.status(200).json({
    success: true,
    session,
  });
});

// List sessions created by logged-in teacher/admin
const listMySessions = asyncHandler(async (req, res) => {
  const sessions = await DrillSession.find({
    teacher: req.user._id,
  })
    .populate("scenario", "title disasterType difficulty")
    .populate("studentIds", "name email")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: sessions.length,
    sessions,
  });
});
const getMySessions = asyncHandler(async (req, res) => {
  const sessions = await DrillSession.find({
    studentIds: req.user._id,
    status: { $in: ["scheduled", "active"] },
  })
    .populate("scenario", "title disasterType")
    .lean();

  const mySessions = sessions.map((session) => {
    const myProgress = session.progress.find(
      (item) => item.student.toString() === req.user._id.toString()
    );

    return {
      _id: session._id,
      status: session.status,
      scenario: session.scenario,
      progressStatus: myProgress?.status || "not_started",
    };
  });

  res.json({
    success: true,
    count: mySessions.length,
    sessions: mySessions,
  });
});
const getSessionById = getSessionProgress;

module.exports = {
  createSession,
  startSession,
  updateMyProgress,
  completeMyProgress,
  getSessionById,
  listMySessions,
  getMySessions,
};