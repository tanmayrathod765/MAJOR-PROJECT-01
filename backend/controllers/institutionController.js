const Institution = require("../models/Institution");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

// Create institution
const createInstitution = asyncHandler(async (req, res) => {
  const {
    name,
    type,
    address,
    city,
    state,
    pincode,
    district,
    emergencyContacts,
    evacuationPlan,
  } = req.body;

  const institution = await Institution.create({
    name,
    type,
    address,
    city,
    state,
    pincode,
    district,
    emergencyContacts,
    evacuationPlan,
    adminUsers: [req.user._id],
  });

  // Link institution to logged-in admin
  await User.findByIdAndUpdate(req.user._id, {
    institution: institution._id,
  });

  res.status(201).json({
    success: true,
    institution,
  });
});

// Get institution by ID
const getInstitution = asyncHandler(async (req, res) => {
  const institution = await Institution.findById(req.params.id).populate(
    "adminUsers",
    "name email"
  );

  if (!institution) {
    res.status(404);
    throw new Error("Institution not found");
  }

  res.status(200).json({
    success: true,
    institution,
  });
});

// Update institution
const updateInstitution = asyncHandler(async (req, res) => {
  const institution = await Institution.findById(req.params.id);

  if (!institution) {
    res.status(404);
    throw new Error("Institution not found");
  }

  // Check whether logged-in admin belongs to this institution
  const isAdminOfInstitution = institution.adminUsers.some(
    (adminId) => adminId.toString() === req.user._id.toString()
  );

  if (!isAdminOfInstitution) {
    res.status(403);
    throw new Error("Not authorized to update this institution");
  }

  const allowedFields = [
    "name",
    "address",
    "city",
    "state",
    "pincode",
    "district",
    "emergencyContacts",
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      institution[field] = req.body[field];
    }
  });

  const updatedInstitution = await institution.save();

  res.status(200).json({
    success: true,
    institution: updatedInstitution,
  });
});

// Get logged-in user's institution
const listMyInstitution = asyncHandler(async (req, res) => {
  if (!req.user.institution) {
    res.status(404);
    throw new Error("No institution linked to this user");
  }

  const institution = await Institution.findById(req.user.institution).select(
    "name type address city state pincode district emergencyContacts"
  );

  if (!institution) {
    res.status(404);
    throw new Error("Institution not found");
  }

  res.status(200).json({
    success: true,
    institution,
  });
});

module.exports = {
  createInstitution,
  getInstitution,
  updateInstitution,
  listMyInstitution,
};
