const mongoose = require("mongoose");

/* ===========================
   OTHER SCHEMAS
=========================== */

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

const productSoldSchema = new mongoose.Schema(
  {
    itemName: String,
    quantitySold: Number,
    pricePerUnit: Number,
    totalAmount: { type: Number, default: 0 }
  },
  { _id: false }
);

/* ===========================
   PMS PRICE SEGMENT
=========================== */
const priceSegmentSchema = new mongoose.Schema(
  {
    pricePerLitre: { type: Number, required: true },
    startTime: Date
  },
  { _id: false }
);

/* ===========================
   PUMP SALES SEGMENT
=========================== */
const pumpSaleSchema = new mongoose.Schema(
  {
    openingMeter: { type: Number, required: true },
    closingMeter: { type: Number, default: 0 },
    priceIndex: { type: Number, required: true },
    meterLitres: { type: Number, default: 0 },
    calibrationLitres: { type: Number, default: 0 },
    netLitresSold: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    calibrationReason: String,
    calibratedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { _id: false }
);

/* ===========================
   PMS PUMP
=========================== */
const pmsPumpSchema = new mongoose.Schema(
  {
    pumpNumber: { type: Number, enum: [1, 2, 3, 4], required: true },
    sales: [pumpSaleSchema],
    totalLitres: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 }
  },
  { _id: false }
);

/* ===========================
   AGO
=========================== */
const meterSaleSchema = new mongoose.Schema(
  {
    openingMeter: Number,
    closingMeter: Number,
    calibrationLitres: { type: Number, default: 0 },
    litresSold: Number,
    pricePerLitre: Number,
    totalAmount: Number,
    expenses: [expenseSchema],
    totalExpenses: { type: Number, default: 0 },
    ANetSales: Number
  },
  { _id: false }
);

/* ===========================
   HELPER FUNCTIONS
=========================== */

// Sync pump segments for new price changes (same day)
function syncPumpSegments(doc) {
  const priceCount = doc.PMS.priceSegments.length;

  doc.PMS.pumps.forEach((pump) => {
    if (!pump.sales) pump.sales = [];

    // First segment
    if (pump.sales.length === 0) {
      pump.sales.push({
        openingMeter: 0,
        closingMeter: 0,
        priceIndex: 0,
        calibrationLitres: 0
      });
    }

    // Add new segments if price added
    while (pump.sales.length < priceCount) {
      const last = pump.sales[pump.sales.length - 1];
      pump.sales.push({
        openingMeter: last.closingMeter || last.openingMeter,
        closingMeter: 0,
        priceIndex: pump.sales.length,
        calibrationLitres: 0
      });
    }

    // Remove extra segments if needed
    if (pump.sales.length > priceCount) {
      pump.sales = pump.sales.slice(0, priceCount);
    }

    // Auto carry forward between segments
    for (let i = 1; i < pump.sales.length; i++) {
      const prev = pump.sales[i - 1];
      const current = pump.sales[i];
      if (prev.closingMeter) current.openingMeter = prev.closingMeter;
    }
  });
}

// Carry forward closing meters from previous day
async function carryForwardPreviousDayMeters(doc) {
  const DailySales = mongoose.model("DailySales");

  const previousDay = new Date(doc.salesDate);
  previousDay.setDate(previousDay.getDate() - 1);

  const prevSales = await DailySales.findOne({
    salesDate: previousDay,
    isDeleted: false
  });

  if (!prevSales) return;

  doc.PMS.pumps.forEach((pump) => {
    const prevPump = prevSales.PMS.pumps.find((p) => p.pumpNumber === pump.pumpNumber);
    if (!prevPump) return;

    const lastSegment = prevPump.sales[prevPump.sales.length - 1];
    if (!lastSegment) return;

    // Set first segment opening meter
    if (pump.sales.length) {
      pump.sales[0].openingMeter = lastSegment.closingMeter || lastSegment.openingMeter;
    }
  });
}

/* ===========================
   DAILY SALES SCHEMA
=========================== */
const dailySalesSchema = new mongoose.Schema(
  {
    salesDate: { type: Date, required: true, unique: true },

    PMS: {
      priceSegments: [priceSegmentSchema],
      pumps: [pmsPumpSchema],
      totalLitres: Number,
      totalAmount: Number,
      expenses: [expenseSchema],
      totalExpenses: { type: Number, default: 0 },
      pNetSales: Number
    },

    AGO: meterSaleSchema,

    productsSold: [productSoldSchema],
    totalProductsSales: { type: Number, default: 0 },

    otherIncome: [otherIncomeSchema],
    totalOtherIncome: Number,

    totalSalesAmount: Number,
    totalExpenses: Number,
    netSales: Number,

    notes: [String],

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    approvalStatus: { type: String, enum: ["draft", "submitted", "approved"], default: "draft" },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    submittedAt: Date,
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvedAt: Date,
    isLocked: { type: Boolean, default: false },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updateReason: String,
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date,
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    deleteReason: String
  },
  { timestamps: true }
);

/* ===========================
   PRE-SAVE CALCULATIONS
=========================== */
dailySalesSchema.pre("save", async function (next) {
  // 1️⃣ Sync pump segments and next day opening meters
  syncPumpSegments(this);
  if (this.isNew) {
    await carryForwardPreviousDayMeters(this);
  }

  /* ===== PMS CALCULATIONS ===== */
  let pmsTotalLitres = 0;
  let pmsTotalAmount = 0;

  this.PMS.pumps.forEach((pump) => {
    let pumpLitres = 0;
    let pumpAmount = 0;

    pump.sales.forEach((segment) => {
      // Validation
      if (segment.closingMeter < segment.openingMeter) {
        throw new Error(`Pump ${pump.pumpNumber} closing meter cannot be less than opening meter`);
      }

      segment.meterLitres = (segment.closingMeter || 0) - segment.openingMeter;
      segment.netLitresSold = segment.meterLitres - segment.calibrationLitres;

      const price = this.PMS.priceSegments[segment.priceIndex]?.pricePerLitre || 0;
      segment.totalAmount = segment.netLitresSold * price;

      pumpLitres += segment.netLitresSold;
      pumpAmount += segment.totalAmount;
    });

    pump.totalLitres = pumpLitres;
    pump.totalAmount = pumpAmount;

    pmsTotalLitres += pumpLitres;
    pmsTotalAmount += pumpAmount;
  });

  this.PMS.totalLitres = pmsTotalLitres;
  this.PMS.totalAmount = pmsTotalAmount;
  this.PMS.totalExpenses = this.PMS.expenses.reduce((sum, e) => sum + e.amount, 0);
  this.PMS.pNetSales = this.PMS.totalAmount - this.PMS.totalExpenses;

  /* ===== AGO CALCULATIONS ===== */
  if (this.AGO) {
    this.AGO.litresSold = (this.AGO.closingMeter || 0) - (this.AGO.openingMeter || 0) - this.AGO.calibrationLitres;
    this.AGO.totalAmount = this.AGO.litresSold * this.AGO.pricePerLitre;
    this.AGO.totalExpenses = this.AGO.expenses.reduce((sum, e) => sum + e.amount, 0);
    this.AGO.ANetSales = this.AGO.totalAmount - this.AGO.totalExpenses;
  }

  /* ===== PRODUCTS SOLD ===== */
  let productsTotal = 0;
  this.productsSold.forEach((p) => {
    p.totalAmount = p.quantitySold * p.pricePerUnit;
    productsTotal += p.totalAmount;
  });
  this.totalProductsSales = productsTotal;

  /* ===== OTHER INCOME ===== */
  this.totalOtherIncome = this.otherIncome.reduce((sum, i) => sum + i.amount, 0);

  /* ===== TOTALS ===== */
  this.totalSalesAmount = this.PMS.totalAmount + (this.AGO?.totalAmount || 0) + this.totalProductsSales + this.totalOtherIncome;
  this.totalExpenses = this.PMS.totalExpenses + (this.AGO?.totalExpenses || 0);
  this.netSales = this.totalSalesAmount - this.totalExpenses;

  next();
});

module.exports = mongoose.model("DailySales", dailySalesSchema);