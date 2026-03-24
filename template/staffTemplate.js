const companyHeader = require("../helpers/pdfHeader");

const companyFooter = require("../helpers/pdfFooter");

const generateStaffHtml = (staff) => {
    const formatCurrency = (amount) => {
      return amount.toLocaleString("en-NG", {
        style: "currency",
        currency: "NGN"
      });
    }

return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Staff Details</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
        }
        h1 {
            color: #007BFF;
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

        .section {
            margin-bottom: 20px;
        }
        .section-title {    
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 10px;
            border-bottom: 1px solid #ccc;
            padding-bottom: 5px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th, td {
            border: 1px solid #ccc;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
        }
    </style>
</head>
<body>
<div class="company-header">
${companyHeader("Staff Report")}
</div>
    <h1>Staff Details</h1>

    <div class="section">
        <div class="section-title">Personal Information</div>
        <table>
            <tr><th>Name</th><td>${staff.firstName} ${staff.lastName}</td></tr>
            <tr><th>Staff ID</th><td>${staff.staffId}</td></tr>
            <tr><th>Phone</th><td>${staff.phone}</td></tr>
            <tr><th>NIN</th><td>${staff.nin}</td></tr>
            <tr><th>Position</th><td>${staff.position}</td></tr>
            <tr><th>Base Salary</th><td>${formatCurrency(staff.baseSalary)}</td></tr>
            <tr><th>Hire Date</th><td>${new Date(staff.hireDate).toLocaleDateString()}</td></tr>
        </table>
     </div>
        </table>
    </div> 
    <div class="section">
        <div class="section-title">Deductions</div>
        <table>
            <tr><th>Description</th><th>Amount</th></tr>
            ${staff.deductions.map(deduction => `
                <tr>
                    <td>${deduction.description}</td>
                    <td>${formatCurrency(deduction.amount)}</td>
                </tr>
            `).join('')}
        </table>
    </div>
    <div class="section">
        <div class="section-title">Bonuses</div>
        <table>
            <tr><th>Description</th><th>Amount</th></tr>
            ${staff.bonuses.map(bonus => `
                <tr>
                    <td>${bonus.description}</td>
                    <td>${formatCurrency(bonus.amount)}</td>
                </tr>
            `).join('')}
        </table>
    </div>
    <div class="section">
        <div class="section-title">Salary Summary</div>
        <table>
            <tr><th>Base Salary</th><td>${formatCurrency(staff.baseSalary)}</td></tr>
            <tr><th>Total Deductions</th><td>${formatCurrency(staff.deductions.reduce((sum, d) => sum + d.amount, 0))}</td></tr>
            <tr><th>Total Bonuses</th><td>${formatCurrency(staff.bonuses.reduce((sum, b) => sum + b.amount, 0))}</td></tr>
            <tr><th>Net Salary</th><td>${formatCurrency(staff.netSalary)}</td></tr>
        </table>
    </div>

${companyFooter()}

</body>
</html>`;
}

module.exports = generateStaffHtml;