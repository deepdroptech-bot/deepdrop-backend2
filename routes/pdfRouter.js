const express = require("express");
const router = express.Router();

const auth = require("../middleware/authmiddleware");
const allowRoles = require("../middleware/rolemiddleware");

const { generateSalesPDF } = require("../controllers/pdfControllers");

router.get("/sales/:id", auth, allowRoles("admin", "manager", "accountant"), generateSalesPDF);

module.exports = router;