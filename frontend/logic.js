(() => {
  const modeSelect = document.getElementById('modeSelect');
  const inputCountSelect = document.getElementById('inputCount');
  const gateBtns = document.querySelectorAll('.gate-btn');
  const logicExpr = document.getElementById('logicExpression');
  const logicRes = document.getElementById('logicResult');
  const truthTableDiv = document.getElementById('truthTable');
  const clearBtn = document.getElementById('logicClear');
  const truthSettings = document.getElementById('truthTableSettings');
  const manualSettings = document.getElementById('manualInputSettings');
  const manualInputsDiv = document.getElementById('manualInputs');

  const gateFuncs = {
    AND: (inputs) => inputs.reduce((a, b) => a & b),
    OR:  (inputs) => inputs.reduce((a, b) => a | b),
    NAND:(inputs) => +!(inputs.reduce((a, b) => a & b)),
    NOR: (inputs) => +!(inputs.reduce((a, b) => a | b)),
    XOR: (inputs) => inputs.reduce((a, b) => a ^ b),
    XNOR:(inputs) => +!(inputs.reduce((a, b) => a ^ b))
  };

  // Generate all combinations of n inputs (0/1)
  function generateCombinations(n) {
    const combos = [];
    const total = 2 ** n;
    for (let i = 0; i < total; i++) {
      const combo = [];
      for (let j = n - 1; j >= 0; j--) {
        combo.push((i >> j) & 1);
      }
      combos.push(combo);
    }
    return combos;
  }

  // Show truth table for n inputs
  function showTruthTable(gateName, n) {
    const combos = generateCombinations(n);
    let html = '<table><tr>';
    for (let i = 1; i <= n; i++) html += `<th>Input ${i}</th>`;
    html += '<th>Output</th></tr>';
    combos.forEach(combo => {
      const out = gateFuncs[gateName](combo);
      html += '<tr>';
      combo.forEach(v => html += `<td>${v}</td>`);
      html += `<td>${out}</td></tr>`;
    });
    html += '</table>';
    truthTableDiv.innerHTML = html;
  }

  // Generate manual input fields for binary string mode
  function generateManualInputs(n) {
    manualInputsDiv.innerHTML = '';
    for (let i = 0; i < 2; i++) { // always two inputs for manual binary mode
      const inp = document.createElement('input');
      inp.type = 'text';
      inp.placeholder = `Binary Input ${i + 1}`;
      inp.classList.add('manual-input');
      manualInputsDiv.appendChild(inp);
    }
  }

  // Perform bitwise operation on two binary strings
  function bitwiseOperation(binA, binB, gate) {
    // Pad shorter string with zeros
    const maxLen = Math.max(binA.length, binB.length);
    binA = binA.padStart(maxLen, '0');
    binB = binB.padStart(maxLen, '0');
    let result = '';
    for (let i = 0; i < maxLen; i++) {
      const a = parseInt(binA[i], 2);
      const b = parseInt(binB[i], 2);
      let r;
      switch (gate) {
        case 'AND': r = a & b; break;
        case 'OR': r = a | b; break;
        case 'NAND': r = +( !(a & b) ); break;
        case 'NOR': r = +( !(a | b) ); break;
        case 'XOR': r = a ^ b; break;
        case 'XNOR': r = +( !(a ^ b) ); break;
        default: r = 0;
      }
      result += r.toString();
    }
    return result;
  }

  modeSelect.addEventListener('change', () => {
    const mode = modeSelect.value;
    if (mode === 'truth') {
      truthSettings.style.display = 'block';
      manualSettings.style.display = 'none';
      truthTableDiv.innerHTML = '';
      logicExpr.textContent = 'Expression: —';
      logicRes.textContent = 'Output: —';
    } else {
      truthSettings.style.display = 'none';
      manualSettings.style.display = 'block';
      generateManualInputs(parseInt(inputCountSelect.value, 10));
      truthTableDiv.innerHTML = '';
      logicExpr.textContent = 'Expression: —';
      logicRes.textContent = 'Output: —';
    }
  });

  inputCountSelect.addEventListener('change', () => {
    if (modeSelect.value === 'manual') {
      generateManualInputs(parseInt(inputCountSelect.value, 10));
    }
  });

  gateBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const gate = btn.dataset.g;
      const mode = modeSelect.value;
      const n = parseInt(inputCountSelect.value, 10);
      if (!gateFuncs[gate]) return;

      if (mode === 'truth') {
        logicExpr.textContent = `Expression: ${gate} Gate with ${n} Input${n > 1 ? 's' : ''}`;
        const outputs = generateCombinations(n).map(c => gateFuncs[gate](c));
        logicRes.textContent = `Output: [ ${outputs.join(', ')} ]`;
        showTruthTable(gate, n);
      } else {
        // Manual binary string mode
        const manualValues = Array.from(document.querySelectorAll('.manual-input'))
          .map(i => i.value.trim());
        if (manualValues.some(v => !/^[01]+$/.test(v))) {
          logicRes.textContent = 'Output: Inputs must be valid binary strings';
          logicExpr.textContent = 'Expression: —';
          return;
        }
        const out = bitwiseOperation(manualValues[0], manualValues[1], gate);
        logicExpr.textContent = `Expression: ${manualValues[0]} ${gate} ${manualValues[1]}`;
        logicRes.textContent = `Output: ${out}`;
        truthTableDiv.innerHTML = '';
      }
    });
  });

  clearBtn.addEventListener('click', () => {
    logicExpr.textContent = 'Expression: —';
    logicRes.textContent = 'Output: —';
    truthTableDiv.innerHTML = '';
    inputCountSelect.value = '2';
    generateManualInputs(parseInt(inputCountSelect.value, 10));
  });

  // Initialize manual inputs on load
  generateManualInputs(parseInt(inputCountSelect.value, 10));
})();
