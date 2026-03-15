const Inventory = require("../models/inventoryModel");

//initialize inventory (to be run once)
exports.initializeInventory = async (req, res) => {
  const existing = await Inventory.findOne();
  if (existing) {
    return res.status(400).json({ msg: "Inventory already exists" });
  }

  const inventory = await Inventory.create({
    fuel: {
      PMS: {
        totalQuantity: 0,
        wells: [
          { wellNumber: 1, quantity: 0 },
          { wellNumber: 2, quantity: 0 }
        ]
      },
      AGO: {
        quantityLitres: 0
      }
    },
    products: []
  });

  res.json({ msg: "Inventory initialized", inventory });
};

// add fuel stock to inventory
exports.addFuelStock = async (req, res) => {
  try {

    const inventory = await Inventory.findOne();

    if (!inventory) {
      return res.status(404).json({
        msg: "Inventory not found"
      });
    }

    const { fuelType, wellNumber, quantity, details } = req.body;

    const qty = Number(quantity);
    const wellNo = Number(wellNumber);

    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({
        msg: "Invalid quantity"
      });
    }

    /* ===== PMS ===== */
    if (fuelType === "PMS") {

      const well = inventory.fuel.PMS.wells.find(
        w => w.wellNumber === wellNo
      );

      if (!well) {
        return res.status(404).json({
          msg:"Well not found"
        });
      }

      well.quantity += qty;

      // update total automatically
      inventory.updatePMSTotal();

    }

    /* ===== AGO ===== */
    if (fuelType === "AGO") {

      inventory.fuel.AGO.quantityLitres += qty;

    }

    /* ===== SAVE HISTORY ===== */

    inventory.fuelHistory.push({

      type:fuelType,

      Quantity:qty,

      wellNumber: fuelType === "PMS" 
? wellNo 
: null,

      addedBy:req.user.id,

      addedAt:Date.now(),

      details: details || 
        `Stock added to ${fuelType}`

    });

    inventory.lastUpdatedBy = req.user.id;

    await inventory.save();

    res.json({

      msg:"Fuel stock added successfully",

      fuel:inventory.fuel

    });

  } 
  catch (error) {

    res.status(500).json({

      msg:"Failed to add stock",

      error:error.message

    });

  }
};



//add product quantity to inventory
exports.addProductQuantity = async (req, res) => {
  try {
    const { slotNumber, itemName, quantity, details } = req.body;

    const slotNo = Number(slotNumber);
    const qty = Number(quantity);

    if (!slotNo || !itemName || isNaN(qty) || qty <= 0) {
      return res.status(400).json({
        msg: "slotNumber, itemName and valid quantity are required"
      });
    }

    const inventory = await Inventory.findOne();
    if (!inventory) {
      return res.status(404).json({ msg: "Inventory not initialized" });
    }

    const slot = inventory.products.slots.find(
      s => s.slotNumber === slotNo
    );

    if (!slot) {
      return res.status(404).json({ msg: "Product slot not found" });
    }

    // If slot is empty, assign product name
    if (!slot.itemName) {
      slot.itemName = itemName;
    }

    // Prevent mixing products in same slot
    if (slot.itemName !== itemName) {
      return res.status(400).json({
        msg: `Slot already contains ${slot.itemName}`
      });
    }

    // ✅ ADD quantity, don’t overwrite
    slot.quantity += qty;

    /* ===== SAVE HISTORY ===== */

    inventory.productHistory.push({

      slotNumber:slotNo,

      itemName:itemName,

      quantity:qty,

      createdBy:req.user.id,

      details: details || 
        `Stock added to slot ${slotNo}`

    });

    inventory.lastUpdatedBy = req.user.id;
    await inventory.save();

    res.json({
      msg: "Product quantity added successfully",
      slot
    });
  } catch (error) {
    res.status(500).json({
      msg: "Failed to add product quantity",
      error: error.message
    });
  }
};

//get inventory details
exports.getInventory = async (req, res) => {
  try {
    const inventory = await Inventory.findOne();
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ msg: "Failed to get inventory" });
  }
};

//get fuel inventory
exports.getFuelInventory = async (req, res) => {
  try {
    const inventory = await Inventory.findOne();
    res.json(inventory.fuel);
  }
    catch (error) {
    res.status(500).json({ msg: "Failed to get fuel inventory" });
  }
};

//get product inventory
exports.getProductInventory = async (req, res) => {
  try {
    const inventory = await Inventory.findOne();
    res.json(inventory.products);
  } catch (error) {
    res.status(500).json({ msg: "Failed to get product inventory" });
  }
};

exports.getFuelHistory = async (req,res)=>{

try{

const { type, well } = req.query;

if(!type){

return res.status(400).json({
msg:"Fuel type required"
});

}

const inventory =
await Inventory.findOne();

if(!inventory){

return res.status(404).json({
msg:"Inventory not found"
});

}

let history = [];

if(type === "PMS"){

history =
inventory.fuel.PMS.history;

if(well){

history =
history.filter(
h => h.wellNumber === Number(well)
);

}

}

if(type === "AGO"){

history =
inventory.fuel.AGO.history;

}

history.sort(
(a,b)=> new Date(b.createdAt)
- new Date(a.createdAt)
);

res.json(history);

}
catch(err){

console.error(err);

res.status(500).json({
msg:"Server error"
});

}

};
// get product inventory history
exports.getProductHistory = async (req,res)=>{

try{

const { slotNumber, page = 1, limit = 20 } = req.query;

const inventory = await Inventory
.findOne()
.populate("productHistory.createdBy","name");

if(!inventory){

return res.status(404).json({

msg:"Inventory not found"

});

}

let history = inventory.productHistory;

// optional slot filter
if(slotNumber){

history = history.filter(
item => 
item.slotNumber === Number(slotNumber)
);

}

// newest first
history = history
.sort((a,b)=>
new Date(b.createdAt) -
new Date(a.createdAt)
);

// pagination
const start = (page - 1) * limit;
const end = start + Number(limit);

const paginated = history.slice(start,end);

res.json({

total:history.length,

page:Number(page),

pages:Math.ceil(
history.length / limit
),

history:paginated

});

}
catch(error){

res.status(500).json({

msg:"Failed to fetch product history",

error:error.message

});

}

};