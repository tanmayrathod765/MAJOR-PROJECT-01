const DrillScenario = require("../models/DrillScenario");
const asyncHandler = require("../utils/asyncHandler");

// GET /api/drills
const listScenarios = asyncHandler(async (req, res) => {
  const { disasterType, difficulty } = req.query;

  const filter = {
    isActive: true,
  };

  if (disasterType) {
    filter.disasterType = disasterType;
  }

  if (difficulty) {
    filter.difficulty = difficulty;
  }

  const scenarios = await DrillScenario.find(filter)
    .select("title disasterType difficulty description _id")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: scenarios.length,
    scenarios,
  });
});

// GET /api/drills/:id
const getScenarioById = asyncHandler(async (req, res) => {
  const scenario = await DrillScenario.findOne({
    _id: req.params.id,
    isActive: true,
  });

  if (!scenario) {
    res.status(404);
    throw new Error("Drill scenario not found");
  }

  res.status(200).json({
    success: true,
    scenario,
  });
});

// POST /api/drills
const createScenario = asyncHandler(async (req, res) => {
  const {
    title,
    disasterType,
    difficulty,
    description,
    startNodeId,
    nodes,
    isActive,
  } = req.body;

  if (!title || !disasterType || !difficulty || !startNodeId || !nodes) {
    res.status(400);
    throw new Error(
      "title, disasterType, difficulty, startNodeId and nodes are required"
    );
  }

  if (!Array.isArray(nodes) || nodes.length === 0) {
    res.status(400);
    throw new Error("nodes must be a non-empty array");
  }

  // Get all node IDs
  const nodeIds = new Set(nodes.map((node) => node.nodeId));

  // Validate start node
  if (!nodeIds.has(startNodeId)) {
    res.status(400);
    throw new Error(
      `Invalid startNodeId: "${startNodeId}" does not exist in nodes`
    );
  }

  // Validate every option's nextNodeId
  for (const node of nodes) {
    if (!node.nodeId || !node.situationText) {
      res.status(400);
      throw new Error(
        "Every node must have nodeId and situationText"
      );
    }

    if (!node.isEnding && (!node.options || node.options.length === 0)) {
      res.status(400);
      throw new Error(
        `Non-ending node "${node.nodeId}" must have at least one option`
      );
    }

    if (node.options && Array.isArray(node.options)) {
      for (const option of node.options) {
        if (!option.optionText || !option.nextNodeId) {
          res.status(400);
          throw new Error(
            `Every option in node "${node.nodeId}" must have optionText and nextNodeId`
          );
        }

        if (!nodeIds.has(option.nextNodeId)) {
          res.status(400);
          throw new Error(
            `Invalid nextNodeId: "${option.nextNodeId}" in node "${node.nodeId}"`
          );
        }
      }
    }
  }

  const scenario = await DrillScenario.create({
    title,
    disasterType,
    difficulty,
    description,
    startNodeId,
    nodes,
    isActive,
  });

  res.status(201).json({
    success: true,
    scenario,
  });
});

module.exports = {
  listScenarios,
  getScenarioById,
  createScenario,
};