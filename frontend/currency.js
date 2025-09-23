(() => {
  const API_BASE = "https://api-advancedcalculator.onrender.com"; // Render backend URL

  const convBtn = document.getElementById('convCurrencyBtn');
  const clearBtn = document.getElementById('currencyClear');
  const amountInput = document.getElementById('amount');
  const fromCur = document.getElementById('fromCur');
  const toCur = document.getElementById('toCur');
  const currencyResult = document.getElementById('currencyResult');

  convBtn.addEventListener('click', async () => {
    const amt = parseFloat(amountInput.value);
    if (isNaN(amt) || amt < 0) {
      currencyResult.textContent = 'Conversion: Invalid amount';
      currencyResult.classList.add('error');
      return;
    }

    currencyResult.classList.remove('error');
    currencyResult.textContent = 'Converting…';

    const from = fromCur.value;
    const to = toCur.value;

    try {
      const resp = await fetch(`${API_BASE}/convert?from=${from}&to=${to}&amount=${amt}`);
      const data = await resp.json();

      if (data && typeof data.conversion_result !== 'undefined') {
        currencyResult.textContent = `Conversion: ${data.conversion_result.toFixed(2)} ${to}`;
      } else if (data && data.error) {
        currencyResult.textContent = `Conversion: ${data.error}`;
        currencyResult.classList.add('error');
      } else {
        currencyResult.textContent = 'Conversion: Unexpected response';
        currencyResult.classList.add('error');
      }
    } catch (err) {
      currencyResult.textContent = 'Conversion: Server error';
      currencyResult.classList.add('error');
      console.error('Currency API error:', err);
    }
  });

  clearBtn.addEventListener('click', () => {
    amountInput.value = '';
    currencyResult.textContent = 'Conversion: —';
    currencyResult.classList.remove('error');
  });
})();
