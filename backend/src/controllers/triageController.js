const Screening = require("../models/Screening");

const createTriage = async (req, res) => {
  try {
    const { screeningId } = req.body;

    if (!screeningId) {
      return res.status(400).json({
        success: false,
        message: "screeningId is required",
      });
    }

    const screening = await Screening.findOne({
      _id: screeningId,
      screenedBy: req.user.userId,
    }).populate("patient", "name age gender");

    if (!screening) {
      return res.status(404).json({
        success: false,
        message: "Screening not found",
      });
    }

    const systolic = screening.bloodPressure?.systolic;
    const diastolic = screening.bloodPressure?.diastolic;
    const heartRate = screening.heartRate;
    const temperature = screening.temperature;
    const trustScore = screening.rppg?.trustScore;

    let triageLevel = "routine";
    const reasons = [];

    // Blood pressure
    if (
      systolic >= 180 ||
      diastolic >= 120 ||
      systolic < 80 ||
      diastolic < 50
    ) {
      triageLevel = "urgent";
      reasons.push("Abnormal blood pressure");
    } else if (systolic >= 140 || diastolic >= 90) {
      if (triageLevel !== "urgent") {
        triageLevel = "consult";
      }
      reasons.push("Elevated blood pressure");
    }

    // Heart rate
    if (heartRate !== undefined) {
      if (heartRate < 40 || heartRate > 150) {
        triageLevel = "urgent";
        reasons.push("Abnormal heart rate");
      } else if (
        (heartRate < 50 || heartRate > 120) &&
        triageLevel !== "urgent"
      ) {
        triageLevel = "consult";
        reasons.push("Elevated or low heart rate");
      }
    }

    // Temperature
    if (temperature !== undefined) {
      if (temperature >= 40 || temperature < 35) {
        triageLevel = "urgent";
        reasons.push("Abnormal temperature");
      } else if (temperature >= 38 || temperature < 36) {
        if (triageLevel !== "urgent") {
          triageLevel = "consult";
        }
        reasons.push("Abnormal temperature");
      }
    }

    // rPPG trust score
    if (trustScore !== undefined && trustScore < 0.5) {
      if (triageLevel === "routine") {
        triageLevel = "consult";
      }
      reasons.push("Low rPPG confidence");
    }

    // Save triage result to screening
    screening.triageLevel = triageLevel;
    await screening.save();

    res.status(200).json({
      success: true,
      message: "Triage assessment completed",
      triage: {
        level: triageLevel,
        reasons,
      },
      screeningId: screening._id,
      patient: screening.patient,
    });
  } catch (error) {
    console.error("Triage error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while processing triage",
    });
  }
};

module.exports = {
  createTriage,
};
