const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");

const Sales = require("../models/dailySalesModel");
const Staff = require("../models/staffModel");
const expense = require ("../models/expenseModel");

const generateStaffHTML = require("../template/staffTemplate");
const generateSalesHTML = require("../template/salesTemplate");
const generateStaffSalaryHTML = require("../template/staffSalarylistTemplate");
const generateExpenseHTML = require("../template/expensesTemplate");

exports.generateSalesPDF = async (req, res) => {
  try {
    const sales = await Sales.findById(req.params.id)
      .populate("createdBy submittedBy approvedBy");

    if (!sales) {
      return res.status(404).json({ message: "Sales record not found" });
    }

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
      "Content-Disposition": `attachment; filename=Daily_Sales_${req.params.id}.pdf`,
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
      "Content-Disposition": `attachment; filename=Staff_Details_${req.params.id}.pdf`,
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
