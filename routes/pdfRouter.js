const express = require("express");
const router = express.Router();

const auth = require("../middleware/authmiddleware");
const allowRoles = require("../middleware/rolemiddleware");

const { generateSalesPDF,
    generateStaffPDF,
    generateStaffSalaryPDF,
    generateExpensePDF
} = require("../controllers/pdfControllers");

router.get("/sales/:id", auth, allowRoles("admin", "manager", "accountant"), generateSalesPDF);

router.get("/staff/:id", auth, allowRoles("admin", "manager", "accountant"), generateStaffPDF);

router.get("/staff-salary", auth, allowRoles("admin", "manager", "accountant"), generateStaffSalaryPDF);

router.get("/expenses", auth, allowRoles("admin", "accountant"), generateExpensePDF);

module.exports = router;