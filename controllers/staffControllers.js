const Staff = require('../models/staffModel');
const bankBalanceModel = require('../models/bankModel');
const cloudinary = require("../config/cloudinary");
const { logStaffHistory } = require("../utils/staffHistoryLogger");
const StaffHistory = require("../models/staffHistoryModel");


// create new staff
exports.createStaff = async (req, res) => {
  try {

    const {
      staffId,
      firstName,
      lastName,
      phone,
      nin,
      position,
      baseSalary
    } = req.body;

    if (!staffId || !firstName || !lastName || !phone || !nin || !position) {
      return res.status(400).json({
        success:false,
        msg: "Required fields missing"
      });
    }

    if (!baseSalary || isNaN(baseSalary)) {
      return res.status(400).json({
        success:false,
        msg:"Valid salary required"
      });
    }

    const existingStaff =
    await Staff.findOne({ staffId });

    if (existingStaff) {

      return res.status(400).json({
        success:false,
        msg:"Staff already exists"
      });

    }

    let photoData = {};

    // upload photo
    if (req.file) {

      const result =
      await cloudinary.uploader.upload(
        req.file.path,
        { folder:"staff" }
      );

      photoData = {

        url:result.secure_url,

        publicId:result.public_id

      };

    }

    // ✅ CREATE STAFF FIRST
    const staff =
    await Staff.create({

      staffId,

      firstName,

      lastName,

      phone,

      nin,

      position,

      baseSalary:Number(baseSalary),

      photo:photoData,

      createdBy:req.user.id

    });

await logStaffHistory({

staffId:staff._id,

action:"CREATED",

userId:req.user.id,

changes:{
firstName,
lastName,
position,
baseSalary
},

newSalary:staff.netSalary,

details:"Staff profile created"

});

    res.status(201).json({
success:true,

      msg:"Staff created successfully",

      staff

    });

  }
  catch (error) {

    console.error(error);

    res.status(500).json({
      success:false,
      msg:"Failed to create staff"
    });

  }
};

exports.addBonus = async (req, res) => {
  const { amount, reason } = req.body;

  const staff = await Staff.findById(req.params.id);
  if (!staff) return res.status(404).json({ msg: "Staff not found" });

const oldSalary = staff.netSalary;

  const bonus = {
    amount,
    reason,
    appliedBy:req.user.id
  };

  staff.bonuses.push(bonus);

  await staff.save();

  await logStaffHistory({

staffId:staff._id,
action:"BONUS_ADDED",

userId:req.user.id,
amount:amount,

previousSalary:oldSalary,
newSalary:staff.netSalary,
details:reason
});

  res.json({
    msg: "Bonus added",
    netSalary: staff.netSalary
  });
};

exports.addDeduction = async (req, res) => {

const { amount, reason } = req.body;

const staff =
await Staff.findById(req.params.id);

if (!staff)
return res.status(404).json({
msg: "Staff not found"
});

// store old salary before change
const oldSalary = staff.netSalary;

// create deduction object
const deduction = {
amount,
reason,
appliedBy:req.user.id
};

staff.deductions.push(deduction);

// save first so netSalary recalculates
await staff.save();

await logStaffHistory({

staffId:staff._id,

action:"DEDUCTION_ADDED",

userId:req.user.id,

amount:amount,

previousSalary:oldSalary,

newSalary:staff.netSalary,

details:reason

});

res.json({

msg:"Deduction applied",

netSalary:staff.netSalary

});

};

// pay staff salary and set last paid date with resseting net salary to 0 and deduct net salary from bank balance
const mongoose = require("mongoose");

exports.paySalary = async (req, res) => {

const session =
await mongoose.startSession();

session.startTransaction();

try {

const staff =
await Staff
.findById(req.params.id)
.session(session);

if (!staff){

await session.abortTransaction();
session.endSession();

return res.status(404).json({
msg:"Staff not found"
});

}

const salaryToPay =
staff.netSalary;

if (salaryToPay <= 0){

await session.abortTransaction();
session.endSession();

return res.status(400).json({
msg:"No salary to pay"
});

}

const bankBalance =
await bankBalanceModel
.findOne()
.session(session);

if (!bankBalance ||
bankBalance.PMS < salaryToPay){

await session.abortTransaction();
session.endSession();

return res.status(400).json({
msg:"Insufficient bank balance"
});

}

// deduct money
bankBalance.PMS -= salaryToPay;

await bankBalance.save({session});

// clear adjustments
staff.bonuses = [];
staff.deductions = [];

staff.lastPaidDate =
new Date();

// save staff FIRST
await staff.save({session});

// THEN log history
await logStaffHistory({

staffId:staff._id,

action:"SALARY_PAID",

userId:req.user.id,

amount:salaryToPay,

previousSalary:salaryToPay,

newSalary:staff.baseSalary,

details:"Salary paid",

session // ✅ pass session

});

// commit
await session.commitTransaction();

session.endSession();

res.json({

msg:"Salary paid successfully",

paidAmount:salaryToPay,

staff

});

}
catch(error){

await session.abortTransaction();

session.endSession();

res.status(500).json({

msg:"Server error",

error:error.message

});

}

};
// get single staff by id
exports.getStaffById = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ msg: "Staff not found" });
    }
    res.json(staff);
  } catch (error) {
    res.status(500).json({ msg: "Failed to get staff" });
  }
};

// get all staff
exports.getAllStaff = async (req, res) => {
  try {
    const staffList = await Staff.find();
    res.json(staffList);
  } catch (error) {
    res.status(500).json({ msg: "Failed to get staff list" });
  }
};

// update staff
exports.updateStaff = async (req, res) => {

try {

const staff =
await Staff.findById(req.params.id);

if (!staff){

return res.status(404).json({
msg:"Staff not found"
});

}

// store old values
const oldStatus =
staff.employmentStatus;

const oldSalary =
staff.baseSalary;

const {

firstName,
lastName,
phone,
nin,
position,
baseSalary,
employmentStatus

} = req.body;

// apply updates
staff.firstName =
firstName || staff.firstName;

staff.lastName =
lastName || staff.lastName;

staff.phone =
phone || staff.phone;

staff.nin =
nin || staff.nin;

staff.position =
position || staff.position;

if(baseSalary !== undefined){

staff.baseSalary =
Number(baseSalary);

}

staff.employmentStatus =
employmentStatus ||
staff.employmentStatus;


// image upload
if (req.file){

if(staff.photo?.publicId){

await cloudinary
.uploader
.destroy(
staff.photo.publicId
);

}

const result =
await cloudinary
.uploader
.upload(
req.file.path,
{folder:"staff"}
);

staff.photo = {

url:result.secure_url,

publicId:result.public_id

};

}

staff.updatedBy =
req.user.id;

staff.lastUpdatedAt =
Date.now();

// save first
await staff.save();

// log salary change
if(baseSalary !== undefined &&
oldSalary !== staff.baseSalary){

await logStaffHistory({

staffId:staff._id,

action:"SALARY_ADJUSTED",

userId:req.user.id,

previousSalary:oldSalary,

newSalary:staff.baseSalary,

details:"Base salary updated"

});

}

// log status change
if(employmentStatus &&
oldStatus !== employmentStatus){

await logStaffHistory({

staffId:staff._id,

action:"STATUS_CHANGED",

userId:req.user.id,

changes:{

oldStatus,

newStatus:employmentStatus

},

details:"Employment status updated"

});

}

// general update log
await logStaffHistory({

staffId:staff._id,

action:"UPDATED",

userId:req.user.id,

details:"Staff profile updated"

});

res.json({

msg:"Staff updated successfully",

staff

});

}
catch(error){

console.error(error);

res.status(500).json({
msg:"Failed to update staff"
});

}

};

// delete staff
exports.deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ msg: "Staff not found" });
    }
    await staff.remove();
    res.json({ msg: "Staff deleted successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Failed to delete staff" });
  }
};

// deactivate staff
exports.deactivateStaff = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ msg: "Staff not found" });
    }
    staff.employmentStatus = "inactive";
    staff.isActive = false;

    //check who is deactivating
    staff.deactivatedBy = req.user.id;
    staff.deactivatedAt = Date.now();



    await staff.save();
    res.json({ msg: "Staff deactivated successfully", staff });
  } catch (error) {
    res.status(500).json({ msg: "Failed to deactivate staff" });
  }
};

// activate staff
exports.activateStaff = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ msg: "Staff not found" });
    }
    staff.employmentStatus = "active";
    staff.isActive = true;
    await staff.save();
    res.json({ msg: "Staff activated successfully", staff });
  } catch (error) {
    res.status(500).json({ msg: "Failed to activate staff" });
  }
};

// get staff history
exports.getStaffHistory = async(req,res)=>{

try{

const { id } = req.params;

if (!id) {
return res.status(400).json({ msg: "Staff ID is required" });
}

const history =
await StaffHistory
.find({staff:id})
.populate("performedBy","name role")
.populate("staff","firstName lastName staffId position")
.sort({createdAt:-1});

res.json(history);

}
catch(err){

res.status(500).json({
msg:"Failed to get history"
});

}

};