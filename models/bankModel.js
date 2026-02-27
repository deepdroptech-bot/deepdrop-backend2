const mongoose = require("mongoose");

const bankBalanceSchema = new mongoose.Schema(
  {
    PMS: {
      type: Number,
      default: 0
    },

    AGO: {
      type: Number,
      default: 0
    },

     products: {
      type: Number,
      default: 0
    },

    otherIncome: {
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

module.exports = mongoose.model("BankBalance", bankBalanceSchema);