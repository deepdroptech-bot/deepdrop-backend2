const express = require("express");
const router = express.Router();

const auth = require("../middleware/authmiddleware");
const allowRoles = require("../middleware/rolemiddleware");
const upload = require("../middleware/upload");

const {
  createStaff,
  getAllStaff,
  getStaffById,
  updateStaff,
  addBonus,
  addDeduction,
  paySalary,
  deleteStaff,
  deactivateStaff,
  activateStaff
} = require("../controllers/staffControllers");

router.post(
  "/",
  auth,
  allowRoles("admin", "manager"),
  upload.single("photo"),
  createStaff
);

router.get(
  "/",
  auth,
  allowRoles("admin", "manager", "accountant"),
  upload.single("photo"),
  getAllStaff
);

router.get(
  "/:id",
  auth,
  allowRoles("admin", "manager"),
  upload.single("photo"),
  getStaffById
);

router.put(
  "/:id",
  auth,
  allowRoles("admin", "manager"),
  upload.single("photo"),
  updateStaff
);

router.patch(
  "/:id/bonus",
  auth,
  allowRoles("admin", "manager"),
  addBonus
);

router.patch(
  "/:id/deduction",
  auth,
  allowRoles("admin", "manager"),
  addDeduction
);

router.patch(
  "/:id/pay",
  auth,
  allowRoles("admin", "accountant"),
  paySalary
);

router.delete(
  "/:id",
  auth,
  allowRoles("admin"),
  deleteStaff
);

router.patch(
  "/:id/deactivate",
  auth,
  allowRoles("admin", "manager"),
  deactivateStaff
);

router.patch(
  "/:id/activate",
  auth,
  allowRoles("admin"),
  activateStaff
);

module.exports = router;