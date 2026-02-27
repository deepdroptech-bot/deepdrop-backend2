const express = require("express");
const router = express.Router();

const auth = require("../middleware/authmiddleware");
const allowRoles = require("../middleware/rolemiddleware");

const {
  initializeBank,
  addBankBalance,
  getBankBalance
} = require("../controllers/bankControllers");

router.post("/initialize",
  auth,
  allowRoles("admin"),
  initializeBank
);

router.post(
  "/add",
  auth,
  allowRoles("admin"),
  addBankBalance
);

router.get("/", auth, getBankBalance);


module.exports = router;