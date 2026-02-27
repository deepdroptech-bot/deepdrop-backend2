const express = require("express");
const router = express.Router();

const auth = require("../middleware/authmiddleware");
const allowRoles = require("../middleware/rolemiddleware");

const {
  createPMSPL,
  submitPMSPL,
  approvePMSPL,
  getAllPMSPL,
  getPMSPLById
} = require("../controllers/profitOrLossControllers");

router.post(
  "/",
  auth,
  allowRoles("accountant", "admin"),
  createPMSPL
);

router.post(
  "/:id/submit",
  auth,
  allowRoles("accountant", "admin"),
  submitPMSPL
);

router.post(
  "/:id/approve",
  auth,
  allowRoles("admin"),
  approvePMSPL
);

router.get(
  "/",
  auth,
  allowRoles("accountant", "admin"),
  getAllPMSPL
);

router.get(
  "/:id",
  auth,
  allowRoles("accountant", "admin"),
  getPMSPLById
);

module.exports = router;