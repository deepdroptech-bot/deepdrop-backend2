const mongoose = require("mongoose");

const retainedEarningsSchema = new mongoose.Schema(
  {
    balance: {
      type: Number,
      default: 0
    },

    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("RetainedEarnings", retainedEarningsSchema);
