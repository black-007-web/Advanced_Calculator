(() => {
  const exprInput = document.getElementById('exprInput');
  const arithResult = document.getElementById('arithResult');
  const computeBtn = document.getElementById('computeBtn');
  const undoBtn = document.getElementById('undoBtn');
  const clearBtn = document.getElementById('clearBtn');
  const opButtons = document.querySelectorAll('.op-btn');

  let history = [];

  // Custom inverse trig functions in degrees
  math.import({
    asinDeg: x => math.unit(math.asin(x), 'rad').toNumber('deg'),
    acosDeg: x => math.unit(math.acos(x), 'rad').toNumber('deg'),
    atanDeg: x => math.unit(math.atan(x), 'rad').toNumber('deg'),
    asecDeg: x => math.unit(math.acos(1 / x), 'rad').toNumber('deg'),
    acscDeg: x => math.unit(math.asin(1 / x), 'rad').toNumber('deg'),
    acotDeg: x => math.unit(math.atan(1 / x), 'rad').toNumber('deg'),
  }, { override: true });

  // Append operator/function to input
  function appendToExpression(op) {
    const funcOps = [
      'sqrt', 'sin', 'cos', 'tan',
      'sec', 'csc', 'cot',
      'log', 'ln', 'exp'
    ];
    const inverseOps = ['asin', 'acos', 'atan', 'asec', 'acsc', 'acot'];

    if (funcOps.includes(op)) {
      exprInput.value += `${op}(`;
    } else if (inverseOps.includes(op)) {
      exprInput.value += `${op}(`; // User types normally
    } else if (op === 'nthRoot') {
      exprInput.value += 'nthRoot( , )';
      setTimeout(() => {
        const pos = exprInput.value.indexOf(' ');
        exprInput.setSelectionRange(pos, pos);
        exprInput.focus();
      }, 0);
    } else if (op === 'factorial' || op === '!') {
      exprInput.value += '!';
    } else {
      exprInput.value += op;
    }
    exprInput.focus();
  }

  // Evaluate expression
  function computeExpression() {
    let expr = exprInput.value;
    if (!expr) return;

    try {
      // Replace ln → log, √ → sqrt
      expr = expr.replace(/ln\(/g, 'log(');
      expr = expr.replace(/√/g, 'sqrt');

      // Replace inverse trig with degree versions
      expr = expr.replace(/asin\(/g, 'asinDeg(');
      expr = expr.replace(/acos\(/g, 'acosDeg(');
      expr = expr.replace(/atan\(/g, 'atanDeg(');
      expr = expr.replace(/asec\(/g, 'asecDeg(');
      expr = expr.replace(/acsc\(/g, 'acscDeg(');
      expr = expr.replace(/acot\(/g, 'acotDeg(');

      const result = math.evaluate(expr);
      history.push(exprInput.value);
      arithResult.textContent = `Result: ${result}`;
      arithResult.classList.remove('error');
    } catch (e) {
      arithResult.textContent = 'Result: Invalid Expression';
      arithResult.classList.add('error');
    }
  }

  // Undo last expression
  function undoExpression() {
    if (history.length > 0) {
      exprInput.value = history.pop();
    } else {
      exprInput.value = '';
    }
    arithResult.textContent = 'Result: —';
    arithResult.classList.remove('error');
  }

  // Event listeners for operator buttons
  opButtons.forEach(btn => {
    if (!btn.dataset.op) return;
    btn.addEventListener('click', () => appendToExpression(btn.dataset.op));
  });

  // Compute button
  computeBtn.addEventListener('click', computeExpression);

  // Undo button
  undoBtn.addEventListener('click', undoExpression);

  // Clear button
  clearBtn.addEventListener('click', () => {
    exprInput.value = '';
    arithResult.textContent = 'Result: —';
    arithResult.classList.remove('error');
  });

  // Press Enter to compute
  exprInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      computeExpression();
    }
  });
})();
