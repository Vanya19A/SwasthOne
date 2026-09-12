const express = require("express");

const {
  createFollowUp,
  getFollowUpById,
} = require("../controllers/followUpController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createFollowUp);
router.get("/:id", protect, getFollowUpById);

module.exports = router;
