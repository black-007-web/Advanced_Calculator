// Mips.js - converter logic (external file)
(function () {
  // --- Tokenizer ---
  function tokenize(expr) {
    const tokens = [];
    const re = /\s*([A-Za-z_][A-Za-z0-9_]*|\d+|\(|\)|\+|\-|\*|\/|=)\s*/g;
    let m;
    while ((m = re.exec(expr)) !== null) tokens.push(m[1]);
    return tokens;
  }

  // --- Precedence ---
  const prec = { '+': 1, '-': 1, '*': 2, '/': 2 };
  function toRPN(tokens) {
    const out = [];
    const ops = [];
    for (const t of tokens) {
      if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(t) || /^\d+$/.test(t)) out.push(t);
      else if (['+','-','*','/'].includes(t)) {
        while (ops.length && ops[ops.length - 1] !== '(' && prec[ops[ops.length - 1]] >= prec[t]) out.push(ops.pop());
        ops.push(t);
      } else if (t === '(') ops.push(t);
      else if (t === ')') {
        while (ops.length && ops[ops.length - 1] !== '(') out.push(ops.pop());
        ops.pop();
      } else if (t === '=') out.push(t);
    }
    while (ops.length) out.push(ops.pop());
    return out;
  }

  // --- MIPS Register Table ---
  const regNum = {
    $zero:0,$at:1,$v0:2,$v1:3,$a0:4,$a1:5,$a2:6,$a3:7,
    $t0:8,$t1:9,$t2:10,$t3:11,$t4:12,$t5:13,$t6:14,$t7:15,
    $s0:16,$s1:17,$s2:18,$s3:19,$s4:20,$s5:21,$s6:22,$s7:23,
    $t8:24,$t9:25,$k0:26,$k1:27,$gp:28,$sp:29,$fp:30,$ra:31
  };

  // --- Instruction Funct & Opcode Reference (R-Type + I-Type) ---
  const instrMeta = {
    add:  { opcode: '000000', funct: '100000' },
    sub:  { opcode: '000000', funct: '100010' },
    mul:  { opcode: '000000', funct: '011000' },
    div:  { opcode: '000000', funct: '011010' },
    move: { opcode: '000000', funct: '100000' },
    lw:   { opcode: '100011' },
    sw:   { opcode: '101011' }
  };

  // --- Assembly Generation ---
  function genAssembly(rpn, options) {
    const lines = [];
    const tempStack = [];
    const varReg = Object.assign({}, options.manualMap || {});
    const usedRegs = new Set(Object.values(varReg));
    const regPool = ['$t0','$t1','$t2','$t3','$t4','$t5','$t6','$t7','$t8','$t9'];
    let poolIdx = 0;

    function allocTemp() {
      while (poolIdx < regPool.length && usedRegs.has(regPool[poolIdx])) poolIdx++;
      if (poolIdx >= regPool.length) throw new Error('Out of temp registers ($t0-$t9)');
      const r = regPool[poolIdx++]; usedRegs.add(r); return r;
    }

    function ensureLoaded(operand) {
      if (/^\$/.test(operand)) return operand;
      if (/^\d+$/.test(operand)) return operand;
      if (varReg[operand]) return varReg[operand];
      const r = allocTemp();
      lines.push({mn:'lw', a:r, b:operand, comment:`load ${operand}`});
      varReg[operand] = r;
      return r;
    }

    for (let i=0;i<rpn.length;i++){
      const t = rpn[i];
      if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(t) || /^\d+$/.test(t) || /^\$/.test(t)) {
        tempStack.push(t);
      } else if (t === '=') {
        const val = tempStack.pop();
        const dest = tempStack.pop();
        const srcReg = ensureLoaded(val);
        if (/^\$/.test(dest)) lines.push({mn:'move', a:dest, b:srcReg, comment:`move to ${dest}`});
        else lines.push({mn:'sw', a:srcReg, b:dest, comment:`store ${dest}`});
        varReg[dest] = srcReg;
      } else if (['+','-','*','/'].includes(t)) {
        const b = tempStack.pop();
        const a = tempStack.pop();
        const ra = ensureLoaded(a);
        const rb = ensureLoaded(b);
        const outReg = allocTemp();
        const mn = { '+':'add', '-':'sub', '*':'mul', '/':'div' }[t];
        lines.push({mn:mn, a:outReg, b:ra, c:rb, comment:`${a} ${t} ${b}`});
        tempStack.push(outReg);
      }
    }
    return lines.map(l => formatLine(l));
  }

  // --- Machine Code Builder ---
  function makeMachineCode(obj) {
    const meta = instrMeta[obj.mn];
    if (!meta) return 'N/A';

    let opcode = meta.opcode || '000000';
    let funct = meta.funct || '------';
    let rs='00000', rt='00000', rd='00000', shamt='00000';

    if (obj.mn === 'lw' || obj.mn === 'sw') {
      rt = toBin(regNum[obj.a],5);
      rs = toBin(0,5); // base = 0 for demo
      const imm = toBin(0,16);
      return `<br><span class='token-comment'>opcode(${opcode}) rs(${rs}) rt(${rt}) imm(${imm})</span>`;
    }

    if (obj.mn === 'move') {
      rd = toBin(regNum[obj.a],5);
      rs = toBin(regNum[obj.b],5);
      funct = '100000';
    }

    if (['add','sub','mul','div'].includes(obj.mn)) {
      rd = toBin(regNum[obj.a],5);
      rs = toBin(regNum[obj.b],5);
      rt = toBin(regNum[obj.c],5);
    }

    const code = `${opcode}${rs}${rt}${rd}${shamt}${funct}`;
    return `<br><span class='token-comment'>opcode(${opcode}) rs(${rs}) rt(${rt}) rd(${rd}) shamt(${shamt}) funct(${funct})</span>`;
  }

  function toBin(num,len){ return (num >>> 0).toString(2).padStart(len,'0'); }

  // --- Line Formatter ---
  function formatLine(obj) {
    const M = s => `<span class="token-mnemonic">${s}</span>`;
    const R = s => `<span class="token-reg">${s}</span>`;
    const C = s => `<span class="token-comment"> # ${s}</span>`;
    let baseLine = '';

    if (obj.mn === 'move')
      baseLine = `${M('move')} ${R(obj.a)}, ${R(obj.b)}${C(obj.comment)}`;
    else if (obj.mn === 'lw' || obj.mn === 'sw')
      baseLine = `${M(obj.mn)} ${R(obj.a)}, ${obj.b}${C(obj.comment)}`;
    else
      baseLine = `${M(obj.mn)} ${R(obj.a)}, ${R(obj.b)}, ${R(obj.c)}${C(obj.comment)}`;

    return baseLine + makeMachineCode(obj);
  }

  // --- DOM Logic ---
  const exprInput = document.getElementById('expr-input');
  const convertBtn = document.getElementById('convert-btn');
  const outputEl = document.getElementById('output');
  const asmSelect = document.getElementById('asm-select');
  const manualToggle = document.getElementById('manual-toggle');
  const manualArea = document.getElementById('manual-area');
  const mapGrid = document.getElementById('map-grid');
  const exampleBtn = document.getElementById('example-btn');
  const statusEl = document.getElementById('status');
  const copyBtn = document.getElementById('copy-btn');
  const downloadBtn = document.getElementById('download-btn');

  manualToggle.addEventListener('change', () => {
    manualArea.style.display = manualToggle.checked ? 'flex' : 'none';
    rebuildMapInputs();
  });

  exampleBtn.addEventListener('click', () => {
    exprInput.value = 'A = (i + j) - (k + m)';
  });

  exprInput.addEventListener('input', () => { if (manualToggle.checked) rebuildMapInputs(); });

  function rebuildMapInputs() {
    mapGrid.innerHTML = '';
    const vars = [...new Set(detectVariables(exprInput.value))];
    if (vars.length === 0) return mapGrid.innerHTML = '<div class="small">No variables detected yet.</div>';
    vars.forEach(v => {
      const wrap = document.createElement('div');
      wrap.style.display = 'flex';
      wrap.style.gap = '6px';
      const label = document.createElement('div');
      label.className = 'small';
      label.textContent = v;
      label.style.width = '40px';
      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = '$t0 or $s1';
      input.dataset.var = v;
      wrap.append(label, input);
      mapGrid.append(wrap);
    });
  }

  function detectVariables(expr) {
    const tokens = tokenize(expr);
    return tokens.filter(t => /^[A-Za-z_][A-Za-z0-9_]*$/.test(t) && t !== '=');
  }

  convertBtn.addEventListener('click', () => {
    const expr = exprInput.value.trim();
    if (!expr) return showStatus('Empty expression','error');
    try {
      showStatus('Converting...');
      const tokens = tokenize(expr);
      const rpn = toRPN(tokens);
      const manualMap = {};
      if (manualToggle.checked) {
        mapGrid.querySelectorAll('input').forEach(i => { if (i.value.trim()) manualMap[i.dataset.var] = i.value.trim(); });
      }

      const target = asmSelect.value.toLowerCase();

      if(target === 'simple') {
        const mipsLines = genAssembly(rpn, {manualMap});
        const simpleLines = mipsLines.map(line =>
          line.replace(/<[^>]+>/g,'')
              .replace(/\blw\b/i,'MOV')
              .replace(/\bsw\b/i,'MOV')
              .replace(/\badd\b/i,'ADD')
              .replace(/\bsub\b/i,'SUB')
              .replace(/\bmul\b/i,'MUL')
              .replace(/\bdiv\b/i,'DIV')
              .replace(/\bmove\b/i,'MOV')
              .replace(/\s+#.*/,'')
              .trim()
        );
        renderOutput(simpleLines);
        showStatus('Done (Simple Assembly)');
        return;
      }

      const lines = genAssembly(rpn, {manualMap});
      renderOutput(lines);
      showStatus('Done');

    } catch (e) {
      showStatus(e.message || 'Error','error');
    }
  });

  function renderOutput(lines) {
    outputEl.innerHTML = '';
    lines.forEach((l, i) => {
      const d = document.createElement('div');
      d.className = 'line';
      d.innerHTML = l;
      d.style.animationDelay = `${i*0.05}s`;
      outputEl.appendChild(d);
    });
    setTimeout(()=>outputEl.classList.add('show'),50);
  }

  function showStatus(msg, type) {
    statusEl.textContent = msg;
    statusEl.style.color = type === 'error' ? '#ff7b7b' : '#9aa0a6';
  }

  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(outputEl.textContent || '').then(()=>showStatus('Copied')).catch(()=>showStatus('Failed','error'));
  });

  downloadBtn.addEventListener('click', () => {
    const blob = new Blob([outputEl.textContent || ''], {type:'text/plain'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'program.s';
    a.click();
    URL.revokeObjectURL(a.href);
  });

  rebuildMapInputs();
})();
