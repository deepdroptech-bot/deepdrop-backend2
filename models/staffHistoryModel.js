const mongoose = require("mongoose");

const staffHistorySchema = new mongoose.Schema({

staff:{
type: mongoose.Schema.Types.ObjectId,
ref:"Staff",
required:true
},

action:{
type:String,
enum:[
"CREATED",
"UPDATED",
"STATUS_CHANGED",
"BONUS_ADDED",
"DEDUCTION_ADDED",
"SALARY_PAID",
"SALARY_ADJUSTED",
"DEACTIVATED",
"REACTIVATED"
],
required:true
},

details:{
type:String,
default:""
},

changes:{
type:Object,
default:{}
},

amount:{
type:Number
},

previousSalary:{
type:Number
},

newSalary:{
type:Number
},

performedBy:{
type: mongoose.Schema.Types.ObjectId,
ref:"User",
required:true
},

createdAt:{
type:Date,
default:Date.now
}

});

module.exports =
mongoose.model(
"StaffHistory",
staffHistorySchema
);