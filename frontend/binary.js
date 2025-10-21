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

  // ✅ Floating output box
  const floatBox = document.getElementById('floatBox');

  function validateBinary(s) {
    return /^[01]{1,16}$/.test(s);
  }

  // ✅ Helper: show floating box
  function showFloatBox(text) {
    if (!floatBox) return alert(text); // fallback
    floatBox.textContent = text;
    floatBox.classList.add('show');

    // wait for outside click to close
    const closeOnOutsideClick = e => {
      if (!floatBox.contains(e.target)) {
        floatBox.classList.remove('show');
        document.removeEventListener('click', closeOnOutsideClick);
      }
    };
    setTimeout(() => document.addEventListener('click', closeOnOutsideClick), 50);
  }

  convBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.type;
      const val = binInput.value.trim();
      if (!val) {
        binConvResult.textContent = 'Conversion: Enter a value';
        showFloatBox('Enter a value first.');
        return;
      }
      try {
        let out = '';
        switch (type) {
          case 'dec2bin':
            out = bigInt(val, 10).toString(2);
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
            break;
        }
        const msg = `Conversion (${type}): ${out}`;
        binConvResult.textContent = msg;
        operationLabel.textContent = `Operation: ${type}`;
        showFloatBox(msg);
      } catch (e) {
        const msg = `Conversion: ${e}`;
        binConvResult.textContent = msg;
        showFloatBox(msg);
      }
    });
  });

  binButtons.forEach(b => {
    b.addEventListener('click', () => {
      const op = b.dataset.op;
      const a = binA.value.trim();
      const c = binB.value.trim();
      if (!validateBinary(a) || !validateBinary(c)) {
        const msg = 'Binary Op Result: Invalid binary (max 16 bits)';
        binCalcResult.textContent = msg;
        showFloatBox(msg);
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
        const msg = `Binary Op Result: ${r.toString(2)} (dec ${r.toString(10)})`;
        binCalcResult.textContent = msg;
        showFloatBox(msg);
      } catch (e) {
        const msg = `Binary Op Result: ${e}`;
        binCalcResult.textContent = msg;
        showFloatBox(msg);
      }
    });
  });

  binClear.addEventListener('click', () => {
    binA.value = '';
    binB.value = '';
    binInput.value = '';
    binConvResult.textContent = 'Conversion: —';
    binCalcResult.textContent = 'Binary Op Result: —';
    operationLabel.textContent = 'Operation: —';
    showFloatBox('Cleared all fields.');
  });
})();
