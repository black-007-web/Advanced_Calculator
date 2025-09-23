const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors()); // allow requests from frontend

// Currency conversion endpoint
app.get('/convert', async (req, res) => {
  const { from, to, amount } = req.query;

  if (!from || !to || isNaN(amount)) {
    return res.status(400).json({ error: 'Invalid query parameters' });
  }

  try {
    // Fetch latest rates for base currency
    const resp = await axios.get(`https://open.er-api.com/v6/latest/${from}`);
    const rates = resp.data.rates;

    if (!rates[to]) {
      return res.status(400).json({ error: 'Target currency not supported' });
    }

    const convertedAmount = parseFloat(amount) * rates[to];
    res.json({ conversion_result: convertedAmount });
  } catch (err) {
    console.error('Currency API error:', err.message);
    res.status(500).json({ error: 'Conversion failed' });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
