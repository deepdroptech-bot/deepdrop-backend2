const companyHeader = require("../helpers/pdfHeader");

const companyFooter = require("../helpers/pdfFooter");

const generateExpenseHTML = (expenses) => {
    formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN"
        }).format(amount);
    }

    return `<div class="section">
    <html>  
    <head>
    <style>
    body{
    .company-header{

text-align:center;
margin-bottom:20px;

}

.company-footer{

text-align:center;
margin-top:30px;
color:#888;

font-size:12px;
}
    font-family:Arial;

    padding:30px;
    }
</style>
    </head>
    <body>

    <div class="company-header">
    ${companyHeader("Expenses Report")}
    </div>
    <div class="section-title">Expenses</div>
    <p><strong>Period:</strong> ${new Date(expenses[0].createdAt).toLocaleDateString()} - ${new Date(expenses[expenses.length - 1].createdAt).toLocaleDateString()}</p>
    <div class="section">
    <table>

    <thead>
    <tr>
    <th>Description</th>
    <th>Amount</th>
    <th>Category</th>
    </tr>
    </thead>
    <tbody>

    ${expenses.map(expense => `
    <tr>
    <td>${expense.description}</td>
    <td>${formatCurrency(expense.amount)}</td>
    <td>${expense.category}</td>
    </tr>
    `).join('')}
    </tbody>

    <tr>
    <td><strong>Total Expenses</strong></td>
    <td>${formatCurrency(expenses.reduce((sum, e) => sum + e.amount, 0))}</td>
    <td></td>
    </tr>

    </table>
    </div>

     <div class="company-footer">
    ${companyFooter()}
    </div>
    </body>
    </html>`;
}

module.exports = generateExpenseHTML;