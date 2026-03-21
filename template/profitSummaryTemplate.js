const generateProfitHTML =
(data)=>{

return `

<html>

<style>

body{
font-family:Arial;
padding:30px;
}

table{

width:100%;

border-collapse:collapse;

margin-top:20px;

}

th,td{

border:1px solid #ddd;

padding:8px;

}

th{

background:#f2f2f2;

}

.box{

background:#f7f7f7;

padding:15px;

margin-bottom:20px;

border-radius:8px;

}

</style>

<body>

<h2>
Profit Summary Report
</h2>

<p>

Period:

${data.period.from}

-

${data.period.to}

</p>

<div class="box">

<h3>
PMS Summary
</h3>

<p>
Total Pump 1 & 2 Litres:
${data.PMS.pump12Litres}
</p>

<p>
Total Pump 3 & 4 Litres:
${data.PMS.pump34Litres}
</p>

<p>
Total Litres:
${data.PMS.totalLitres}
</p>

<p>
Revenue:
₦${data.PMS.revenue}
</p>

<p>
Expenses:
₦${data.PMS.expenses}
</p>

<p>
Net Profit:
₦${data.PMS.net}
</p>

</div>

<div class="box">

<h3>
AGO Summary
</h3>

<p>
Litres:
${data.AGO.litres}
</p>

<p>
Revenue:
₦${data.AGO.revenue}
</p>

<p>
Net:
₦${data.AGO.net}
</p>

</div>

<h3>
Other Revenue
</h3>

<p>
Products:
₦${data.products}
</p>

<p>
Other Income:
₦${data.otherIncome}
</p>

<h2>

Grand Profit:

₦${data.grand}

</h2>

</body>

</html>

`;

};

module.exports = generateProfitHTML;