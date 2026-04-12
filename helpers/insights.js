function generateInsights(data) {
  const insights = [];

  const {
    agoProfit,
    pmsProfit,
    growthRate,
    totalExpenses,
    totalNetSales,
    totalBankBalance,
    lowProducts,
    bestProduct
  } = data;

  // AGO loss warning
  if (agoProfit < 0) {
    insights.push("⚠️ You are losing money on AGO sales. Review pricing or operational efficiency.");
  }

  // PMS loss warning
    if (pmsProfit < 0) {
    insights.push("⚠️ You are losing money on PMS sales. Review pricing or operational efficiency.");
    }

    // AGO profit
    if (agoProfit > 0) {
    insights.push("📈 AGO operations are profitable.");
    }

  // PMS growth
  if (pmsProfit > 0) {
    insights.push("📈 PMS operations are profitable.");
  }

  // Revenue drop
  if (growthRate < 0) {
    insights.push("📉 Revenue dropped compared to yesterday.");
  }

  // Expense ratio
  const expenseRatio = totalExpenses / totalNetSales;
  if (expenseRatio > 0.3) {
    insights.push("💸 Expenses are too high relative to revenue. it is taking up 30% of your income.");
  }

  // Cash risk
  if (totalBankBalance < totalExpenses) {
    insights.push("⚠️ Cash flow risk detected: expenses exceed available bank balance.");
  }

  // Inventory warning
  if (lowProducts.length > 5) {
    insights.push("📦 Multiple low-stock products detected.");
  }

  // Best product
  if (bestProduct) {
    insights.push(
      `🏆 Top product: ${bestProduct._id} generated ₦${bestProduct.totalRevenue.toLocaleString()}.`
    );
  }

  if (insights.length === 0) {
    insights.push("✅ Business performance looks stable with no critical issues.");
  }

  return insights;
}

module.exports = {
  generateInsights
};