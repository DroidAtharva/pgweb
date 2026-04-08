const express = require("express");
const app = express();

// 🔐 Environment variables (FIX)
const PORT = process.env.PORT || 5000;
const SECRET = process.env.SECRET_KEY || "default_secret";

// Middleware
app.use(express.json());

// ✅ Root route
app.get("/", (req, res) => {
  res.send("Backend secured with environment variables");
});

// ✅ API route
app.get("/api", (req, res) => {
  res.json({ message: "API working" });
});

// ✅ Secret route (proves env working)
app.get("/secret", (req, res) => {
  res.send(`Secret is: ${SECRET}`);
});

// 🚀 Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});