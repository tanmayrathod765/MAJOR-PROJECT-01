const express = require("express");

const {
  createSession,
  startSession,
  updateMyProgress,
  completeMyProgress,
  getSessionById,
  listMySessions,
  getMySessions,
} = require("../controllers/drillSessionController");

const { protect, authorize } = require("../middleware/auth");
const router = express.Router();

// Teacher/admin creates a class drill session
router.post(
  "/",
  protect,
  authorize("teacher", "admin"),
  createSession
);

// Teacher/admin starts a scheduled session
router.patch(
  "/:id/start",
  protect,
  authorize("teacher", "admin"),
  startSession
);

// Student updates their live drill progress
router.patch(
  "/:id/progress",
  protect,
  authorize("student"),
  updateMyProgress
);

// Student marks their drill progress completed
router.patch(
  "/:id/complete",
  protect,
  authorize("student"),
  completeMyProgress
);
router.get(
  "/mine",
  protect,
  authorize("student"),
  getMySessions
);
// Teacher/admin polls live session progress
router.get(
  "/:id",
  protect,
  authorize("teacher", "admin"),
  getSessionById
);

// Teacher/admin lists their sessions
router.get(
  "/",
  protect,
  authorize("teacher", "admin"),
  listMySessions
);

module.exports = router;