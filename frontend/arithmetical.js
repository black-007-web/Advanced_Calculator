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

  // Append operator/function to input and place cursor inside parentheses if it's a function
  function appendToExpression(op) {
    const funcOps = [
      'sqrt', 'sin', 'cos', 'tan',
      'sec', 'csc', 'cot',
      'log', 'ln', 'exp',
      'asin', 'acos', 'atan',
      'asec', 'acsc', 'acot'
    ];

    if (funcOps.includes(op)) {
      const insertText = `${op}()`;
      const cursorPos = exprInput.selectionStart;
      // Insert func() at cursor position
      exprInput.value = exprInput.value.slice(0, cursorPos) + insertText + exprInput.value.slice(cursorPos);
      // Place cursor between parentheses
      exprInput.setSelectionRange(cursorPos + op.length + 1, cursorPos + op.length + 1);
    } else if (op === 'nthRoot') {
      const insertText = 'nthRoot( , )';
      const cursorPos = exprInput.selectionStart;
      exprInput.value = exprInput.value.slice(0, cursorPos) + insertText + exprInput.value.slice(cursorPos);
      exprInput.setSelectionRange(cursorPos + 8, cursorPos + 8); // cursor inside first placeholder
    } else if (op === 'factorial' || op === '!') {
      const cursorPos = exprInput.selectionStart;
      exprInput.value = exprInput.value.slice(0, cursorPos) + '!' + exprInput.value.slice(cursorPos);
      exprInput.setSelectionRange(cursorPos + 1, cursorPos + 1);
    } else {
      // Regular operator, just insert
      const cursorPos = exprInput.selectionStart;
      exprInput.value = exprInput.value.slice(0, cursorPos) + op + exprInput.value.slice(cursorPos);
      exprInput.setSelectionRange(cursorPos + op.length, cursorPos + op.length);
    }

    exprInput.focus();
  }

  // Evaluate expression
  function computeExpression() {
    let expr = exprInput.value;
    if (!expr) return;

    try {
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

