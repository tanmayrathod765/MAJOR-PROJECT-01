const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const {
  listAlerts,
  getAlert,
  createMockDrill,
  cancelAlert,
  status,
} = require("../controllers/alertController");

const router = express.Router();
router.use(protect);
router.get("/", listAlerts);
router.get("/status", status);
router.get("/:id", getAlert);
router.post("/mock-drill", authorize("teacher", "admin"), createMockDrill);
router.post("/:id/cancel", authorize("teacher", "admin"), cancelAlert);

module.exports = router;
