(() => {
  const exprInput = document.getElementById('exprInput');
  const arithResult = document.getElementById('arithResult');
  const computeBtn = document.getElementById('computeBtn');
  const undoBtn = document.getElementById('undoBtn');
  const clearBtn = document.getElementById('clearBtn');
  const opButtons = document.querySelectorAll('.op-btn');

  let history = [];

  // Append operator/function to input and auto-focus
  function appendToExpression(op) {
    if (['sqrt', 'sin', 'cos', 'tan', 'log', 'ln', 'exp'].includes(op)) {
      exprInput.value += `${op}(`;
    } else {
      exprInput.value += op;
    }
    exprInput.focus();
  }

  // Evaluate expression
  function computeExpression() {
    const expr = exprInput.value;
    if (!expr) return;

    try {
      // Convert ln to mathjs log
      let cleanExpr = expr.replace(/ln\(/g, 'log(');
      // Replace √ symbol with sqrt
      cleanExpr = cleanExpr.replace(/√/g, 'sqrt');
      const result = math.evaluate(cleanExpr);
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
