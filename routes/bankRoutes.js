const express = require("express");
const router = express.Router();

const auth = require("../middleware/authmiddleware");
const allowRoles = require("../middleware/rolemiddleware");

const {
  initializeBank,
  addBankBalance,
  getBankBalance,
  getBankHistory
} = require("../controllers/bankControllers");

router.post("/initialize",
  auth,
  allowRoles("admin"),
  initializeBank
);

router.post(
  "/add",
  auth,
  allowRoles("admin", "accountant"),
  addBankBalance
);

router.get("/", auth, getBankBalance);

router.get("/history", auth, allowRoles("admin", "accountant"), 
            getBankHistory
          );

module.exports = router;