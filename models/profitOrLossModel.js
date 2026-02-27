const mongoose = require("mongoose");

const pmsPLSchema = new mongoose.Schema(
  {
    periodFrom: {
      type: Date,
      required: true
    },

    periodTo: {
      type: Date,
      required: true
    },

    pmsNetSales: {
      type: Number,
      required: true
    },

    purchaseCost: {
      type: Number,
      required: true
    },

    cashAdjustments: {
      type: Number,
      default: 0
    },

    profitOrLoss: {
      type: Number
    },

    status: {
      type: String,
      enum: ["draft", "submitted", "approved"],
      default: "draft"
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    approvedAt: Date
  },
  { timestamps: true }
);

/* =========================
   AUTO CALCULATION
========================= */
pmsPLSchema.pre("save", function (next) {
  this.profitOrLoss =
    this.pmsNetSales +
    this.cashAdjustments -
    this.purchaseCost;

  next();
});

module.exports = mongoose.model("PMSProfitLoss", pmsPLSchema);