const Referral = require("../models/Referral");
const Patient = require("../models/Patient");
const Facility = require("../models/Facility");

const createReferral = async (req, res) => {
  try {
    const { patientId, triageCategory, facilityId, preferredDate, reason } =
      req.body;

    if (
      !patientId ||
      !triageCategory ||
      !facilityId ||
      !preferredDate ||
      !reason
    ) {
      return res.status(400).json({
        success: false,
        message:
          "patientId, triageCategory, facilityId, preferredDate and reason are required",
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
    const facility = await Facility.findOne({
        facilityId,
        isActive: true,
    });

    if (!facility) {
        return res.status(404).json({
        success: false,
        message: "Facility not found or inactive",
    });
    }
    const referral = await Referral.create({
      patient: patient._id,
      triageCategory,
      facilityId,
      preferredDate,
      reason,
      referredBy: req.user.userId,
    });

    const populatedReferral = await Referral.findById(referral._id)
      .populate("patient", "name age gender phone village district state")
      .populate("referredBy", "name email role");

    return res.status(201).json({
      success: true,
      message: "Referral created successfully",
      referral: populatedReferral,
    });
  } catch (error) {
    console.error("Create referral error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while creating referral",
    });
  }
};

const getReferralById = async (req, res) => {
  try {
    const referral = await Referral.findOne({
      _id: req.params.id,
      referredBy: req.user.userId,
    })
      .populate("patient", "name age gender phone village district state")
      .populate("referredBy", "name email role");

    if (!referral) {
      return res.status(404).json({
        success: false,
        message: "Referral not found",
      });
    }

    return res.status(200).json({
      success: true,
      referral,
    });
  } catch (error) {
    console.error("Get referral error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching referral",
    });
  }
};

module.exports = {
  createReferral,
  getReferralById,
};
