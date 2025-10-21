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

  // Bit length input (optional). Only used for formatting displayed binary results.
  const bitInput = document.getElementById('bitLength');
  function getBitLength() {
    if (!bitInput) return null;
    const v = bitInput.value.trim();
    if (v === '') return null;
    const bit = parseInt(v, 10);
    if (!bit || bit < 1 || bit > 32) return null;
    return bit;
  }

  // Format binary string to requested bits (pad or keep least-significant bits).
  // IMPORTANT: This only transforms the textual binary representation for display.
  function formatToBits(binStr, bits) {
    if (!bits) return binStr;
    // binStr is expected to be a plain binary string with no sign or prefixes.
    if (binStr.length < bits) return binStr.padStart(bits, '0');
    if (binStr.length > bits) return binStr.slice(-bits); // take least-significant bits
    return binStr;
  }

  // Floating display element (centered)
  const floatBox = document.getElementById('floatBox');

  function showFloating(text) {
    if (!floatBox) {
      // fallback: update existing static result box
      console.warn('floatBox not found in DOM — falling back to static output');
      return;
    }
    floatBox.textContent = text;
    floatBox.classList.add('show');
    // NOTE: No auto-hide. Hide only when user clicks outside (handled below).
  }

  // Hide floating box when clicking outside of it (only if it's visible)
  document.addEventListener('click', (e) => {
    if (!floatBox) return;
    if (!floatBox.classList.contains('show')) return;
    // If the click target is inside the floatBox, do nothing (so user can click it)
    if (floatBox.contains(e.target)) return;
    // Otherwise hide it
    floatBox.classList.remove('show');
  });

  // KEEP original validation (max 16 bits for inputs) — unchanged
  function validateBinary(s) { return /^[01]{1,16}$/.test(s); }

  // --- Conversion buttons (logic preserved) ---
  convBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.type;
      const val = binInput.value.trim();

      if (!val) {
        binConvResult.textContent = 'Conversion: Enter a value';
        showFloating('Conversion: Enter a value');
        return;
      }

      try {
        let out = '';
        switch (type) {
          case 'dec2bin':
            // parse decimal, convert to binary (string), THEN format only for display
            out = bigInt(val, 10).toString(2);
            out = formatToBits(out, getBitLength());
            break;

          case 'bin2dec':
            // validate binary input exactly as original
            if (!validateBinary(val)) throw 'Invalid binary';
            // preserve original behavior: convert to decimal string
            out = bigInt(val, 2).toString(10);
            break;

          case 'bin2hex':
            if (!validateBinary(val)) throw 'Invalid binary';
            out = bigInt(val, 2).toString(16).toUpperCase();
            break;

          case 'hex2bin':
            // parse hex then convert to binary string, THEN format only for display
            out = bigInt(val, 16).toString(2);
            out = formatToBits(out, getBitLength());
            break;

          default:
            throw 'Unknown conversion';
        }

        binConvResult.textContent = `Conversion: ${out}`;
        operationLabel.textContent = `Operation: ${type}`;
        showFloating(`Conversion: ${out}`);
      } catch (e) {
        binConvResult.textContent = `Conversion: ${e}`;
        showFloating(`Conversion: ${e}`);
      }
    });
  });

  // --- Binary operation buttons (logic preserved) ---
  binButtons.forEach(b => {
    b.addEventListener('click', () => {
      const op = b.dataset.op;
      const a = binA.value.trim();
      const c = binB.value.trim();
      // keep original input validation (max 16 bits)
      if (!validateBinary(a) || !validateBinary(c)) {
        const msg = 'Binary Op Result: Invalid binary (max 16 bits)';
        binCalcResult.textContent = msg;
        showFloating(msg);
        return;
      }

      try {
        // Use bigInt for arithmetic (same as original)
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
          default: throw 'Unknown op';
        }

        // r is a bigInt result. Convert to binary string for display, then format only for display.
        const rawBin = r.toString(2);
        const displayBin = formatToBits(rawBin, getBitLength());
        const dec = r.toString(10);

        const final = `Binary Op Result: ${displayBin} (dec ${dec})`;
        binCalcResult.textContent = final;
        showFloating(final);
      } catch (e) {
        const err = `Binary Op Result: ${e}`;
        binCalcResult.textContent = err;
        showFloating(err);
      }
    });
  });

  // --- Clear button (same behavior) ---
  binClear.addEventListener('click', () => {
    binA.value = '';
    binB.value = '';
    binInput.value = '';
    if (bitInput) bitInput.value = '';
    binConvResult.textContent = 'Conversion: —';
    binCalcResult.textContent = 'Binary Op Result: —';
    operationLabel.textContent = 'Operation: —';
    showFloating('Cleared All Inputs');
  });

})();
