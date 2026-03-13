const DailySales = require("../models/dailySalesModel");

exports.getDailyProfitReport = async (req, res) => {
  try {
    const { date } = req.params;

    if (!date) {
      return res.status(400).json({ msg: "Date query is required" });
    }

    const queryDate = new Date(date);
    if (isNaN(queryDate.getTime())) {
      return res.status(400).json({ msg: "Invalid date format" });
    }

    const startOfDay = new Date(queryDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(queryDate);
    endOfDay.setHours(23, 59, 59, 999);

    const report = await DailySales.findOne({
      salesDate: { $gte: startOfDay, $lte: endOfDay },
      isDeleted: false,
      approvalStatus: "approved"
    })
      .populate("createdBy", "name role")
      .populate("approvedBy", "name role");

    if (!report) {
      return res.status(404).json({ msg: "No approved sales for this date" });
    }

    res.json({
      salesDate: report.salesDate,
      PMS: {
        litres: report.PMS.totalLitres,
        price: report.PMS.pricePerLitre,
        revenue: report.PMS.totalAmount,
        expenses: report.PMS.totalExpenses,
        netProfit: report.PMS.pNetSales
      },
      AGO: {
        litres: report.AGO.litresSold,
        price: report.AGO.pricePerLitre,
        revenue: report.AGO.totalAmount,
        expenses: report.AGO.totalExpenses,
        netProfit: report.AGO.ANetSales
      },
      otherIncome: report.totalOtherIncome,
      totalNetProfit:
        report.PMS.pNetSales +
        report.AGO.ANetSales +
        report.totalOtherIncome
    });

  } catch (error) {
    res.status(500).json({
      msg: "Failed to fetch daily profit report",
      error: error.message
    });
  }
};

exports.getProfitSummary = async (req, res) => {
  try {
    const { from, to } = req.query;

    const summary = await DailySales.aggregate([

      {
        $match: {
          salesDate:{
            $gte: new Date(from),
            $lte: new Date(to)
          },
          approvalStatus:"approved",
          isDeleted:false
        }
      },

      // expand pumps array
      {
        $unwind:"$PMS.pumps"
      },

      // group pump categories
      {
        $group:{
          _id:null,

          pump12Litres:{
            $sum:{
              $cond:[
                {$in:["$PMS.pumps.pumpNumber",[1,2]]},
                "$PMS.pumps.netLitresSold",
                0
              ]
            }
          },

          pump34Litres:{
            $sum:{
              $cond:[
                {$in:["$PMS.pumps.pumpNumber",[3,4]]},
                "$PMS.pumps.netLitresSold",
                0
              ]
            }
          },

          totalPMSLitres:{
            $sum:"$PMS.pumps.netLitresSold"
          },

          totalPMSRevenue:{ $sum:"$PMS.totalAmount" },
          totalPMSExpenses:{ $sum:"$PMS.totalExpenses" },
          totalPMSNet:{ $sum:"$PMS.pNetSales" },

          totalAGOLitres:{ $sum:"$AGO.litresSold" },
          totalAGORevenue:{ $sum:"$AGO.totalAmount" },
          totalAGOExpenses:{ $sum:"$AGO.totalExpenses" },
          totalAGONet:{ $sum:"$AGO.ANetSales" },

          totalProductSold:{ $sum:"$totalProductsSales" },

          totalOtherIncome:{ $sum:"$totalOtherIncome" }

        }
      }

    ]);

    if(!summary.length){
      return res.json({msg:"No data"});
    }

    const data = summary[0];

    res.json({

      period:{from,to},

      PMS:{
        pump12Litres:data.pump12Litres,
        pump34Litres:data.pump34Litres,
        totalLitres:data.totalPMSLitres,
        revenue:data.totalPMSRevenue,
        expenses:data.totalPMSExpenses,
        netProfit:data.totalPMSNet
      },

      AGO:{
        litres:data.totalAGOLitres,
        revenue:data.totalAGORevenue,
        expenses:data.totalAGOExpenses,
        netProfit:data.totalAGONet
      },

      products:{
        revenue:data.totalProductSold
      },

      otherIncome:data.totalOtherIncome,

      grandTotalProfit:

        data.totalPMSNet +
        data.totalAGONet +
        data.totalProductSold +
        data.totalOtherIncome

    });

  } catch(error){

    console.error(error);

    res.status(500).json({
      msg:"Failed to generate profit summary"
    });

  }
};


exports.getAuditTrail = async (req, res) => {
  try {

    const start = new Date(req.params.date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(req.params.date);
    end.setHours(23, 59, 59, 999);

    const record = await DailySales.findOne({
      salesDate: { $gte: start, $lte: end }
    })
      .populate("createdBy", "name role")
      .populate("submittedBy", "name role")
      .populate("approvedBy", "name role")
      .populate("updatedBy", "name role")
      .populate("deletedBy", "name role");

    if (!record) {
      return res.status(404).json({
        msg: "Sales record not found"
      });
    }

    res.json({
      salesDate: record.salesDate,
      createdBy: record.createdBy,
      submittedBy: record.submittedBy,
      approvedBy: record.approvedBy,
      updatedBy: record.updatedBy,
      updateReason: record.updateReason,
      deleted: record.isDeleted,
      deletedBy: record.deletedBy,
      deleteReason: record.deleteReason
    });

  } catch (error) {
    console.error("Audit Trail Error:", error);
    res.status(500).json({
      msg: "Failed to fetch audit trail"
    });
  }
};

exports.getPumpCalibrationAudit = async (req,res)=>{

try{

const {from,to} = req.query;

const audit = await DailySales.aggregate([

{
$match:{
salesDate:{
$gte:new Date(from),
$lte:new Date(to)
}
}
},

{
$unwind:"$PMS.pumps"
},

{
$match:{
"PMS.pumps.calibrationLitres":{
$gt:0
}
}
},

{
$project:{

salesDate:1,

pumpNumber:"$PMS.pumps.pumpNumber",

calibrationLitres:
"$PMS.pumps.calibrationLitres",

calibrationReason:
"$PMS.pumps.calibrationReason",

calibratedBy:
"$PMS.pumps.calibratedBy"

}
},

{
$lookup:{
from:"users",
localField:"calibratedBy",
foreignField:"_id",
as:"staff"
}
},

{
$unwind:{
path:"$staff",
preserveNullAndEmptyArrays:true
}
},

{
$project:{
salesDate:1,
pumpNumber:1,
calibrationLitres:1,
calibrationReason:1,
staffName:"$staff.name"
}
}

]);

res.json(audit);

}catch(error){

console.error(error);

res.status(500).json({
msg:"Failed audit fetch"
});

}
};

