const ExpenseDocument = require("../models/expenseModel");
const BankBalance = require("../models/bankModel");

/* =========================
   CREATE EXPENSE DOCUMENT
========================= */
exports.createExpenseDocument = async (req, res) => {
  try {
    // Ensure only one open document
    const existing = await ExpenseDocument.findOne({ status: "open" });
    if (existing) {
      return res.status(400).json({
        msg: "An expense document is already open"
      });
    }

    const document = await ExpenseDocument.create({
      title: req.body.title,
      createdBy: req.user.id
    });

    res.status(201).json({
      msg: "Expense document created",
      document
    });

  } catch (error) {
    res.status(500).json({
      msg: "Failed to create expense document",
      error: error.message
    });
  }
};

exports.addExpense = async (req, res) => {
  try {
    const { description, amount, category } = req.body;

    if (!description || !amount || !category) {
      return res.status(400).json({
        msg: "Description, amount and category are required"
      });
    }

    const expenseDoc = await ExpenseDocument.findOne({ status: "open" });
    if (!expenseDoc) {
      return res.status(400).json({
        msg: "No open expense document"
      });
    }

    const bank = await BankBalance.findOne();
    if (!bank) {
      return res.status(400).json({
        msg: "Bank balance not initialized"
      });
    }

    const expenseAmount = Number(amount);
    if (expenseAmount <= 0) {
      return res.status(400).json({ msg: "Invalid expense amount" });
    }

    /* ===== BANK DEDUCTION ===== */
    if (category === "PMS") bank.PMS -= expenseAmount;
    else if (category === "AGO") bank.AGO -= expenseAmount;
    else if (category === "products") bank.products -= expenseAmount;
    else bank.otherIncome -= expenseAmount;

    if (bank.PMS < 0 || bank.AGO < 0 || bank.otherIncome < 0 || bank.products < 0) {
      return res.status(400).json({
        msg: "Insufficient bank balance"
      });
    }

    /* ===== ADD EXPENSE ===== */
    expenseDoc.expenses.push({
      description,
      amount: expenseAmount,
      category
    });

    expenseDoc.totalAmount += expenseAmount;
    bank.lastUpdatedBy = req.user.id;

    await expenseDoc.save();
    await bank.save();

    res.json({
      msg: "Expense added successfully",
      expenseDoc
    });

  } catch (error) {
    res.status(500).json({
      msg: "Failed to add expense",
      error: error.message
    });
  }
};

exports.closeExpenseDocument = async (req, res) => {
  try {
    const expenseDoc = await ExpenseDocument.findOne({ status: "open" });

    if (!expenseDoc) {
      return res.status(400).json({
        msg: "No open expense document to close"
      });
    }

    expenseDoc.status = "closed";
    expenseDoc.periodEnd = new Date();
    expenseDoc.closedBy = req.user.id;
    expenseDoc.closedAt = new Date();

    await expenseDoc.save();

    res.json({
      msg: "Expense document closed successfully",
      expenseDoc
    });

  } catch (error) {
    res.status(500).json({
      msg: "Failed to close expense document",
      error: error.message
    });
  }
};

exports.getCurrentExpenseDocument = async (req, res) => {
  try {
    const document = await ExpenseDocument.findOne({ status: "open" })
      .populate("createdBy", "name role");

    if (!document) {
      return res.json({ msg: "No open expense document" });
    }

    res.json(document);

  } catch (error) {
    res.status(500).json({
      msg: "Failed to fetch expense document"
    });
  }
};

exports.getExpenseHistory = async (req, res) => {
  try {
    const documents = await ExpenseDocument.find({ status: "closed" })
      .sort({ periodEnd: -1 })
      .populate("createdBy", "name")
      .populate("closedBy", "name");

    res.json(documents);

  } catch (error) {
    res.status(500).json({
      msg: "Failed to fetch expense history"
    });
  }
};

// get all expenses for a closed document
exports.getExpensesForDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await ExpenseDocument.findById(id)
      .populate("createdBy", "name")
      .populate("closedBy", "name");

    if (!document) {
      return res.status(404).json({
        msg: "Expense document not found"
      });
    }
    res.json(document);

  } catch (error) {
    res.status(500).json({
      msg: "Failed to fetch expenses for document",
      error: error.message
    });
  }
};
