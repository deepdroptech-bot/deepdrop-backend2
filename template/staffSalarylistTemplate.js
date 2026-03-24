const companyHeader = require("../helpers/pdfHeader");

const companyFooter = require("../helpers/pdfFooter");

const staffSalarylistTemplate = (staffList) => {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
    };

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Staff Salary Details</title>
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

${companyHeader("Staff Monthly Salary Report")}

    <h1>Staff Salary Details</h1>
    <div class="section">
        <div class="section-title">staff information and Salary</div>
        <table>
            <tr>
                <th>Name</th>
                <th>Staff ID</th>
                <th>Position</th>
                <th>Base Salary</th>
                <th>Bonuses</th>
                <th>Deductions</th>
                <th>Net Salary</th>
            </tr>
            ${staffList.map(staff => `
                <tr>
                    <td>${staff.firstName} ${staff.lastName}</td>
                    <td>${staff.staffId}</td>
                    <td>${staff.position}</td>
                    <td>${formatCurrency(staff.baseSalary)}</td>
                    <td>${formatCurrency(staff.bonuses.reduce((sum, bonus) => sum + bonus.amount, 0))}</td>
                    <td>${formatCurrency(staff.deductions.reduce((sum, deduction) => sum + deduction.amount, 0))}</td>
                    <td>${formatCurrency(staff.netSalary)}</td>
                </tr>
            `).join('')}
            <tr>
                <th colspan="6">Total Payable</th>
                <th>${formatCurrency(staffList.reduce((sum, staff) => sum + staff.netSalary, 0))}</th>     
        </table>
    </div>

${companyFooter()}

</body>
</html>`;
}

module.exports = staffSalarylistTemplate;