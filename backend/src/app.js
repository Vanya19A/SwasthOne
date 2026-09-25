const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const authRoutes = require("./routes/authRoutes");
const patientRoutes = require("./routes/patientRoutes");
const screeningRoutes = require("./routes/screeningRoutes");
const rppgRoutes = require("./routes/rppgRoutes");
const triageRoutes = require("./routes/triageRoutes");
const referralRoutes = require("./routes/referralRoutes");
const facilityRoutes = require("./routes/facilityRoutes");
const followUpRoutes = require("./routes/followUpRoutes");
const recordRoutes = require("./routes/recordRoutes");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "SwasthOne backend is running",
  });
});

// Authentication routes
app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/screenings", screeningRoutes);
app.use("/api/rppg", rppgRoutes);
app.use("/api/triage", triageRoutes);
app.use("/api/referrals", referralRoutes);
app.use("/api/facilities", facilityRoutes);
app.use("/api/followups", followUpRoutes);
app.use("/api/records", recordRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, message: "Internal server error" });
});

module.exports = app;
