const express = require("express");

const {
  createInstitution,
  getInstitution,
  updateInstitution,
  listMyInstitution,
} = require("../controllers/institutionController");

const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// Create institution - admin only
router.post(
  "/",
  protect,
  authorize("admin"),
  createInstitution
);

// Get logged-in user's institution
router.get(
  "/mine",
  protect,
  listMyInstitution
);

// Get institution by ID
router.get(
  "/:id",
  protect,
  getInstitution
);

// Update institution - institution admin only
router.put(
  "/:id",
  protect,
  authorize("admin"),
  updateInstitution
);

module.exports = router;