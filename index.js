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

dotenv.config();

const app = express(); // ✅ CREATE APP FIRST

connectDB();

// ✅ CORS MUST COME AFTER app IS CREATED
const allowedOrigins = [
  "http://localhost:5173",
  "https://deepdrroptech.netlify.app",
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

// Test route
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
