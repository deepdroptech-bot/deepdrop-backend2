const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");

const {generatePDF} =
require("../utils/pdfGenerator");

const Sales = require("../models/dailySalesModel");
const Staff = require("../models/staffModel");
const expense = require ("../models/expenseModel");

const generateStaffHTML = require("../template/staffTemplate");
const generateSalesHTML = require("../template/salesTemplate");
const generateStaffSalaryHTML = require("../template/staffSalarylistTemplate");
const generateExpenseHTML = require("../template/expensesTemplate");
const generateCalibrationHTML = require("../template/calibrationTemplate");
const generateProfitHTML = require("../template/profitSummaryTemplate");

exports.generateSalesPDF = async (req, res) => {
  try {
    const sales = await Sales.findById(req.params.id)
      .populate("createdBy submittedBy approvedBy");

    if (!sales) {
      return res.status(404).json({ message: "Sales record not found" });
    }

    const date = new Date(sales.salesDate)
  .toISOString()
  .split("T")[0];

    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();

    const html = generateSalesHTML(sales);

    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=Daily_Sales_${date}.pdf`,
    });

    res.send(pdf);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to generate PDF" });
  }
};

exports.generateStaffPDF = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ message: "Staff record not found" });
    }

    const staffName = `${staff.firstName}_${staff.lastName}`;

    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
    const page = await browser.newPage();
    const html = generateStaffHTML(staff);
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
    });
    await browser.close();
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=Staff_Details_${staffName}.pdf`,
    });
    res.send(pdf);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to generate PDF" });
  }
};

exports.generateStaffSalaryPDF = async (req, res) => {
  try {
    const staffList = await Staff.find({});
    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
    const page = await browser.newPage();
    const html = generateStaffSalaryHTML(staffList);
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
    });
    await browser.close();
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=Staff_Salary_Details.pdf`,
    });
    res.send(pdf);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to generate PDF" });
  }
};

exports.generateExpensePDF = async (req, res) => {
  try {
    const expenses = await expense.findById(req.params.id)
      .populate("createdBy closedBy");
    if (!expenses) {
      return res.status(404).json({ message: "Expense document not found" });
    }
    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
    const page = await browser.newPage();
    const html = generateExpenseHTML(expenses);
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
    });
    await browser.close();
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=Expense_Details_${req.params.id}.pdf`,
    });
    res.send(pdf);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to generate PDF" });
  }
};

exports.generateCalibrationPDF = async(req,res)=>{

 try {
    const { from, to } = req.query;

    const audit = await Sales.aggregate([
      {
        $match: {
          salesDate: {
            $gte: new Date(from),
            $lte: new Date(to)
          }
        }
      },

      { $unwind: "$PMS.pumps" },
      { $unwind: "$PMS.pumps.sales" },

      {
        $match: {
          "PMS.pumps.sales.calibrationLitres": { $gt: 0 }
        }
      },

      {
        $project: {
          salesDate: 1,
          pumpNumber: "$PMS.pumps.pumpNumber",
          calibrationLitres: "$PMS.pumps.sales.calibrationLitres",
          calibrationReason: "$PMS.pumps.sales.calibrationReason",
          calibratedBy: "$PMS.pumps.sales.calibratedBy"
        }
      },

      {
        $lookup: {
          from: "users",
          localField: "calibratedBy",
          foreignField: "_id",
          as: "staff"
        }
      },

      {
        $unwind: {
          path: "$staff",
          preserveNullAndEmptyArrays: true
        }
      },

      {
        $project: {
          salesDate: 1,
          pumpNumber: 1,
          calibrationLitres: 1,
          calibrationReason: 1,
          staffName: "$staff.name"
        }
      }
    ]);

if(!audit.length){

return res.status(404).json({

msg:"No calibration records"

});

}

const html =
generateCalibrationHTML(audit, from, to);

const pdf =
await generatePDF(html);

res.set({

"Content-Type":
"application/pdf",

"Content-Disposition":
`attachment; filename=calibration-report.pdf`
});

res.send(pdf);

}
catch(error){

console.error(error);

res.status(500).json({

msg:"PDF generation failed"

});

}

};

exports.generateProfitSummaryPDF = async (req,res)=>{

 try {
    const { from, to } = req.query;

    const summary = await Sales.aggregate([

      {
        $match: {
          salesDate: {
            $gte: new Date(from),
            $lte: new Date(to)
          },
          approvalStatus: "approved",
          isDeleted: false
        }
      },

      // unwind pumps
      { $unwind: "$PMS.pumps" },

      // 🔥 unwind sales segments (VERY IMPORTANT)
      { $unwind: "$PMS.pumps.sales" },

      {
        $group: {
          _id: "$_id",

          pump12Litres: {
            $sum: {
              $cond: [
                { $in: ["$PMS.pumps.pumpNumber", [1, 2]] },
                "$PMS.pumps.sales.netLitresSold",
                0
              ]
            }
          },

          pump34Litres: {
            $sum: {
              $cond: [
                { $in: ["$PMS.pumps.pumpNumber", [3, 4]] },
                "$PMS.pumps.sales.netLitresSold",
                0
              ]
            }
          },

          totalPMSLitres: {
            $sum: "$PMS.pumps.sales.netLitresSold"
          },

          totalPMSRevenue: { $first: "$PMS.totalAmount" },
          totalPMSExpenses: { $first: "$PMS.totalExpenses" },
          totalPMSNet: { $first: "$PMS.pNetSales" },

          totalAGOLitres: { $first: "$AGO.litresSold" },
          totalAGORevenue: { $first: "$AGO.totalAmount" },
          totalAGOExpenses: { $first: "$AGO.totalExpenses" },
          totalAGONet: { $first: "$AGO.ANetSales" },

          totalProductSold: { $first: "$totalProductsSales" },
          totalOtherIncome: { $first: "$totalOtherIncome" }
        }
      },

      {
        $group: {
          _id: null,

          pump12Litres: { $sum: "$pump12Litres" },
          pump34Litres: { $sum: "$pump34Litres" },
          totalPMSLitres: { $sum: "$totalPMSLitres" },

          totalPMSRevenue: { $sum: "$totalPMSRevenue" },
          totalPMSExpenses: { $sum: "$totalPMSExpenses" },
          totalPMSNet: { $sum: "$totalPMSNet" },

          totalAGOLitres: { $sum: "$totalAGOLitres" },
          totalAGORevenue: { $sum: "$totalAGORevenue" },
          totalAGOExpenses: { $sum: "$totalAGOExpenses" },
          totalAGONet: { $sum: "$totalAGONet" },

          totalProductSold: { $sum: "$totalProductSold" },
          totalOtherIncome: { $sum: "$totalOtherIncome" }
        }
      }
    ]);

const data = summary[0];

const reportData = {

period: { from, to },

      PMS: {
        pump12Litres: data.pump12Litres,
        pump34Litres: data.pump34Litres,
        totalLitres: data.totalPMSLitres,
        revenue: data.totalPMSRevenue,
        expenses: data.totalPMSExpenses,
        netProfit: data.totalPMSNet
      },

      AGO: {
         litres: data.totalAGOLitres || 0,
        revenue: data.totalAGORevenue || 0,
        expenses: data.totalAGOExpenses || 0,
        netProfit: data.totalAGONet || 0
      },

      products: {
        revenue: data.totalProductSold || 0
      },

      otherIncome: data.totalOtherIncome || 0,

      grandTotalProfit:
        (data.totalPMSNet || 0) +
        (data.totalAGONet || 0) +
        (data.totalProductSold || 0) +
        (data.totalOtherIncome || 0)
};

const html =
generateProfitHTML(reportData);

const pdf =
await generatePDF(html);

res.set({

"Content-Type":
"application/pdf",

"Content-Disposition":
`attachment; filename=profit-summary-report.pdf`

});

res.send(pdf);

}
catch(error){

console.error(error);

res.status(500).json({

msg:"PDF generation failed"

});

}

};