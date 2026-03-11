const generateExpenseHTML = (expenses) => {
    formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN"
        }).format(amount);
    }

    return `<div class="section">
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
    </div>`;
}

module.exports = generateExpenseHTML;