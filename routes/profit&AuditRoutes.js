const express = require("express");
const router = express.Router();

const auth = require("../middleware/authmiddleware");
const allowRoles = require("../middleware/rolemiddleware");

const {
    getDailyProfitReport,
    getProfitSummary,
    getAuditTrail
} = require("../controllers/profit&AuditControllers");

router.get("/daily-profit-report/:date",
    auth,
    allowRoles("accountant", "admin", "manager"),
    getDailyProfitReport
);

router.get("/profit-summary/",
    auth,
    allowRoles("accountant", "admin", "manager"),
    getProfitSummary
);

router.get("/audit-trail/:date",
    auth,
    allowRoles("admin"),
    getAuditTrail
);

module.exports = router;