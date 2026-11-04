const VideoResource = require("../models/VideoResource");
const VideoProgress = require("../models/VideoProgress");
const asyncHandler = require("../utils/asyncHandler");
const {
  parseYouTubeVideoId,
  validateResourceUrl,
} = require("../utils/videoValidation");

const categories = [
  "earthquake",
  "fire",
  "flood",
  "first-aid",
  "emergency-response",
  "heat-wave",
  "lightning",
  "school-safety",
  "general",
];

const validatePayload = (body) => {
  const {
    title,
    description,
    resourceType,
    url,
    category,
  } = body;

  if (!title || !description || !resourceType || !url || !category) {
    return "title, description, resourceType, url and category are required";
  }

  if (!["youtube", "external"].includes(resourceType)) {
    return "resourceType must be youtube or external";
  }

  if (!categories.includes(category)) {
    return "Unsupported video category";
  }

  if (!validateResourceUrl(resourceType, url)) {
    return resourceType === "youtube"
      ? "A valid YouTube watch, short, or embed URL is required"
      : "A valid http(s) resource URL is required";
  }

  return null;
};

const canManage = (resource, user) =>
  user.role === "admin" ||
  (resource.uploadedBy &&
    resource.uploadedBy.toString() === user._id.toString());

const listResources = asyncHandler(async (req, res) => {
  const {
    search = "",
    category,
    grade,
    sort = "newest",
    manage = "false",
  } = req.query;
  const isManager = req.user.role === "admin" || req.user.role === "teacher";
  const filter = {};

  if (!(manage === "true" && isManager)) {
    filter.status = "published";
  } else if (req.user.role === "teacher") {
    filter.uploadedBy = req.user._id;
  }

  if (category) filter.category = category;
  if (grade) filter.grade = grade;
  if (search.trim()) {
    const expression = new RegExp(search.trim(), "i");
    filter.$or = [{ title: expression }, { description: expression }];
  }

  const sortExpression =
    sort === "title" ? { title: 1 } : { createdAt: -1 };
  const resources = await VideoResource.find(filter)
    .populate("uploadedBy", "name role")
    .sort(sortExpression);

  const progress = await VideoProgress.find({
    student: req.user._id,
    resource: { $in: resources.map((resource) => resource._id) },
  }).lean();
  const progressByResource = new Map(
    progress.map((item) => [item.resource.toString(), item])
  );

  res.json({
    success: true,
    count: resources.length,
    resources: resources.map((resource) => ({
      ...resource.toObject(),
      progress: progressByResource.get(resource._id.toString()) || null,
    })),
  });
});

const getResource = asyncHandler(async (req, res) => {
  const resource = await VideoResource.findById(req.params.id).populate(
    "uploadedBy",
    "name role"
  );

  if (!resource) {
    res.status(404);
    throw new Error("Video resource not found");
  }

  if (
    resource.status !== "published" &&
    !canManage(resource, req.user)
  ) {
    res.status(404);
    throw new Error("Video resource not found");
  }

  const progress = await VideoProgress.findOne({
    student: req.user._id,
    resource: resource._id,
  });

  res.json({ success: true, resource, progress });
});

const createResource = asyncHandler(async (req, res) => {
  const validationError = validatePayload(req.body);

  if (validationError) {
    res.status(400);
    throw new Error(validationError);
  }

  const {
    title,
    description,
    resourceType,
    url,
    thumbnailUrl = "",
    category,
    grade = "",
    sourceOrganization = "",
    status = "draft",
  } = req.body;

  const resource = await VideoResource.create({
    title,
    description,
    resourceType,
    url,
    youtubeVideoId:
      resourceType === "youtube" ? parseYouTubeVideoId(url) : "",
    thumbnailUrl,
    category,
    grade,
    sourceOrganization,
    uploadedBy: req.user._id,
    sourceKind: "teacher",
    status: req.user.role === "admin" && status === "published"
      ? "published"
      : status === "published" && req.user.role === "teacher"
        ? "published"
        : "draft",
  });

  res.status(201).json({ success: true, resource });
});

const updateResource = asyncHandler(async (req, res) => {
  const resource = await VideoResource.findById(req.params.id);

  if (!resource) {
    res.status(404);
    throw new Error("Video resource not found");
  }

  if (!canManage(resource, req.user)) {
    res.status(403);
    throw new Error("You are not allowed to manage this resource");
  }

  const validationError = validatePayload(req.body);

  if (validationError) {
    res.status(400);
    throw new Error(validationError);
  }

  const {
    title,
    description,
    resourceType,
    url,
    thumbnailUrl = "",
    category,
    grade = "",
    sourceOrganization = "",
    status = resource.status,
  } = req.body;

  Object.assign(resource, {
    title,
    description,
    resourceType,
    url,
    youtubeVideoId:
      resourceType === "youtube" ? parseYouTubeVideoId(url) : "",
    thumbnailUrl,
    category,
    grade,
    sourceOrganization,
    status: req.user.role === "admin" || status === "published"
      ? status
      : "draft",
  });

  await resource.save();
  res.json({ success: true, resource });
});

const deleteResource = asyncHandler(async (req, res) => {
  const resource = await VideoResource.findById(req.params.id);

  if (!resource) {
    res.status(404);
    throw new Error("Video resource not found");
  }

  if (!canManage(resource, req.user)) {
    res.status(403);
    throw new Error("You are not allowed to delete this resource");
  }

  await VideoProgress.deleteMany({ resource: resource._id });
  await resource.deleteOne();
  res.json({ success: true });
});

const updateProgress = asyncHandler(async (req, res) => {
  const resource = await VideoResource.findOne({
    _id: req.params.id,
    status: "published",
  });

  if (!resource) {
    res.status(404);
    throw new Error("Video resource not found");
  }

  if (typeof req.body.completed !== "boolean") {
    res.status(400);
    throw new Error("completed must be a boolean");
  }

  const progress = await VideoProgress.findOneAndUpdate(
    { student: req.user._id, resource: resource._id },
    {
      completed: req.body.completed,
      lastAccessedAt: new Date(),
      completedAt: req.body.completed ? new Date() : null,
    },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );

  res.json({ success: true, progress });
});

const getMyProgress = asyncHandler(async (req, res) => {
  const progress = await VideoProgress.find({ student: req.user._id })
    .populate("resource")
    .sort({ lastAccessedAt: -1 });

  res.json({ success: true, count: progress.length, progress });
});

module.exports = {
  listResources,
  getResource,
  createResource,
  updateResource,
  deleteResource,
  updateProgress,
  getMyProgress,
};
