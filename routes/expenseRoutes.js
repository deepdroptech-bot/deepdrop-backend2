const express = require("express");
const router = express.Router();
const {
  createExpenseDocument,
  addExpense,
  closeExpenseDocument,
  getCurrentExpenseDocument,
  getExpenseHistory,
  getExpensesForDocument
} = require("../controllers/expenseController");

const auth = require("../middleware/authmiddleware");
const allowRoles = require("../middleware/rolemiddleware");

router.post(
  "/document",
  auth,
  allowRoles("admin", "accountant"),
  createExpenseDocument
);

router.post(
  "/add",
  auth,
  allowRoles("admin", "accountant"),
  addExpense
);

router.post(
  "/close",
  auth,
  allowRoles("admin", "accountant"),
  closeExpenseDocument
);

router.get(
  "/current",
  auth,
  allowRoles("admin", "accountant"),
  getCurrentExpenseDocument
);

router.get(
  "/history",
  auth,
  allowRoles("admin", "accountant"),
  getExpenseHistory
);

router.get(
  "/document/:id",
  auth,
  allowRoles("admin", "accountant"),
  getExpensesForDocument
);

module.exports = router;
