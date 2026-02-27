const BankBalance = require("../models/bankModel");

//initialize bank balance (to be run once)
exports.initializeBank = async (req, res) => {
  try {
    // Check if bank balance already exists
    const existingBank = await BankBalance.findOne();

    if (existingBank) {
      return res.status(400).json({
        msg: "Bank balance already initialized",
        bank: existingBank
      });
    }

    // Create new bank balance with defaults
    const bank = await BankBalance.create({
      PMS: 0,
      AGO: 0,
      products: 0,
      otherIncome: 0,
      lastUpdatedBy: req.user.id
    });

    res.status(201).json({
      msg: "Bank balance initialized successfully",
      bank
    });
  } catch (error) {
    res.status(500).json({
      msg: "Failed to initialize bank balance",
      error: error.message
    });
  }
};

//add to bank balance
exports.addBankBalance = async (req, res) => {
  try {
    const bank = await BankBalance.findOne();
    const { type, amount } = req.body;

    //add validation
    const validTypes = ["PMS", "AGO", "products", "otherIncome"];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ msg: "Invalid balance type" });
    }

    //ensure amount is positive number
    const amt = Number(amount);
    if (isNaN(amt) || amt <= 0) {
      return res.status(400).json({ msg: "Invalid amount" });
    }

    //

    bank[type] += amt;
    bank.lastUpdatedBy = req.user.id;

    await bank.save();

    res.json({ msg: "Bank balance updated", bank });
  } catch (error) {
    res.status(500).json({ msg: "Failed to update bank balance" });
  }
};

//get bank balance
exports.getBankBalance = async (req, res) => {
  try {
    const bank = await BankBalance.findOne();
    res.json(bank);
  } catch (error) {
    res.status(500).json({ msg: "Failed to get bank balance" });
  }
};

//get PMS balance
exports.getPMSBalance = async (req, res) => {
  try {
    const bank = await BankBalance.findOne();
    res.json({ PMS: bank.PMS });
  }
    catch (error) {
    res.status(500).json({ msg: "Failed to get PMS balance" });
  }
};

//get AGO balance
exports.getAGOBalance = async (req, res) => {
  try {
    const bank = await BankBalance.findOne();
    res.json({ AGO: bank.AGO });
  }
    catch (error) {
    res.status(500).json({ msg: "Failed to get AGO balance" });
  }
};

//get other income balance
exports.getOtherIncomeBalance = async (req, res) => {
  try {
    const bank = await BankBalance.findOne();
    res.json({ otherIncome: bank.otherIncome });
  }
    catch (error) {
    res.status(500).json({ msg: "Failed to get other income balance" });
  }
};