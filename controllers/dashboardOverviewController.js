const DailySales = require("../models/dailySalesModel");
const ExpenseDocument = require("../models/expenseModel");
const Inventory = require("../models/inventoryModel");
const BankBalance = require("../models/bankModel");

const { generateInsights } = require("../helpers/insights");

exports.getExecutiveDashboard = async (req, res) => {
  try {
    /* =========================
       DATE HELPERS
    ========================= */
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));

    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);

    const startOfMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );

    /* =========================
       DAILY SALES (APPROVED ONLY)
    ========================= */
    const approvedFilter = { approvalStatus: "approved", isDeleted: false };

    const todaySales = await DailySales.aggregate([
      { $match: { ...approvedFilter, salesDate: { $gte: startOfToday } } },
      { $group: { _id: null, total: { $sum: "$netSales" } } }
    ]);

    const yesterdaySales = await DailySales.aggregate([
      {
        $match: {
          ...approvedFilter,
          salesDate: { $gte: startOfYesterday, $lt: startOfToday }
        }
      },
      { $group: { _id: null, total: { $sum: "$netSales" } } }
    ]);

    const todayTotal = todaySales[0]?.total || 0;
    const yesterdayTotal = yesterdaySales[0]?.total || 0;

    const growthRate =
      yesterdayTotal === 0
        ? 0
        : ((todayTotal - yesterdayTotal) / yesterdayTotal) * 100;

    /* =========================
       MONTHLY NET SALES
    ========================= */
    const monthlyNetSales = await DailySales.aggregate([
      {
        $match: {
          ...approvedFilter,
          salesDate: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: { $dayOfMonth: "$salesDate" },
          total: { $sum: "$netSales" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    /* =========================
       EXPENSE DOCUMENT TOTAL
    ========================= */
    const expenseDocs = await ExpenseDocument.aggregate([
      {
        $group: {
          _id: null,
          totalExpenses: { $sum: "$totalAmount" }
        }
      }
    ]);

    const totalExpensesDoc = expenseDocs[0]?.totalExpenses || 0;

    /* =========================
       TOTAL NET SALES
    ========================= */
    const totalNetSalesAgg = await DailySales.aggregate([
      { $match: approvedFilter },
      {
        $group: {
          _id: null,
          totalNetSales: { $sum: "$netSales" }
        }
      }
    ]);

    const totalNetSales = totalNetSalesAgg[0]?.totalNetSales || 0;

    /* =========================
       PROFIT (NEW LOGIC)
    ========================= */
    const totalProfit = totalNetSales - totalExpensesDoc;

    const profitMargin =
      totalNetSales === 0
        ? 0
        : (totalProfit / totalNetSales) * 100;

    /* =========================
       BEST PERFORMING PRODUCT
    ========================= */
    const bestProductAgg = await DailySales.aggregate([
      { $match: approvedFilter },
      { $unwind: "$productsSold" },
      {
        $group: {
          _id: "$productsSold.itemName",
          totalRevenue: { $sum: "$productsSold.totalAmount" },
          totalQty: { $sum: "$productsSold.quantitySold" }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 1 }
    ]);

    const bestProduct = bestProductAgg[0] || null;

    /* =========================
       INVENTORY SUMMARY
    ========================= */
    const inventory = await Inventory.findOne();

    const pmsQty = inventory?.fuel?.PMS?.totalQuantity || 0;
    const agoQty = inventory?.fuel?.AGO?.quantityLitres || 0;

    const lowProducts =
      inventory?.products?.slots.filter(
        (p) => p.itemName && p.quantity < 10
      ) || [];

    /* =========================
       BANK SUMMARY
    ========================= */
    const bank = await BankBalance.findOne();

    const totalBankBalance =
      (bank?.PMS || 0) +
      (bank?.AGO || 0) +
      (bank?.products || 0) +
      (bank?.otherIncome || 0);

    const recentBankHistory = bank?.history
      ?.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
      ?.slice(0, 5);

    /* =========================
       RECENT SALES
    ========================= */
    const recentSales = await DailySales.find(approvedFilter)
      .sort({ createdAt: -1 })
      .limit(5);

    /* =========================
       INSIGHTS
    ========================= */
    const insights = generateInsights({
      agoProfit: inventory ? (pmsQty * 150 - agoQty * 120) : 0, // Example profit calculation
      pmsProfit: inventory ? (pmsQty * 200 - pmsQty * 150) : 0, // Example profit calculation
      growthRate,
      totalExpenses: totalExpensesDoc,
      totalNetSales,
      totalBankBalance,
      lowProducts,
      bestProduct
    });

    /* =========================
       EXECUTIVE SUMMARY
    ========================= */
    let summary = "Business is stable.";

    if (growthRate > 5) {
      summary = "Strong growth in revenue observed.";
    } else if (growthRate < 0) {
      summary = "Revenue declined compared to yesterday.";
    }

    /* =========================
       RESPONSE
    ========================= */
    res.json({
      performance: {
        todayRevenue: todayTotal,
        yesterdayRevenue: yesterdayTotal,
        growthRate: growthRate.toFixed(2)
      },

      totals: {
        totalNetSales,
        totalExpenses: totalExpensesDoc,
        totalProfit,
        profitMargin: profitMargin.toFixed(2)
      },

      inventory: {
        pmsQty,
        agoQty,
        lowProductsCount: lowProducts.length
      },

      bank: {
        totalBalance: totalBankBalance,
        breakdown: {
          PMS: bank?.PMS || 0,
          AGO: bank?.AGO || 0,
          products: bank?.products || 0,
          otherIncome: bank?.otherIncome || 0
        },
        recentTransactions: recentBankHistory || []
      },

      bestPerformingProduct: bestProduct,

      charts: {
        monthlyNetSales
      },

      insights,

      recentSales,
      executiveSummary: summary
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};