function generateSalesHTML(sales) {
  return `
  <html>
  <head>
    <style>
      body { font-family: Arial; padding: 30px; }
      h1 { font-size: 24px; }
      .section { margin-bottom: 20px; }
      .card {
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 8px;
        margin-bottom: 10px;
      }
      .bold { font-weight: bold; }
    </style>
  </head>

  <body>
    <h1>Daily Sales Report</h1>
    <p>Date: ${new Date(sales.salesDate).toDateString()}</p>
    <p>Status: ${sales.approvalStatus.toUpperCase()}</p>

    <div class="section">
      <h2>PMS Sales</h2>
      ${sales.PMS.pumps.map(pump => `
        <div class="card">
          <p>Pump ${pump.pumpNumber}</p>
          <p>Opening: ${pump.openingMeter}</p>
          <p>Closing: ${pump.closingMeter}</p>
          <p class="bold">Litres Sold: ${pump.litresSold}</p>
        </div>
      `).join("")}
      <p class="bold">Net Sales: ₦${sales.PMS.netSales}</p>
    </div>

    <div class="section">
      <h2>Summary</h2>
      <p>Total Sales: ₦${sales.totalSalesAmount}</p>
      <p>Total Expenses: ₦${sales.totalExpenses}</p>
      <p class="bold">Net Sales: ₦${sales.netSales}</p>
    </div>

  </body>
  </html>
  `;
}

module.exports = generateSalesHTML;