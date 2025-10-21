// binary.js
(() => {
  const binInput = document.getElementById('binInput');
  const convBtns = document.querySelectorAll('.conv-btn');
  const binConvResult = document.getElementById('binConvResult');
  const binA = document.getElementById('binA');
  const binB = document.getElementById('binB');
  const binButtons = document.querySelectorAll('.op-bin');
  const binCalcResult = document.getElementById('binCalcResult');
  const binClear = document.getElementById('binClear');
  const operationLabel = document.getElementById('binOperation');

  // 🆕 Bit length input (1–32)
  const bitInput = document.getElementById('bitLength');
  function getBitLength() {
    const bit = parseInt(bitInput?.value);
    if (!bit || bit < 1 || bit > 32) return null;
    return bit;
  }

  // 🆕 Format binary output according to bit length
  function formatToBits(binStr, bits) {
    if (!bits) return binStr;
    if (binStr.length < bits) return binStr.padStart(bits, '0');
    if (binStr.length > bits) return binStr.slice(-bits);
    return binStr;
  }

  // 🆕 Floating result box control
  const floatBox = document.getElementById('floatBox');

  function showFloatingResult(text) {
    if (!floatBox) return;
    floatBox.textContent = text;
    floatBox.classList.add('show');
  }

  // Hide floating box only when clicking outside
  document.addEventListener('click', (e) => {
    if (floatBox && floatBox.classList.contains('show')) {
      if (!floatBox.contains(e.target)) {
        floatBox.classList.remove('show');
      }
    }
  });

  // Binary validation (same as before)
  function validateBinary(s) {
    return /^[01]{1,16}$/.test(s);
  }

  // Conversion buttons
  convBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.type;
      const val = binInput.value.trim();
      const bits = getBitLength();
      if (!val) {
        binConvResult.textContent = 'Conversion: Enter a value';
        showFloatingResult('Enter a value');
        return;
      }
      try {
        let out = '';
        switch (type) {
          case 'dec2bin':
            out = bigInt(val, 10).toString(2);
            out = formatToBits(out, bits);
            break;
          case 'bin2dec':
            if (!validateBinary(val)) throw 'Invalid binary';
            out = bigInt(val, 2).toString(10);
            break;
          case 'bin2hex':
            if (!validateBinary(val)) throw 'Invalid binary';
            out = bigInt(val, 2).toString(16).toUpperCase();
            break;
          case 'hex2bin':
            out = bigInt(val, 16).toString(2);
            out = formatToBits(out, bits);
            break;
        }
        const resultText = `Conversion: ${out}`;
        binConvResult.textContent = resultText;
        operationLabel.textContent = `Operation: ${type}`;
        showFloatingResult(resultText);
      } catch (e) {
        const err = `Conversion: ${e}`;
        binConvResult.textContent = err;
        showFloatingResult(err);
      }
    });
  });

  // Binary operation buttons
  binButtons.forEach(b => {
    b.addEventListener('click', () => {
      const op = b.dataset.op;
      const a = binA.value.trim();
      const c = binB.value.trim();
      const bits = getBitLength();
      if (!validateBinary(a) || !validateBinary(c)) {
        const msg = 'Binary Op Result: Invalid binary (max 16 bits)';
        binCalcResult.textContent = msg;
        showFloatingResult(msg);
        return;
      }
      try {
        const x = bigInt(a, 2);
        const y = bigInt(c, 2);
        let r;
        switch (op) {
          case 'add': r = x.add(y); break;
          case 'sub': r = x.subtract(y); break;
          case 'mul': r = x.multiply(y); break;
          case 'div':
            if (y.equals(0)) throw 'Divide by zero';
            r = x.divide(y);
            break;
        }
        const binRes = formatToBits(r.toString(2), bits);
        const decRes = r.toString(10);
        const resultText = `Binary Op Result: ${binRes} (dec ${decRes})`;
        binCalcResult.textContent = resultText;
        showFloatingResult(resultText);
      } catch (e) {
        const err = `Binary Op Result: ${e}`;
        binCalcResult.textContent = err;
        showFloatingResult(err);
      }
    });
  });

  // Clear all fields
  binClear.addEventListener('click', () => {
    binA.value = '';
    binB.value = '';
    binInput.value = '';
    if (bitInput) bitInput.value = '';
    binConvResult.textContent = 'Conversion: —';
    binCalcResult.textContent = 'Binary Op Result: —';
    operationLabel.textContent = 'Operation: —';
    showFloatingResult('Cleared All Inputs');
  });
})();
