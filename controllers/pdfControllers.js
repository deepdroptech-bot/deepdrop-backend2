const puppeteer = require("puppeteer");
const Sales = require("../models/dailySalesModel");
const generateSalesHTML = require("../template/salesTemplate");

exports.generateSalesPDF = async (req, res) => {
  try {
    const sales = await Sales.findById(req.params.id)
      .populate("createdBy submittedBy approvedBy");

    if (!sales) {
      return res.status(404).json({ message: "Sales record not found" });
    }

    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
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
      "Content-Disposition": "attachment; filename=sales-report.pdf",
    });

    res.send(pdf);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to generate PDF" });
  }
};