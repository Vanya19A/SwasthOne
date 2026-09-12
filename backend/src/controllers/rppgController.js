const Screening = require("../models/Screening");

const saveRppgResult = async (req, res) => {
  try {
    const { screeningId, hr, motion, trustScore } = req.body;

    if (
      !screeningId ||
      hr === undefined ||
      motion === undefined ||
      trustScore === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "screeningId, hr, motion and trustScore are required",
      });
    }

    if (trustScore < 0 || trustScore > 1) {
      return res.status(400).json({
        success: false,
        message: "trustScore must be between 0 and 1",
      });
    }

    const screening = await Screening.findOne({
      _id: screeningId,
      screenedBy: req.user.userId,
    });

    if (!screening) {
      return res.status(404).json({
        success: false,
        message: "Screening not found",
      });
    }

    screening.rppg = {
      heartRate: hr,
      motion,
      trustScore,
    };

    await screening.save();

    res.status(200).json({
      success: true,
      message: "rPPG result saved successfully",
      rppg: screening.rppg,
      screeningId: screening._id,
    });
  } catch (error) {
    console.error("Save rPPG error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while saving rPPG result",
    });
  }
};

module.exports = {
  saveRppgResult,
};
