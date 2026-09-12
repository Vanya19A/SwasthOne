const FollowUp = require("../models/FollowUp");
const Patient = require("../models/Patient");
const Referral = require("../models/Referral");

const createFollowUp = async (req, res) => {
  try {
    const { patientId, referralId, scheduledDate, notes } = req.body;

    if (!patientId || !referralId || !scheduledDate) {
      return res.status(400).json({
        success: false,
        message: "patientId, referralId and scheduledDate are required",
      });
    }

    const patient = await Patient.findOne({
      _id: patientId,
      createdBy: req.user.userId,
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    const referral = await Referral.findOne({
      _id: referralId,
      patient: patientId,
      referredBy: req.user.userId,
    });

    if (!referral) {
      return res.status(404).json({
        success: false,
        message: "Referral not found",
      });
    }

    const followUp = await FollowUp.create({
      patient: patientId,
      referral: referralId,
      scheduledDate,
      notes,
      createdBy: req.user.userId,
    });

    const populatedFollowUp = await FollowUp.findById(followUp._id)
      .populate("patient", "name age gender phone village district state")
      .populate(
        "referral",
        "triageCategory facilityId preferredDate reason status",
      )
      .populate("createdBy", "name email role");

    return res.status(201).json({
      success: true,
      message: "Follow-up created successfully",
      followUp: populatedFollowUp,
    });
  } catch (error) {
    console.error("Create follow-up error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while creating follow-up",
    });
  }
};

const getFollowUpById = async (req, res) => {
  try {
    const followUp = await FollowUp.findOne({
      _id: req.params.id,
      createdBy: req.user.userId,
    })
      .populate("patient", "name age gender phone village district state")
      .populate(
        "referral",
        "triageCategory facilityId preferredDate reason status",
      )
      .populate("createdBy", "name email role");

    if (!followUp) {
      return res.status(404).json({
        success: false,
        message: "Follow-up not found",
      });
    }

    return res.status(200).json({
      success: true,
      followUp,
    });
  } catch (error) {
    console.error("Get follow-up error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching follow-up",
    });
  }
};

module.exports = {
  createFollowUp,
  getFollowUpById,
};
