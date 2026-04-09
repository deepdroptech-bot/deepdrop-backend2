const companyHeader = require("../helpers/pdfHeader");

const companyFooter = require("../helpers/pdfFooter");

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

.company-header{

text-align:center;
margin-bottom:20px;

}

footer{

text-align:center;
margin-top:30px;
color:#888;

font-size:12px;
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

.footer {
  margin-top: 80px;
  display: flex;
  justify-content: space-between;
  gap: 40px;
}

.signature-block {
  width: 30%;
  text-align: center;
  font-family: Arial, sans-serif;
}

.signature-line {
  border-top: 2px solid #000;
  margin-bottom: 8px;
}

.signature-name {
  font-weight: bold;
  font-size: 14px;
}

.signature-role {
  font-size: 12px;
  color: #555;
}

.signature-date{
  font-size:11px;
  margin-top:4px;
  color:#666;
}

.notes{
  margin-top:20px;
  font-size:13px;
  color:#444;
}

</style>

</head>

<body>


${companyHeader("Daily Sales Report")}


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

${(sales.PMS.priceSegments || []).map((segment,segmentIndex)=>{

let segmentLitres = 0;

let segmentAmount = 0;

const rows = sales.PMS.pumps.map(pump =>

pump.sales
.filter(sale=>sale.priceIndex===segmentIndex)
.map(sale=>{

const meter =
(Number(sale.closingMeter)||0)
-
(Number(sale.openingMeter)||0);

const net =
meter -
(Number(sale.calibrationLitres)||0);

const safeNet = Math.max(net,0);

const amount =
safeNet *
(Number(segment.pricePerLitre)||0);

segmentLitres += safeNet;

segmentAmount += amount;

return `
<tr>

<td>${pump.pumpNumber}</td>

<td>${formatNumber(sale.openingMeter)}</td>

<td>${formatNumber(sale.closingMeter)}</td>

<td>${formatNumber(meter)}</td>

<td>${formatNumber(sale.calibrationLitres)}</td>

<td>${sale.calibrationReason || ""}</td>

<td>${formatNumber(safeNet)}</td>

<td>${formatCurrency(amount)}</td>

</tr>
`;

}).join("")

).join("");


return `

<div style="margin-top:25px">

<div class="section-title">

Price Segment ${segmentIndex+1}

(Price: ${formatCurrency(segment.pricePerLitre)})

</div>

<table>

<thead>

<tr>

<th>Pump</th>

<th>Opening</th>

<th>Closing</th>

<th>Meter Litres</th>

<th>Calibration</th>

<th>Reason</th>

<th>Net Litres</th>

<th>Amount</th>

</tr>

</thead>

<tbody>

${rows}

</tbody>

</table>


<table style="margin-top:10px">

<tr>

<td><strong>Segment Litres</strong></td>

<td>${formatNumber(segmentLitres)}</td>

</tr>

<tr>

<td><strong>Segment Amount</strong></td>

<td>${formatCurrency(segmentAmount)}</td>

</tr>

</table>

</div>

`;

}).join("")}



<!-- ================= PMS Expenses ================= -->

<div class="section">

<div class="section-title">

PMS Expenses

</div>


<table style="margin-top:10px;width:50%">

<thead>

<tr>

<th>Description</th>

<th>Amount</th>

</tr>

</thead>

<tbody>

${(sales.PMS.expenses || []).map(e=>`

<tr>

<td>${e.description}</td>

<td>${formatCurrency(e.amount)}</td>

</tr>

`).join("")}

</tbody>

</table>



<!-- PMS TOTAL SUMMARY -->

<table style="margin-top:20px">

<div class="section-title">

PMS Summary

</div>


<tr>

<td><strong>Total Litres Sold</strong></td>

<td>${formatNumber(sales.PMS.totalLitres)}</td>

</tr>

<tr>

<td><strong>Total PMS Sales</strong></td>

<td>${formatCurrency(sales.PMS.totalAmount)}</td>

</tr>

<tr>

<td><strong>Total PMS Expenses</strong></td>

<td>${formatCurrency(sales.PMS.totalExpenses)}</td>

</tr>

<tr>

<td><strong>PMS Net Sales</strong></td>

<td>${formatCurrency(sales.PMS.pNetSales)}</td>

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

<!-- ================= AGO Expenses ================= -->

<div class="section">

<div class="section-title">AGO Expenses</div>

<table style="margin-top:10px;width:50%">
<thead>
<tr>
<th>Description</th>
<th>Amount</th>
</tr>
</thead>

<tbody>

${sales.AGO.expenses
  .map(
    (e) => `
<tr>
<td>${e.description}</td>
<td>${formatCurrency(e.amount)}</td>
</tr>
`
  )
  .join("")}

</div>
</tbody>

</table>

<div class="section-title">AGO Summary</div>

<table>

<tr>
<td><strong>AGO Sales</strong></td>
<td>${formatCurrency(sales.AGO.totalAmount)}</td>
</tr>

<tr>
<td><strong>AGO Expenses</strong></td>
<td>${formatCurrency(sales.AGO.totalExpenses)}</td>
</tr>

<tr>
<td><strong>AGO Net Sales</strong></td>
<td>${formatCurrency(sales.AGO.ANetSales)}</td>
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

  <div class="signature-block">
    <div class="signature-line"></div>
    <div class="signature-name">${sales.createdBy?.name || ""}</div>
    <div class="signature-role">Created By (${sales.createdBy?.role || ""})</div>
    <div class="signature-date">
  ${sales.createdAt ? new Date(sales.createdAt).toLocaleDateString() : ""}
</div>
  </div>

  <div class="signature-block">
    <div class="signature-line"></div>
    <div class="signature-name">${sales.submittedBy?.name || ""}</div>
    <div class="signature-role">Submitted By (${sales.submittedBy?.role || ""})</div>
    <div class="signature-date">
  ${sales.submittedAt ? new Date(sales.submittedAt).toLocaleDateString() : ""}
</div>
  </div>

  <div class="signature-block">
    <div class="signature-line"></div>
    <div class="signature-name">${sales.approvedBy?.name || ""}</div>
    <div class="signature-role">Approved By (${sales.approvedBy?.role || ""})</div>
    <div class="signature-date">
  ${sales.approvedAt ? new Date(sales.approvedAt).toLocaleDateString() : ""}
</div>
  </div>

</div>

</div>

${companyFooter()}

</body>
</html>
`;
};

module.exports = generateSalesHTML;