const express = require("express");
const router = express.Router();

// Example endpoint: GET /api/charts
router.get("/", (req, res) => {
  res.json({ message: "Charts API is working 🚀" });
});

module.exports = router;
