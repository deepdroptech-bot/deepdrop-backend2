const mongoose = require("mongoose");

const expenseItemSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    category: {
      type: String,
      enum: ["PMS", "AGO", "products", "General"],
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const expenseDocumentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },

    periodStart: {
      type: Date,
      default: Date.now
    },

    periodEnd: {
      type: Date
    },

    expenses: {
      type: [expenseItemSchema],
      default: []
    },

    totalAmount: {
      type: Number,
      default: 0
    },

    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open"
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    closedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    closedAt: {
      type: Date
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ExpenseDocument", expenseDocumentSchema);