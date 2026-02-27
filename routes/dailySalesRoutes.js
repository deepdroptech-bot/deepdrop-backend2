const express = require("express");
const router = express.Router();

const auth = require("../middleware/authmiddleware");
const allowRoles = require("../middleware/rolemiddleware");

const {
  createDailySales,
  updateDailySales,
  submitDailySales,
  approveDailySales,
  getSubmittedDailySales,
  getDailySalesByDate,
  getSingleDailySales,
  getDailySalesSummary,
  getAllDailySales,
  softDeleteDailySales
} = require("../controllers/dailySalesControllers");

router.post("/", 
  auth, 
  allowRoles("manager", "admin", "accountant"), 
  createDailySales);

router.put("/:id", 
  auth, 
  allowRoles("manager", "admin"), 
  updateDailySales);

router.post("/:id/submit",
   auth, 
   allowRoles("manager", "admin", "accountant"), 
   submitDailySales);

router.post("/:id/approve", 
  auth, 
  allowRoles("accountant", "admin"),
   approveDailySales);

router.get("/submitted",
   auth, 
   allowRoles("accountant", "admin", "manager"),
   getSubmittedDailySales);

router.get("/all",
   auth, 
   allowRoles("accountant", "admin", "manager"),
   getAllDailySales);

router.get("/",
   auth, 
   getDailySalesByDate);

router.get("/:id",
   auth, 
   getSingleDailySales);

router.get("/summary/date/:date",
   auth, 
   getDailySalesSummary);

router.delete("/:id", 
  auth, 
  allowRoles("admin"), 
  softDeleteDailySales);

module.exports = router;