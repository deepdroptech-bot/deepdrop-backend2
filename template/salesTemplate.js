const generateSalesHTML = (sales) => {

const formatCurrency = (num) =>
  `₦${(num || 0).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;

const formatNumber = (num) =>
  (num || 0).toLocaleString("en-NG", { minimumFractionDigits: 2 });

return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">

<style>

body{
  font-family: Arial, Helvetica, sans-serif;
  padding:40px;
  color:#333;
}

h1,h2,h3{
  margin:0;
}

.header{
  display:flex;
  justify-content:space-between;
  align-items:center;
  border-bottom:3px solid #333;
  padding-bottom:10px;
  margin-bottom:30px;
}

.company{
  font-size:22px;
  font-weight:bold;
}

.subtitle{
  font-size:14px;
  color:#666;
}

.section{
  margin-top:30px;
}

.section-title{
  font-size:18px;
  font-weight:bold;
  margin-bottom:10px;
  border-bottom:1px solid #ccc;
  padding-bottom:5px;
}

table{
  width:100%;
  border-collapse:collapse;
  margin-top:10px;
}

table th{
  background:#f2f2f2;
  padding:8px;
  text-align:left;
  border:1px solid #ddd;
}

table td{
  padding:8px;
  border:1px solid #ddd;
}

.summary{
  margin-top:30px;
  width:350px;
  float:right;
}

.summary table td{
  padding:8px;
}

.summary .total{
  font-weight:bold;
  background:#f4f4f4;
}

.footer{
  margin-top:80px;
  display:flex;
  justify-content:space-between;
}

.signature{
  width:30%;
  text-align:center;
}

.signature-line{
  border-top:1px solid #333;
  margin-top:40px;
  padding-top:5px;
}

.notes{
  margin-top:20px;
  font-size:13px;
  color:#444;
}

</style>

</head>

<body>

<div style="text-align:center;margin-bottom:30px">
<h1>Deep Drop Energy</h1>
<h2>Ekiosa</h2>
</div>

<div class="header">

<div>
<div class="company">Daily Sales Report</div>
<div class="subtitle">
Generated: ${new Date().toLocaleDateString()}
</div>
</div>

<div>
<strong>Sales Date:</strong>
${new Date(sales.salesDate).toLocaleDateString()}
</div>

</div>

<!-- ================= PMS ================= -->

<div class="section">

<div class="section-title">PMS Pump Sales</div>

<table>

<thead>
<tr>
<th>Pump</th>
<th>Opening</th>
<th>Closing</th>
<th>Meter Litres</th>
<th>Calibration</th>
<th>calibratioReason</th>
<th>Net Litres</th>
</tr>
</thead>

<tbody>

${sales.PMS.pumps
  .map(
    (pump) => `
<tr>
<td>${pump.pumpNumber}</td>
<td>${formatNumber(pump.openingMeter)}</td>
<td>${formatNumber(pump.closingMeter)}</td>
<td>${formatNumber(pump.meterLitres)}</td>
<td>${formatNumber(pump.calibrationLitres)}</td>
<td>${pump.calibrationReason || ""}</td>
<td>${formatNumber(pump.netLitresSold)}</td>
</tr>
`
  )
  .join("")}

</tbody>

</table>

<table style="margin-top:10px;width:50%">
<tr>
<td><strong>Total Litres</strong></td>
<td>${formatNumber(sales.PMS.totalMeterLitres)}</td>
</tr>

<tr>
<td><strong>Total Calibrations</strong></td>
<td>${formatNumber(sales.PMS.totalCalibrationLitres)}</td>
</tr>

<tr>
<td><strong>Total Litres Sold</strong></td>
<td>${formatNumber(sales.PMS.totalLitres)}</td>
</tr>

<tr>
<td><strong>PMS Sales</strong></td>
<td>${formatCurrency(sales.PMS.totalAmount)}</td>
</tr>

</table>

</div>

<!-- ================= AGO ================= -->

<div class="section">

<div class="section-title">AGO Sales</div>

<table>

<tr>
<td><strong>Opening Meter</strong></td>
<td>${formatNumber(sales.AGO.openingMeter)}</td>
</tr>

<tr>
<td><strong>Closing Meter</strong></td>
<td>${formatNumber(sales.AGO.closingMeter)}</td>
</tr>

<tr>
<td><strong>Calibration</strong></td>
<td>${formatNumber(sales.AGO.calibrationLitres)}</td>
</tr>

<tr>
<td><strong>Litres Sold</strong></td>
<td>${formatNumber(sales.AGO.litresSold)}</td>
</tr>

<tr>
<td><strong>Price / Litre</strong></td>
<td>${formatCurrency(sales.AGO.pricePerLitre)}</td>
</tr>

<tr>
<td><strong>Total Sales</strong></td>
<td>${formatCurrency(sales.AGO.totalAmount)}</td>
</tr>

</table>

</div>

<!-- ================= PRODUCTS ================= -->

<div class="section">

<div class="section-title">Products Sold</div>

<table>

<thead>
<tr>
<th>Item</th>
<th>Quantity</th>
<th>Price</th>
<th>Total</th>
</tr>
</thead>

<tbody>

${sales.productsSold
  .map(
    (p) => `
<tr>
<td>${p.itemName}</td>
<td>${p.quantitySold}</td>
<td>${formatCurrency(p.pricePerUnit)}</td>
<td>${formatCurrency(p.totalAmount)}</td>
</tr>
`
  )
  .join("")}

</tbody>

</table>

<p><strong>Total Products Sales:</strong> ${formatCurrency(
  sales.totalProductsSales
)}</p>

</div>

<!-- ================= OTHER INCOME ================= -->

<div class="section">

<div class="section-title">Other Income</div>

<table>

<thead>
<tr>
<th>Item</th>
<th>Amount</th>
</tr>
</thead>

<tbody>

${sales.otherIncome
  .map(
    (o) => `
<tr>
<td>${o.itemName}</td>
<td>${formatCurrency(o.amount)}</td>
</tr>
`
  )
  .join("")}

</tbody>

</table>

<p><strong>Total Other Income:</strong> ${formatCurrency(
  sales.totalOtherIncome
)}</p>

</div>

<!-- ================= SUMMARY ================= -->

<div class="summary">

<table>

<tr>
<td>Total Fuel Sales</td>
<td>${formatCurrency(sales.totalSalesAmount)}</td>
</tr>

<tr>
<td>Total Product Sales</td>
<td>${formatCurrency(sales.totalProductsSales)}</td>
</tr>

<tr>
<td>Total Other Income</td>
<td>${formatCurrency(sales.totalOtherIncome)}</td>
</tr>

<tr class="total">
<td>Net Sales</td>
<td>${formatCurrency(sales.netSales)}</td>
</tr>

</table>

</div>

<div style="clear:both"></div>

<!-- ================= NOTES ================= -->

${
  sales.notes && sales.notes.length
    ? `
<div class="notes">
<strong>Notes:</strong>
<ul>
${sales.notes.map((n) => `<li>${n}</li>`).join("")}
</ul>
</div>
`
    : ""
}

<!-- ================= SIGNATURES ================= -->

<div class="footer">

<div class="signature">
<div class="signature-line"></div>
Created By<br/>
${sales.createdBy?.firstName || ""} ${sales.createdBy?.lastName || ""}
</div>

<div class="signature">
<div class="signature-line"></div>
Submitted By<br/>
${sales.submittedBy?.firstName || ""} ${sales.submittedBy?.lastName || ""}
</div>

<div class="signature">
<div class="signature-line"></div>
Approved By<br/>
${sales.approvedBy?.firstName || ""} ${sales.approvedBy?.lastName || ""}
</div>

</div>

</body>
</html>
`;
};

module.exports = generateSalesHTML;