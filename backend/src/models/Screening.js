const mongoose = require("mongoose");

const screeningSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },

    bloodPressure: {
      systolic: {
        type: Number,
        min: 50,
        max: 300,
      },
      diastolic: {
        type: Number,
        min: 30,
        max: 200,
      },
    },

    heartRate: {
      type: Number,
      min: 30,
      max: 220,
    },

    temperature: {
      type: Number,
      min: 25,
      max: 45,
    },

    symptoms: [
      {
        type: String,
        trim: true,
      },
    ],

    notes: {
      type: String,
      trim: true,
    },

    rppg: {
      heartRate: {
        type: Number,
        min: 30,
        max: 220,
      },
      motion: {
        type: Number,
        min: 0,
      },
      trustScore: {
        type: Number,
        min: 0,
        max: 1,
      },
    },

    triageLevel: {
      type: String,
      enum: ["routine", "consult", "urgent"],
    },

    screenedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Screening", screeningSchema);
