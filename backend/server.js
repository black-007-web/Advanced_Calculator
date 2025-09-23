const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors()); // allow requests from frontend

// ✅ Serve static landing page directly from backend folder
app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ✅ Currency conversion endpoint
app.get("/convert", async (req, res) => {
  const { from, to, amount } = req.query;

  if (!from || !to || isNaN(amount)) {
    return res.status(400).json({ error: "Invalid query parameters" });
  }

  try {
    // Fetch latest rates for base currency
    const resp = await axios.get(`https://open.er-api.com/v6/latest/${from.toUpperCase()}`);
    const rates = resp.data.rates;

    if (!rates[to.toUpperCase()]) {
      return res.status(400).json({ error: "Target currency not supported" });
    }

    const convertedAmount = parseFloat(amount) * rates[to.toUpperCase()];
    res.json({ conversion_result: convertedAmount });
  } catch (err) {
    console.error("Currency API error:", err.message);
    res.status(500).json({ error: "Conversion failed" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

