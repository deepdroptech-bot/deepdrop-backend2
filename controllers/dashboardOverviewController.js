const PMSPL = require("../models/profitOrLossModel");
const Inventory = require("../models/inventoryModel");
const Audit = require("../models/dailySalesModel");

exports.getExecutiveDashboard = async (req, res) => {
  try {
    /* ===================================
       DATE HELPERS
    =================================== */
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));

    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);

    const startOfMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );

    /* ===================================
       INVENTORY
    =================================== */
    const inventory = await Inventory.findOne();

    const pmsQty = inventory?.fuel?.PMS?.totalQuantity || 0;
    const agoQty = inventory?.fuel?.AGO?.quantityLitres || 0;

    const productSlots = inventory?.products?.slots || [];

    const lowProducts = productSlots.filter(
      p => p.itemName && p.quantity < 10
    );

    const inventoryHealthScore =
      ((pmsQty > 5000 ? 1 : 0) +
        (agoQty > 2000 ? 1 : 0) +
        (lowProducts.length === 0 ? 1 : 0)) / 3 * 100;

    /* ===================================
       TODAY VS YESTERDAY PERFORMANCE
    =================================== */
    const todaySales = await PMSPL.aggregate([
      { $match: { createdAt: { $gte: startOfToday }, status: "approved" } },
      { $group: { _id: null, total: { $sum: "$pmsNetSales" } } }
    ]);

    const yesterdaySales = await PMSPL.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfYesterday, $lt: startOfToday },
          status: "approved"
        }
      },
      { $group: { _id: null, total: { $sum: "$pmsNetSales" } } }
    ]);

    const todayTotal = todaySales[0]?.total || 0;
    const yesterdayTotal = yesterdaySales[0]?.total || 0;

    const growthRate =
      yesterdayTotal === 0
        ? 0
        : ((todayTotal - yesterdayTotal) / yesterdayTotal) * 100;

    /* ===================================
       MONTHLY REVENUE
    =================================== */
    const monthlyRevenue = await PMSPL.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth },
          status: "approved"
        }
      },
      {
        $group: {
          _id: { $dayOfMonth: "$createdAt" },
          revenue: { $sum: "$pmsNetSales" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    /* ===================================
       TOTAL PROFIT & MARGIN
    =================================== */
    const profitData = await PMSPL.aggregate([
      { $match: { status: "approved" } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$pmsNetSales" },
          totalProfit: { $sum: "$profitOrLoss" }
        }
      }
    ]);

    const totalRevenue = profitData[0]?.totalRevenue || 0;
    const totalProfit = profitData[0]?.totalProfit || 0;

    const profitMargin =
      totalRevenue === 0
        ? 0
        : (totalProfit / totalRevenue) * 100;

    /* ===================================
       FUEL BREAKDOWN
    =================================== */
    const fuelBreakdown = await Audit.aggregate([
      {
        $group: {
          _id: null,
          totalPMSLitres: { $sum: "$pmsLitresSold" },
          totalAGOLitres: { $sum: "$agoLitresSold" }
        }
      }
    ]);

    /* ===================================
       RECENT SALES
    =================================== */
    const recentActivities = await Audit.find()
      .sort({ createdAt: -1 })
      .limit(5);

    /* ===================================
       EXECUTIVE SUMMARY
    =================================== */
    const summary =
      growthRate > 0
        ? "Revenue is growing compared to yesterday."
        : growthRate < 0
        ? "Revenue dropped compared to yesterday."
        : "Revenue performance is stable.";

    /* ===================================
       FINAL RESPONSE
    =================================== */
    res.json({
      performance: {
        todayRevenue: todayTotal,
        yesterdayRevenue: yesterdayTotal,
        growthRate: growthRate.toFixed(2)
      },

      totals: {
        totalRevenue,
        totalProfit,
        profitMargin: profitMargin.toFixed(2)
      },

      inventory: {
        pmsQty,
        agoQty,
        lowProductsCount: lowProducts.length,
        healthScore: inventoryHealthScore.toFixed(0)
      },

      charts: {
        monthlyRevenue
      },

      fuelBreakdown: fuelBreakdown[0] || {
        totalPMSLitres: 0,
        totalAGOLitres: 0
      },

      recentActivities,
      executiveSummary: summary
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

