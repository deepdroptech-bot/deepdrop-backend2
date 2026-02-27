const mongoose = require("mongoose");

/* =========================
   PRODUCT SLOT SCHEMA
========================= */
const productSlotSchema = new mongoose.Schema(
  {
    slotNumber: {
      type: Number,
      required: true
    },
    itemName: {
      type: String,
      default: ""
    },
    quantity: {
      type: Number,
      default: 0
    }
  },
  { _id: false }
);

/* =========================
   PMS WELL SCHEMA
========================= */
const pmsWellSchema = new mongoose.Schema(
  {
    wellNumber: {
      type: Number,
      required: true
    },
    quantity: {
      type: Number,
      default: 0
    }
  },
  { _id: false }
);

/* =========================
   INVENTORY SCHEMA
========================= */
const inventorySchema = new mongoose.Schema(
  {
    fuel: {
      PMS: {
        wells: {
          type: [pmsWellSchema],
          default: () => [
            { wellNumber: 1, quantity: 0 },
            { wellNumber: 2, quantity: 0 }
          ]
        },
        totalQuantity: {
          type: Number,
          default: 0
        }
      },
      AGO: {
        quantityLitres: {
          type: Number,
          default: 0
        }
      }
    },

    products: {
      slots: {
        type: [productSlotSchema],
        default: () =>
          Array.from({ length: 30 }, (_, i) => ({
            slotNumber: i + 1,
            itemName: "",
            quantity: 0
          }))
      }
    },

    /* =========================
       BANK BALANCES
       Tracks cash from each category
    ========================== */
    bank: {
      PMSBalance: { type: Number, default: 0 },
      AGOBalance: { type: Number, default: 0 },
      otherIncomeBalance: { type: Number, default: 0 }
    },

    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    createdAt: {
      type: Date,
      default: Date.now
    },

    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

/* =========================
   HELPER METHOD
   Calculate PMS total automatically
========================= */
inventorySchema.methods.updatePMSTotal = function () {
  this.fuel.PMS.totalQuantity = this.fuel.PMS.wells.reduce(
    (sum, well) => sum + (well.quantity || 0),
    0
  );
};

module.exports = mongoose.model("Inventory", inventorySchema);
