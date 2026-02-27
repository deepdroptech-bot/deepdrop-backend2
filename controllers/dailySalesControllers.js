const DailySales = require("../models/dailySalesModel");
const Inventory = require("../models/inventoryModel");
const BankBalance = require("../models/bankModel");

//create daily sales record as draft

exports.createDailySales = async (req, res) => {
  try {
    const sales = await DailySales.create({
      ...req.body,
      createdBy: req.user.id,
      approvalStatus: "draft"
    });

    res.status(201).json({
      msg: "Daily sales created as draft",
      sales
    });
  } catch (error) {
    res.status(500).json({
      msg: "Failed to create daily sales",
      error: error.message
    });
  }
};

//submit daily sales for approval
exports.submitDailySales = async (req, res) => {
  try {
    const sales = await DailySales.findById(req.params.id);

    if (!sales) {
      return res.status(404).json({ msg: "Sales not found" });
    }

    if (sales.approvalStatus !== "draft") {
      return res.status(400).json({
        msg: "Sales already submitted or approved"
      });
    }

    sales.approvalStatus = "submitted";
    sales.submittedBy = req.user.id;
    sales.submittedAt = new Date();

    await sales.save();

    res.json({ msg: "Daily sales submitted for approval" });
  } catch (error) {
    res.status(500).json({
      msg: "Failed to submit daily sales",
      error: error.message
    });
  }
};

exports.approveDailySales = async (req, res) => {
  try {
    const sales = await DailySales.findById(req.params.id);
    if (!sales) {
      return res.status(404).json({ msg: "Sales not found" });
    }

    if (sales.approvalStatus !== "submitted") {
      return res.status(400).json({
        msg: "Sales must be submitted before approval"
      });
    }

    // ✅ FETCH INVENTORY & BANK
    const inventory = await Inventory.findOne();
    const bank = await BankBalance.findOne();

    if (!inventory || !bank) {
      return res.status(400).json({
        msg: "Inventory or Bank record not initialized"
      });
    }

    /* ===== INVENTORY UPDATE ===== */
    inventory.fuel.PMS.totalQuantity -= sales.PMS.totalLitres;
    inventory.fuel.AGO.quantityLitres -= sales.AGO.litresSold;

    //divide totallitres sold across wells proportionally
    const pmsWells = inventory.fuel.PMS.wells;
    const totalPMSInInventory = pmsWells.reduce(
      (sum, well) => sum + well.quantity,
      0
    );
    pmsWells.forEach(well => {
      const proportion =
        totalPMSInInventory > 0
          ? well.quantity / totalPMSInInventory
          : 0;
      const litresToDeduct = sales.PMS.totalLitres * proportion;
      well.quantity -= litresToDeduct;
      if (well.quantity < 0) well.quantity = 0; //prevent negative stock
    });

  //deduct products sold from inventory stock
 if (Array.isArray(sales.productsSold)) {
  sales.productsSold.forEach(soldItem => {
    const slot = inventory.products.slots.find(
      s => s.itemName === soldItem.itemName
    );

    if (!slot) {
      throw new Error(`Product not found in inventory: ${soldItem.itemName}`);
    }

    if (slot.quantity < soldItem.quantitySold) {
      throw new Error(`Insufficient stock for ${soldItem.itemName}`);
    }

    slot.quantity -= soldItem.quantitySold;
  });
}

    //

    /* ===== BANK UPDATE ===== */
    bank.PMS += sales.PMS.netSales;
    bank.AGO += sales.AGO.netSales;
    bank.otherIncome += sales.totalOtherIncome;
    bank.products += sales.totalProductsSales;

    await inventory.save();
    await bank.save();

    /* ===== APPROVAL ===== */
    sales.approvalStatus = "approved";
    sales.approvedBy = req.user.id;
    sales.approvedAt = new Date();
    sales.isLocked = true;

    await sales.save();

    res.json({ msg: "Daily sales approved and locked" });

  } catch (error) {
    console.error("APPROVE DAILY SALES ERROR:", error);
    res.status(500).json({
      msg: "Failed to approve daily sales",
      error: error.message
    });
  }
};

//get submitted daily sales for approval
exports.getSubmittedDailySales = async (req, res) => {
  try {
    const salesRecords = await DailySales.find({
      approvalStatus: "submitted",
      isDeleted: false
    }).populate("createdBy", "name email role");
    res.json({ count: salesRecords.length, salesRecords });
  } catch (error) {
    console.error("FETCH SUBMITTED DAILY SALES ERROR:", error);
    res.status(500).json({
      msg: "Failed to fetch submitted daily sales",
      error: error.message
    });
  }
};

// get daily sales by date
exports.getDailySalesByDate = async (req, res) => {
  try {
    const { date } = req.query; // ✅ use query, not params
    if (!date) {
      return res.status(400).json({ msg: "Date query parameter is required (YYYY-MM-DD)" });
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ msg: "Invalid date format. Use YYYY-MM-DD" });
    }

    const startOfDay = new Date(parsedDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(parsedDate.setHours(23, 59, 59, 999));

    const salesRecord = await DailySales.find({
      salesDate: { $gte: startOfDay, $lte: endOfDay },
      isDeleted: false
    });

    if (!salesRecord.length) {
      return res.status(404).json({ msg: "No sales record found for this date" });
    }

    res.json({ date, count: salesRecord.length, sales: salesRecord });
  } catch (error) {
    console.error("FETCH DAILY SALES ERROR:", error);
    res.status(500).json({
      msg: "Failed to fetch daily sales",
      error: error.message
    });
  }
};

//get daily sales by id
exports.getSingleDailySales = async (req, res) => {
  try {
    const sales = await DailySales.findById(req.params.id)
      .populate("createdBy", "name email role");

    if (!sales) {
      return res.status(404).json({ msg: "Daily sales not found" });
    }

    res.json(sales);
  } catch (error) {
  console.error("FETCH DAILY SALES ERROR:", error);
  res.status(500).json({
    msg: "Failed to fetch daily sales",
    error: error.message
  });
}

};

//get all daily sales (with pagination, filtering by date range and approval status)
exports.getAllDailySales = async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate, approvalStatus } = req.query;
    const filter = { isDeleted: false };

    if (startDate && endDate) {
      filter.salesDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (approvalStatus) {
      filter.approvalStatus = approvalStatus;
    }

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;

    const skip = (pageNum - 1) * limitNum;
    const salesRecords = await DailySales.find(filter)
      .populate("createdBy", "name email role")
      .sort({ salesDate: -1 })
      .skip(skip)
      .limit(Number(limit));

    const totalRecords = await DailySales.countDocuments(filter);

    res.json({
      page: Number(page),
      limit: Number(limit),
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit),
      salesRecords
    });
  } catch (error) {
    console.error("FETCH ALL DAILY SALES ERROR:", error);
    res.status(500).json({
      msg: "Failed to fetch all daily sales",
      error: error.message
    });
  }
};

//summary of daily sales
exports.getDailySalesSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ msg: "Start and end dates are required" });
    }

    const sales = await DailySales.find({
      salesDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    });

    let totalPMSLitres = 0;
    let totalAGOLitres = 0;
    let totalSales = 0;
    let totalExpenses = 0;
    let netSales = 0;

    sales.forEach(day => {
      totalPMSLitres += day.PMS.litresSold;
      totalAGOLitres += day.AGO.litresSold;
      totalSales += day.totalSalesAmount;
      totalExpenses += day.totalExpenses;
      netSales += day.netSales;
    });

    res.json({
      period: { startDate, endDate },
      daysCount: sales.length,
      totals: {
        totalPMSLitres,
        totalAGOLitres,
        totalSales,
        totalExpenses,
        netSales
      }
    });
  } catch (error) {
    res.status(500).json({ msg: "Failed to generate summary" });
  }
};

//summary of daily sales (PMS only)
exports.getDailySalesSummaryPMS = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ msg: "Start and end dates are required" });
    }

    const sales = await DailySales.find({
      salesDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    });

    let totalPMSLitres = 0;
    let totalSales = 0;
    let totalExpenses = 0;
    let netSales = 0;

    sales.forEach(day => {
      totalPMSLitres += day.PMS.litresSold;
      totalSales += day.totalSalesAmount;
      totalExpenses += day.totalExpenses;
      netSales += day.netSales;
    });

    res.json({
      period: { startDate, endDate },
      daysCount: sales.length,
      totals: {
        totalPMSLitres,
        totalSales,
        totalExpenses,
        netSales
      }
    });
  } catch (error) {
    res.status(500).json({ msg: "Failed to generate PMS summary" });
  }
};

//update daily sales
exports.updateDailySales = async (req, res) => {
  try {
    const sales = await DailySales.findById(req.params.id);

    if (!sales) {
      return res.status(404).json({ msg: "Sales record not found" });
    }

    if (sales.isLocked) {
      return res.status(403).json({
        msg: "Approved sales cannot be edited"
      });
    }

    Object.assign(sales, req.body);
    sales.updatedBy = req.user.id;
    sales.updatedAt = new Date();
    sales.updateReason = req.body.updateReason;

    await sales.save();

    res.json({
      msg: "Daily sales updated",
      sales
    });
  } catch (error) {
    res.status(500).json({
      msg: "Failed to update daily sales",
      error: error.message
    });
  }
};

//delete daily sales(soft delete) admin only
exports.softDeleteDailySales = async (req, res) => {
  try {
    const sales = await DailySales.findById(req.params.id);

    if (!sales) {
      return res.status(404).json({ msg: "Sales not found" });
    }

    if (sales.isLocked) {
      return res.status(403).json({
        msg: "Approved sales cannot be deleted"
      });
    }

    sales.isDeleted = true;
    sales.deletedBy = req.user.id;
    sales.deletedAt = new Date();
    sales.deleteReason = req.body.deleteReason;

    await sales.save();

    res.json({ msg: "Daily sales deleted (soft)" });
  } catch (error) {
    res.status(500).json({
      msg: "Failed to delete daily sales",
      error: error.message
    });
  }
};
