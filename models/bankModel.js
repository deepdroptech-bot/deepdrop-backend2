const mongoose = require("mongoose");

const bankHistorySchema = new mongoose.Schema({

  type:{
    type:String,
    enum:["PMS","AGO","products","otherIncome"],
    required:true
  },

  amount:{
    type:Number,
    required:true
  },

  narration:{
    type:String,
    required:true
  },

  addedBy:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
  },

  addedAt:{
    type:Date,
    default:Date.now
  }

},{_id:false});


const bankBalanceSchema = new mongoose.Schema(
{
  PMS:{
    type:Number,
    default:0
  },

  AGO:{
    type:Number,
    default:0
  },

  products:{
    type:Number,
    default:0
  },

  otherIncome:{
    type:Number,
    default:0
  },

  history:[bankHistorySchema],

  lastUpdatedBy:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
  }

},
{timestamps:true}
);

module.exports = mongoose.model("BankBalance",bankBalanceSchema);