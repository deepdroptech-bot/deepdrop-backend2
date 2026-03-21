const generateCalibrationHTML = (data)=>{

    const totalCalibration =
data.reduce(
(sum,item)=>
sum + item.calibrationLitres,
0
);

return `

<html>

<head>

<style>

body{

font-family:Arial;

padding:30px;

color:#333;

}

.header{

display:flex;

justify-content:space-between;

margin-bottom:30px;

}

.title{

font-size:22px;

font-weight:bold;

}

.subtitle{

color:#777;

font-size:14px;

}

table{

width:100%;

border-collapse:collapse;

margin-top:20px;

}

th,td{

border:1px solid #ddd;

padding:10px;

text-align:left;

font-size:14px;

}

th{

background:#f4f6f8;

}

tr:nth-child(even){

background:#fafafa;

}

.total{

margin-top:20px;

font-weight:bold;

}

.footer{

margin-top:40px;

font-size:12px;

color:#888;

}

</style>

</head>

<body>

<div class="header">

<div>

<div class="title">

Pump Calibration Report

</div>

<div class="subtitle">

Generated:
${new Date().toLocaleString()}

</div>

</div>

<div>

<div>

Total Records:
${data.length}

</div>

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

${data.map(item=>`

<tr>

<td>

${from}

</td>

<td>

${to}

</td>

<td>

Pump ${item.pumpNumber}

</td>

<td>

${item.calibrationLitres} L

</td>

<td>

${item.calibrationReason || "-"}

</td>

<td>

${item.staffName || "-"}

</td>

</tr>

`).join("")}

</tbody>

<div class="total">

Total Calibration Loss:

${totalCalibration} Litres

</div>

</table>

<div class="footer">

System Generated Fuel Station Report

</div>

</body>

</html>

`;

};

module.exports = generateCalibrationHTML;