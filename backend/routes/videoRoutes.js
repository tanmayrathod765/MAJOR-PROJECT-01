const express = require("express");
const {
  listResources,
  getResource,
  createResource,
  updateResource,
  deleteResource,
  updateProgress,
  getMyProgress,
} = require("../controllers/videoController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(protect);
router.get("/progress/mine", authorize("student"), getMyProgress);
router.get("/", listResources);
router.get("/:id", getResource);
router.post("/", authorize("teacher", "admin"), createResource);
router.put("/:id", authorize("teacher", "admin"), updateResource);
router.delete("/:id", authorize("teacher", "admin"), deleteResource);
router.patch("/:id/progress", authorize("student"), updateProgress);

module.exports = router;
