const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const staffRoutes = require("./routes/staffRoutes");
const dailySalesRoutes = require("./routes/dailySalesRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const bankRoutes = require("./routes/bankRoutes");
const profitAuditRoutes = require("./routes/profit&AuditRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const retainedEarningsRoutes = require("./routes/retainedEarningsRoutes");
const profitOrLossRoutes = require("./routes/profitOrLossRoutes");
const dashboardOverviewRoute = require("./routes/dashboardOverviewRoute");
const pdfRouter = require("./routes/pdfRouter");

dotenv.config();

const app = express(); 

connectDB();

const allowedOrigins = [
  "http://localhost:5173",
  
  "https://ddeepdrop.netlify.app",
];


app.use(
  cors({
    origin: allowedOrigins,
    credentials: true
  })
);

// Middleware
app.use(express.json());
app.use("/uploads", express.static("uploads")); // serve uploaded images
app.use("/public",express.static("public")); 

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/daily-sales", dailySalesRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/bank", bankRoutes);
app.use("/api/profit-audit", profitAuditRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/retained-earnings", retainedEarningsRoutes);
app.use("/api/pms-pl", profitOrLossRoutes);
app.use("/api/dashboard", dashboardOverviewRoute);
app.use("/api/pdf", pdfRouter);

// Test route
app.get("/", (req, res) => {
  res.send("Backend 2 is running 🚀");
});

const PORT = process.env.PORT || 6000;
app.listen(PORT, () => {
  console.log(`Server2 running on port ${PORT}`);
});

module.exports = app;
