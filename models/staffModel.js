const mongoose = require("mongoose");

const adjustmentSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true
    },
    reason: {
      type: String,
      required: true
    },
    appliedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    appliedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const staffSchema = new mongoose.Schema(
  {
    photo: {
  url: {
    type: String
  },
  publicId: {
    type: String
  }
},

    staffId: {
      type: String,
      required: true,
      unique: true
    },

    firstName: {
      type: String,
      required: true,
      trim: true
    },

    lastName: {
      type: String,
      required: true,
      trim: true
    },

    phone: {
      type: String,
      required: true
    },

    nin: {
      type: String,
      required: true,
    },

    position: {
      type: String,
      enum: ["Pump Attendant", "Cashier", "Supervisor", "Manager", "Accountant", "Security", "Cleaner", "Driver"],
      required: true
    },

    baseSalary: {
      type: Number,
      required: true
    },

     bonuses: [adjustmentSchema],

    deductions: [adjustmentSchema],

    netSalary: {
      type: Number,
      default: 0
    },

    hireDate: {
      type: Date,
      default: Date.now
    },

    employmentStatus: {
      type: String,
      enum: ["active", "inactive", "suspended", "terminated"],
      default: "active"
    },

    isActive: {
      type: Boolean,
      default: true
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    lastUpdatedAt: {
      type: Date
    },

    deactivatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    deactivatedAt: {
      type: Date
    }
     
  },
  { timestamps: true }
);

staffSchema.pre("save", function (next) {
  const totalBonuses = this.bonuses.reduce(
    (sum, b) => sum + b.amount,
    0
  );

  const totalDeductions = this.deductions.reduce(
    (sum, d) => sum + d.amount,
    0
  );

  this.netSalary =
    this.baseSalary + totalBonuses - totalDeductions;

  if (this.netSalary < 0) this.netSalary = 0;

  next();
});


module.exports = mongoose.model("Staff", staffSchema);