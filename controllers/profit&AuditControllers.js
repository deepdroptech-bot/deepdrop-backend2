const DailySales = require("../models/dailySalesModel");

exports.getDailyProfitReport = async (req, res) => {
  try {
    const { date } = req.params;

    if (!date) {
      return res.status(400).json({ msg: "Date query is required" });
    }

    const queryDate = new Date(date);
    if (isNaN(queryDate.getTime())) {
      return res.status(400).json({ msg: "Invalid date format" });
    }

    const startOfDay = new Date(queryDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(queryDate);
    endOfDay.setHours(23, 59, 59, 999);

    const report = await DailySales.findOne({
      salesDate: { $gte: startOfDay, $lte: endOfDay },
      isDeleted: false,
      approvalStatus: "approved"
    })
      .populate("createdBy", "name role")
      .populate("approvedBy", "name role");

    if (!report) {
      return res.status(404).json({ msg: "No approved sales for this date" });
    }

    res.json({
      salesDate: report.salesDate,
      PMS: {
        litres: report.PMS.totalLitres,
        price: report.PMS.pricePerLitre,
        revenue: report.PMS.totalAmount,
        expenses: report.PMS.totalExpenses,
        netProfit: report.PMS.netSales
      },
      AGO: {
        litres: report.AGO.litresSold,
        price: report.AGO.pricePerLitre,
        revenue: report.AGO.totalAmount,
        expenses: report.AGO.totalExpenses,
        netProfit: report.AGO.netSales
      },
      otherIncome: report.totalOtherIncome,
      totalNetProfit:
        report.PMS.netSales +
        report.AGO.netSales +
        report.totalOtherIncome
    });

  } catch (error) {
    res.status(500).json({
      msg: "Failed to fetch daily profit report",
      error: error.message
    });
  }
};

exports.getProfitSummary = async (req, res) => {
  try {
    const { from, to } = req.query;

    const summary = await DailySales.aggregate([
      {
        $match: {
          salesDate: {
            $gte: new Date(from),
            $lte: new Date(to)
          },
          approvalStatus: "approved",
          isDeleted: false
        }
      },
      {
        $group: {
          _id: null,

          totalPMSLitres: { $sum: "$PMS.totalLitres" },
          totalPMSRevenue: { $sum: "$PMS.totalAmount" },
          totalPMSExpenses: { $sum: "$PMS.totalExpenses" },
          totalPMSNet: { $sum: "$PMS.netSales" },

          totalAGOLitres: { $sum: "$AGO.litresSold" },
          totalAGORevenue: { $sum: "$AGO.totalAmount" },
          totalAGOExpenses: { $sum: "$AGO.totalExpenses" }, 
          totalAGONet: { $sum: "$AGO.netSales" },

          totalOtherIncome: { $sum: "$totalOtherIncome" }
        }
      }
    ]);

    if (!summary.length) {
      return res.json({ msg: "No data for selected period" });
    }

    const data = summary[0];

    res.json({
      period: { from, to },
      PMS: {
        litres: data.totalPMSLitres,
        revenue: data.totalPMSRevenue,
        expenses: data.totalPMSExpenses,
        netProfit: data.totalPMSNet
      },
      AGO: {
        litres: data.totalAGOLitres,
        revenue: data.totalAGORevenue,
        expenses: data.totalAGOExpenses,
        netProfit: data.totalAGONet
      },
      otherIncome: data.totalOtherIncome,
      grandTotalProfit:
        data.totalPMSNet +
        data.totalAGONet +
        data.totalOtherIncome
    });

  } catch (error) {
    res.status(500).json({ msg: "Failed to generate profit summary" });
  }
};


exports.getAuditTrail = async (req, res) => {
  try {

    const start = new Date(req.params.date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(req.params.date);
    end.setHours(23, 59, 59, 999);

    const record = await DailySales.findOne({
      salesDate: { $gte: start, $lte: end }
    })
      .populate("createdBy", "name role")
      .populate("submittedBy", "name role")
      .populate("approvedBy", "name role")
      .populate("updatedBy", "name role")
      .populate("deletedBy", "name role");

    if (!record) {
      return res.status(404).json({
        msg: "Sales record not found"
      });
    }

    res.json({
      salesDate: record.salesDate,
      createdBy: record.createdBy,
      submittedBy: record.submittedBy,
      approvedBy: record.approvedBy,
      updatedBy: record.updatedBy,
      updateReason: record.updateReason,
      deleted: record.isDeleted,
      deletedBy: record.deletedBy,
      deleteReason: record.deleteReason
    });

  } catch (error) {
    console.error("Audit Trail Error:", error);
    res.status(500).json({
      msg: "Failed to fetch audit trail"
    });
  }
};