const Patient = require("../models/Patient");

const createPatient = async (req, res) => {
  try {
    const { name, age, gender, phone, village, district, state } = req.body;

    if (!name || age === undefined || !gender) {
      return res.status(400).json({
        success: false,
        message: "Name, age and gender are required",
      });
    }

    const patient = await Patient.create({
      name,
      age,
      gender,
      phone,
      village,
      district,
      state,
      createdBy: req.user.userId,
    });

    res.status(201).json({
      success: true,
      message: "Patient registered successfully",
      patient,
    });
  } catch (error) {
    console.error("Create patient error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while registering patient",
    });
  }
};

const getPatients = async (req, res) => {
  try {
    const patients = await Patient.find({
      createdBy: req.user.userId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: patients.length,
      patients,
    });
  } catch (error) {
    console.error("Get patients error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while fetching patients",
    });
  }
};

const getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findOne({
      _id: req.params.id,
      createdBy: req.user.userId,
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    res.status(200).json({
      success: true,
      patient,
    });
  } catch (error) {
    console.error("Get patient error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while fetching patient",
    });
  }
};

module.exports = {
  createPatient,
  getPatients,
  getPatientById,
};
