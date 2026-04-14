const companyHeader = require("../helpers/pdfHeader");

const companyFooter = require("../helpers/pdfFooter");

const generateCalibrationHTML = (data, from, to) => {

  const totalCalibration = data.reduce(
    (sum, item) => sum + (item.calibrationLitres || 0),
    0
  );

  const formatDate = (date) =>
    new Date(date).toLocaleDateString();

  return `
<html>
<head>
<style>

body {
  font-family: Arial;
  padding: 30px;
  color: #333;
}

.header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30px;
}

.company-header {
  text-align: center;
  margin-bottom: 20px;
}

.footer {
  text-align: center;
  margin-top: 30px;
  color: #888;
  font-size: 12px;
}

.title {
  font-size: 22px;
  font-weight: bold;
}

.subtitle {
  color: #777;
  font-size: 14px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

th, td {
  border: 1px solid #ddd;
  padding: 10px;
  font-size: 14px;
}

th {
  background: #f4f6f8;
}

tr:nth-child(even) {
  background: #fafafa;
}

.total {
  margin-top: 20px;
  font-weight: bold;
}

</style>
</head>

<body>

${companyHeader("Pump Calibration Report")}

<div class="header">

<div>
  <div class="title">Pump Calibration Report</div>
  <div class="subtitle">
    Period: ${formatDate(from)} - ${formatDate(to)}
  </div>
</div>

<div>
  <div>Total Records: ${data.length}</div>
</div>

</div>

<table>
<thead>
<tr>
<th>Date</th>
<th>Pump</th>
<th>Calibration Litres</th>
<th>Reason</th>
<th>Staff</th>
</tr>
</thead>

<tbody>

${data.map(item => `
<tr>
<td>${formatDate(item.salesDate)}</td>
<td>Pump ${item.pumpNumber}</td>
<td>${item.calibrationLitres} L</td>
<td>${item.calibrationReason || "-"}</td>
<td>${item.staffName || "-"}</td>
</tr>
`).join("")}

</tbody>
</table>

<div class="total">
Total Calibration Loss: ${totalCalibration} Litres
</div>

${companyFooter()}

</body>
</html>
`;
};

module.exports = generateCalibrationHTML;