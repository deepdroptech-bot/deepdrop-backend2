// controllers/retainedEarningsController.js
const RetainedEarnings = require("../models/retainedEarnings");

exports.initializeRetainedEarnings = async (req, res) => {
  try {
    // Check if it already exists
    const existing = await RetainedEarnings.findOne();
    if (existing) {
      return res.status(400).json({
        msg: "Retained earnings already initialized"
      });
    }

    const retained = await RetainedEarnings.create({
      balance: 0,
      lastUpdatedBy: req.user.id
    });

    res.status(201).json({
      msg: "Retained earnings initialized successfully",
      retained
    });

  } catch (error) {
    res.status(500).json({
      msg: "Failed to initialize retained earnings",
      error: error.message
    });
  }
};

exports.getRetainedEarnings = async (req, res) => {
  try {
    const retained = await RetainedEarnings.findOne().populate(
      "lastUpdatedBy",
      "name email"
    );
    if (!retained) {
      return res.status(404).json({ msg: "Retained earnings not found" });
    }
    res.json({ retained });
  } catch (error) {
    res.status(500).json({
      msg: "Failed to fetch retained earnings",
        error: error.message
    });
  }
};