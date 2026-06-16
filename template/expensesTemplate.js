const companyHeader = require("../helpers/pdfHeader");
const companyFooter = require("../helpers/pdfFooter");

const generateExpenseHTML = (expenseDoc = {}) => {
  const expenses = expenseDoc.expenses || [];

  if (!Array.isArray(expenses) || expenses.length === 0) {
    return `
      <html>
      <body style="font-family: Arial; padding: 30px;">
        <h2>No expenses found for this document</h2>
      </body>
      </html>
    `;
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount || 0);
  };

  const sorted = [...expenses].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );

  const firstDate = sorted[0]?.createdAt;
  const lastDate = sorted[sorted.length - 1]?.createdAt;

  const totalAmount =
    expenseDoc.totalAmount ||
    sorted.reduce((sum, e) => sum + (e.amount || 0), 0);

  return `
  <html>
  <head>
    <style>
      body {
        font-family: Arial;
        padding: 30px;
      }

      .company-header {
        text-align: center;
        margin-bottom: 20px;
      }

      footer {
        text-align: center;
        margin-top: 30px;
        color: #888;
        font-size: 12px;
      }

      table {
        width: 100%;
        border-collapse: collapse;
      }

      th, td {
        border: 1px solid #ddd;
        padding: 10px;
      }

      th {
        background: #f4f4f4;
      }

      .total-row {
        font-weight: bold;
        background: #f9f9f9;
      }

      .meta {
        margin-bottom: 20px;
      }
    </style>
  </head>

  <body>

    ${companyHeader("Expenses Report")}

    <div class="meta">
      <h3>${expenseDoc.title || "Expense Report"}</h3>

      <p>
        <strong>Period:</strong>
        ${
          firstDate
            ? new Date(firstDate).toLocaleDateString()
            : "N/A"
        }
        -
        ${
          lastDate
            ? new Date(lastDate).toLocaleDateString()
            : "N/A"
        }
      </p>

      <p>
        <strong>Status:</strong> ${expenseDoc.status || "N/A"}
      </p>
    </div>

    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th>Amount</th>
          <th>Category</th>
        </tr>
      </thead>

      <tbody>
        ${sorted
          .map(
            (expense) => `
          <tr>
            <td>${expense.description || ""}</td>
            <td>${formatCurrency(expense.amount)}</td>
            <td>${expense.category || ""}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>

      <tfoot>
        <tr class="total-row">
          <td>Total Expenses</td>
          <td>${formatCurrency(totalAmount)}</td>
          <td></td>
        </tr>
      </tfoot>
    </table>

    <p>Generated on ${new Date().toLocaleString()}</p>

    ${companyFooter()}

  </body>
  </html>
  `;
};

module.exports = generateExpenseHTML;