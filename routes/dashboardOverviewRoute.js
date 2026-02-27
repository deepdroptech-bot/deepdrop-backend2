const express = require("express");
const router = express.Router();

const auth = require("../middleware/authmiddleware");
const allowRoles = require("../middleware/rolemiddleware");

const { getExecutiveDashboard } = require("../controllers/dashboardOverviewController");

router.get(
  "/overview",
  auth,
  allowRoles("admin", "accountant", "manager"),
  getExecutiveDashboard
);

module.exports = router