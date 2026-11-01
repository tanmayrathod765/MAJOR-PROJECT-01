const express = require("express");
const { protect } = require("../middleware/auth");
const { chat, riskProfile } = require("../controllers/aiController");

const router = express.Router();
const requestTimes = new Map();
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 20;

const rateLimit = (req, res, next) => {
  const key = req.user._id.toString();
  const now = Date.now();
  const recent = (requestTimes.get(key) || []).filter((time) => now - time < WINDOW_MS);
  if (recent.length >= MAX_REQUESTS) {
    res.status(429);
    return next(new Error("Too many assistant requests. Please wait a minute."));
  }
  recent.push(now);
  requestTimes.set(key, recent);
  return next();
};

router.post("/chat", protect, rateLimit, chat);
router.post("/risk-profile", protect, riskProfile);

module.exports = router;
