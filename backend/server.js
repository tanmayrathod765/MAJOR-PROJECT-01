require("dotenv").config();
const authRoutes = require("./routes/authRoutes");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const institutionRoutes = require("./routes/institutionRoutes");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");
const drillScenarioRoutes = require("./routes/drillScenarioRoutes");
const drillAttemptRoutes = require("./routes/drillAttemptRoutes");
const drillSessionRoutes = require("./routes/drillSessionRoutes");
const app = express();
const lessonRoutes = require("./routes/lessonRoutes");
const videoRoutes = require("./routes/videoRoutes");
const aiRoutes = require("./routes/aiRoutes");
const alertRoutes = require("./routes/alertRoutes");
const { startAlertPolling } = require("./services/alertSyncService");
// Connect to MongoDB
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use("/api/drills", drillScenarioRoutes);
app.use("/api/attempts", drillAttemptRoutes);
app.use("/api/sessions", drillSessionRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/alerts", alertRoutes);
// Health Check Route
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
  });
});

// Error Handler
app.use("/api/auth", authRoutes);
app.use(errorHandler);
app.use("/api/institutions", institutionRoutes);

// Server Port
const PORT = process.env.PORT || 5000;

// Start Server
app.listen(PORT, () => {
  console.log(`DisasterReady server running on port ${PORT}`);
  startAlertPolling();
});