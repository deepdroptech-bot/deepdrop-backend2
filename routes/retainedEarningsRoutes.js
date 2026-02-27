// routes/retainedEarningsRoutes.js
const express = require("express");
const router = express.Router();

const auth = require("../middleware/authmiddleware");
const allowRoles = require("../middleware/rolemiddleware");

const {
  initializeRetainedEarnings,
  getRetainedEarnings
} = require("../controllers/retainedEarningsControllers");

router.post(
  "/initialize",
  auth,
  allowRoles("admin"),
  initializeRetainedEarnings
);

router.get(
  "/",
  auth,
  allowRoles("accountant", "admin"),
  getRetainedEarnings
);

module.exports = router;
