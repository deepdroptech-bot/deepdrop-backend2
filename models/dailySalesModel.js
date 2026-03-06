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
    enum: [1,2,3,4],
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

  meterLitres: {
    type: Number,
    default: 0
  },

  calibrationLitres: {
    type: Number,
    default: 0
  },

  netLitresSold: {
    type: Number,
    default: 0
  },

  calibrationReason: String,

  calibratedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }

},
{ _id:false }
);

/* ---------- GENERIC METER SCHEMA (AGO) ---------- */
const meterSaleSchema = new mongoose.Schema(
  {
    openingMeter: Number,
    closingMeter: Number,
    calibrationLitres: {
      type: Number,
      default: 0
    },
    calibrationReason: String,
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
      validator: v => v.length === 4,
      message: "PMS must have exactly 4 pumps"
    }
  },

  pricePerLitre: {
    type: Number,
    required: true
  },

  totalMeterLitres: Number,
  totalCalibrationLitres: Number,
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

let totalMeterLitres = 0;
let totalCalibrationLitres = 0;
let totalNetLitres = 0;

this.PMS.pumps.forEach(pump => {

  // litres from meter
  pump.meterLitres =
    pump.closingMeter - pump.openingMeter;

  // net litres after calibration
  pump.netLitresSold =
    pump.meterLitres - pump.calibrationLitres;

  totalMeterLitres += pump.meterLitres;

  totalCalibrationLitres += pump.calibrationLitres;

  totalNetLitres += pump.netLitresSold;
});

this.PMS.totalMeterLitres = totalMeterLitres;

this.PMS.totalCalibrationLitres = totalCalibrationLitres;

this.PMS.totalLitres = totalNetLitres;

this.PMS.totalAmount =
  totalNetLitres * this.PMS.pricePerLitre;

  /* ========= AGO CALCULATIONS ========= */

if (this.AGO.openingMeter != null && this.AGO.closingMeter != null) {
  this.AGO.litresSold =
    this.AGO.closingMeter - this.AGO.openingMeter - this.AGO.calibrationLitres;

  this.AGO.totalAmount =
    this.AGO.litresSold * this.AGO.pricePerLitre;
} else {
  this.AGO.litresSold = 0;
  this.AGO.totalAmount = 0;
}
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