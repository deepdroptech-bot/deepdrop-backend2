const express = require("express");
const router = express.Router();

const auth = require("../middleware/authmiddleware");
const allowRoles = require("../middleware/rolemiddleware");

const {
  initializeInventory,
  addFuelStock,
  addProductQuantity,
  getInventory,
  getProductInventory,
  getFuelInventory,
  getFuelHistory,
  getProductHistory
} = require("../controllers/inventoryController");

router.post("/initialize",
  auth,
  allowRoles("admin"),
  initializeInventory
);

router.post("/fuel-stock",
  auth,
  allowRoles("accountant", "admin"),
  addFuelStock
);

router.post("/product-quantity",
  auth,
  allowRoles("accountant", "admin"),
  addProductQuantity
);

router.get("/",
  auth,
  getInventory
);

router.get("/fuel",
  auth,
  getFuelInventory
);

router.get("/products",
  auth,
  getProductInventory
);

router.get("/fuel-history",
  auth,
  getFuelHistory
);

router.get("/product-history",
  auth,
  getProductHistory
);

module.exports = router;