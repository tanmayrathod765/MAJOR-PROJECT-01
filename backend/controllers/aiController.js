const asyncHandler = require("../utils/asyncHandler");
const { requestChat, requestRiskProfile } = require("../services/aiClient");

const fallbackAnswer = (message) => {
  const text = message.toLowerCase();
  if (text.includes("earthquake")) {
    return "During an earthquake, Drop, Cover, and Hold On. Stay away from windows, do not use lifts, and follow official instructions after the shaking stops.";
  }
  if (text.includes("fire")) {
    return "Raise the alarm, leave by the nearest safe exit, stay low in smoke, and never use a lift. Do not re-enter until authorities say it is safe.";
  }
  if (text.includes("flood")) {
    return "Move to higher ground, avoid walking or driving through floodwater, and follow official evacuation instructions. Keep essential medicines and drinking water with you.";
  }
  if (text.includes("heat")) {
    return "Drink water regularly, avoid strenuous activity during peak heat, use shade or a cool room, and check on people who may need help.";
  }
  return "Review your evacuation plan, keep an emergency kit ready, and follow official local alerts. For an immediate threat, contact local emergency services.";
};

const chat = asyncHandler(async (req, res) => {
  const { message, location, context } = req.body;
  if (typeof message !== "string" || message.trim().length < 2 || message.length > 2000) {
    res.status(400);
    throw new Error("Message must be between 2 and 2000 characters");
  }

  try {
    const result = await requestChat({
      message: message.trim(),
      location,
      context: { ...context, userRole: req.user.role },
    });
    res.json({ success: true, ...result });
  } catch (error) {
    if (error.name === "AbortError") {
      res.status(504);
      throw new Error("AI assistant timed out. Please try again.");
    }
    if (error.status === 429) {
      res.status(429);
      throw new Error("AI assistant is busy. Please try again shortly.");
    }
    res.json({
      success: true,
      answer: fallbackAnswer(message),
      category: context?.disasterType || "general",
      riskSummary:
        "The AI service is not connected. This is general educational guidance, not a live warning.",
      preventiveActions: ["Review your evacuation plan", "Keep an emergency kit ready"],
      emergencyPrecautions: [
        "Follow local authorities",
        "Contact emergency services for immediate danger",
      ],
      sources: ["https://www.ndma.gov.in/"],
      isFallback: true,
      fallbackReason: "AI service unavailable",
    });
  }
});

const riskProfile = asyncHandler(async (req, res) => {
  const location = req.body || {};
  if (
    ["city", "state", "country"].some(
      (field) => location[field] !== undefined && typeof location[field] !== "string"
    )
  ) {
    res.status(400);
    throw new Error("Location fields must be text");
  }
  try {
    const result = await requestRiskProfile(location);
    res.json({ success: true, profile: result });
  } catch {
    res.status(503);
    throw new Error("Risk profile is temporarily unavailable.");
  }
});

module.exports = { chat, riskProfile };
