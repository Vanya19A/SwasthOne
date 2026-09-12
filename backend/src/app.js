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

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

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

module.exports = app;
