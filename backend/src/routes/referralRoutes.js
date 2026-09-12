const express = require("express");

const {
  createReferral,
  getReferralById,
} = require("../controllers/referralController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createReferral);
router.get("/:id", protect, getReferralById);

module.exports = router;
