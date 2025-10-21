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

  // 🆕 Get bit length input (1–32)
  const bitInput = document.getElementById('bitLength');
  function getBitLength() {
    const bit = parseInt(bitInput?.value);
    if (!bit || bit < 1 || bit > 32) return null;
    return bit;
  }

  // 🆕 Pad/trim binary string to user bit length
  function formatToBits(binStr, bits) {
    if (!bits) return binStr;
    if (binStr.length < bits) return binStr.padStart(bits, '0');
    if (binStr.length > bits) return binStr.slice(-bits);
    return binStr;
  }

  // 🆕 Floating box animation
  const floatBox = document.getElementById('floatBox');
  function showFloatingResult(text) {
    if (!floatBox) return;
    floatBox.textContent = text;
    floatBox.classList.add('show');
    setTimeout(() => floatBox.classList.remove('show'), 3500);
  }

  function validateBinary(s) { return /^[01]{1,16}$/.test(s); }

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
        binConvResult.textContent = `Conversion: ${out}`;
        operationLabel.textContent = `Operation: ${type}`;
        showFloatingResult(`Conversion: ${out}`);
      } catch (e) {
        binConvResult.textContent = `Conversion: ${e}`;
        showFloatingResult(`Error: ${e}`);
      }
    });
  });

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
          case 'div': r = y.equals(0) ? (() => { throw 'Divide by zero'; })() : x.divide(y); break;
        }
        const binRes = formatToBits(r.toString(2), bits);
        const decRes = r.toString(10);
        const output = `Binary Op Result: ${binRes} (dec ${decRes})`;
        binCalcResult.textContent = output;
        showFloatingResult(output);
      } catch (e) {
        const errMsg = `Binary Op Result: ${e}`;
        binCalcResult.textContent = errMsg;
        showFloatingResult(errMsg);
      }
    });
  });

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
