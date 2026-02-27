const mongoose = require("mongoose");

/* ---------- OTHER SCHEMAS ---------- */
const expenseSchema = new mongoose.Schema(
  {
    description: String,
    amount: Number
  },
  { _id: false }
);

const otherIncomeSchema = new mongoose.Schema(
  {
    itemName: String,
    amount: Number
  },
  { _id: false }
);

//products sold
const productSoldSchema = new mongoose.Schema(
  {
    itemName: {
      type: String
    },
    quantitySold: {
      type: Number
    },
    pricePerUnit: {
      type: Number
    },
    totalAmount: {
      type: Number,
      default: 0
    }
  },
  { _id: false }
);


/* ---------- PMS PUMP SCHEMA ---------- */
const pmsPumpSchema = new mongoose.Schema(
  {
    pumpNumber: {
      type: Number,
      enum: [1, 2],
      required: true
    },

    openingMeter: {
      type: Number,
      required: true
    },

    closingMeter: {
      type: Number,
      required: true
    },

    litresSold: {
      type: Number,
      default: 0
    }
  },
  { _id: false }
);

/* ---------- GENERIC METER SCHEMA (AGO) ---------- */
const meterSaleSchema = new mongoose.Schema(
  {
    openingMeter: Number,
    closingMeter: Number,
    litresSold: Number,
    pricePerLitre: Number,
    totalAmount: Number,

  expenses: [expenseSchema],
  totalExpenses: {
    type: Number,
    default: 0
  },

  netSales: Number
},

  { _id: false }
);

/* ---------- DAILY SALES ---------- */
const dailySalesSchema = new mongoose.Schema(
  {
    salesDate: {
      type: Date,
      required: true,
      unique: true
    },

PMS: {
  pumps: {
    type: [pmsPumpSchema],
    validate: {
      validator: v => v.length === 2,
      message: "PMS must have exactly 2 pumps"
    }
  },

  pricePerLitre: {
    type: Number,
    required: true
  },

  totalLitres: Number,
  totalAmount: Number,

  expenses: [expenseSchema],
  totalExpenses: {
    type: Number,
    default: 0
  },

  netSales: Number
},

    AGO: meterSaleSchema,

  productsSold: [productSoldSchema],

totalProductsSales: {
  type: Number,
  default: 0
},


    otherIncome: [otherIncomeSchema],

    totalSalesAmount: Number,
    totalExpenses: Number,
    netSales: Number,
    totalOtherIncome: Number,

    //notes
    notes: [String],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    approvalStatus: {
  type: String,
  enum: ["draft", "submitted", "approved"],
  default: "draft"
},

submittedBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User"
},

submittedAt: {
  type: Date
},

approvedBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User"
},

approvedAt: {
  type: Date
},

isLocked: {
  type: Boolean,
  default: false
},


    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    updateReason: String,

    isDeleted: {
      type: Boolean,
      default: false
    },

    deletedAt: Date,
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    deleteReason: String
  },
  { timestamps: true }
);

/* =========================
   PRE-SAVE CALCULATIONS
========================= */

dailySalesSchema.pre("save", function (next) {
  /* ========= PMS CALCULATIONS ========= */
  let pmsTotalLitres = 0;

  this.PMS.pumps.forEach(pump => {
    pump.litresSold = pump.closingMeter - pump.openingMeter;
    pmsTotalLitres += pump.litresSold;
  });

  this.PMS.totalLitres = pmsTotalLitres;
  this.PMS.totalAmount =
    pmsTotalLitres * this.PMS.pricePerLitre;

  this.PMS.totalExpenses = this.PMS.expenses.reduce(
    (sum, e) => sum + e.amount,
    0
  );

  this.PMS.netSales =
    this.PMS.totalAmount - this.PMS.totalExpenses;

  /* ========= AGO CALCULATIONS ========= */
  this.AGO.litresSold =
    this.AGO.closingMeter - this.AGO.openingMeter;

  this.AGO.totalAmount =
    this.AGO.litresSold * this.AGO.pricePerLitre;

  this.AGO.totalExpenses = this.AGO.expenses.reduce(
    (sum, e) => sum + e.amount,
    0
  );

  this.AGO.netSales =
    this.AGO.totalAmount - this.AGO.totalExpenses;

  /* ========= TOTALS ========= */
  this.totalSalesAmount =
    this.PMS.totalAmount + this.AGO.totalAmount;

  this.totalExpenses =
    this.PMS.totalExpenses + this.AGO.totalExpenses;

  this.netSales =
    this.PMS.netSales + this.AGO.netSales;

  /* ========= OTHER INCOME ========= */
  this.totalOtherIncome = this.otherIncome.reduce(
    (sum, i) => sum + i.amount,
    0
  );

  // ===== PRODUCTS SOLD =====
let productsTotal = 0;

if (Array.isArray(this.productsSold)) {
  this.productsSold.forEach(product => {
    product.totalAmount =
      product.quantitySold * product.pricePerUnit;

    productsTotal += product.totalAmount;
  });
}

this.totalProductsSales = productsTotal;

  next();
});

module.exports = mongoose.model("DailySales", dailySalesSchema);