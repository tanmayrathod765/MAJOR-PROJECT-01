const express = require("express");

const {
  listScenarios,
  getScenarioById,
  createScenario,
} = require("../controllers/drillScenarioController");

const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// List active drill scenarios
router.get("/", protect, listScenarios);

// Get full scenario tree
router.get("/:id", protect, getScenarioById);

// Create scenario - admin or teacher only
router.post(
  "/",
  protect,
  authorize("admin", "teacher"),
  createScenario
);

module.exports = router;