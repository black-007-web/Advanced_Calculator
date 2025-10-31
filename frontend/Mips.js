// --- Mips.js — Complete Multi-Mode MIPS Converter with Machine Code ---
(function () {
  document.addEventListener('DOMContentLoaded', init);

  function init() {
    const asmSelect = document.getElementById('asm-select');
    const exprInput = document.getElementById('expr-input');
    const convertBtn = document.getElementById('convert-btn');
    const manualToggle = document.getElementById('manual-toggle');
    const mapGrid = document.getElementById('map-grid');
    const outputEl = document.getElementById('output');
    const statusEl = document.getElementById('status');
    const copyBtn = document.getElementById('copy-btn');
    const downloadBtn = document.getElementById('download-btn');

    const regNum = {
      $zero: 0, $at: 1, $v0: 2, $v1: 3,
      $a0: 4, $a1: 5, $a2: 6, $a3: 7,
      $t0: 8, $t1: 9, $t2: 10, $t3: 11, $t4: 12, $t5: 13, $t6: 14, $t7: 15,
      $s0: 16, $s1: 17, $s2: 18, $s3: 19, $s4: 20, $s5: 21, $s6: 22, $s7: 23,
      $t8: 24, $t9: 25, $k0: 26, $k1: 27, $gp: 28, $sp: 29, $fp: 30, $ra: 31
    };

    const instrMeta = {
      add: { opcode: '000000', funct: '100000', type: 'R' },
      sub: { opcode: '000000', funct: '100010', type: 'R' },
      mul: { opcode: '000000', funct: '011000', type: 'R' },
      div: { opcode: '000000', funct: '011010', type: 'R' },
      move: { opcode: '000000', funct: '100000', type: 'R' },
      lw: { opcode: '100011', type: 'I' },
      sw: { opcode: '101011', type: 'I' },
      addi: { opcode: '001000', type: 'I' },
      beq: { opcode: '000100', type: 'I' },
      bne: { opcode: '000101', type: 'I' },
      j: { opcode: '000010', type: 'J' }
    };

    function tokenize(expr) {
      const tokens = [];
      const re = /\s*([A-Za-z_][A-Za-z0-9_]*|\$[A-Za-z0-9]+|\d+|\(|\)|,|\+|\-|\*|\/|=|\[|\])\s*/g;
      let m;
      while ((m = re.exec(expr)) !== null) tokens.push(m[1]);
      return tokens.filter(t => t !== ',');
    }

    const prec = { '+': 1, '-': 1, '*': 2, '/': 2 };
    function toRPN(tokens) {
      const out = [], ops = [];
      for (const t of tokens) {
        if (/^\$[A-Za-z0-9]+$/.test(t) || /^[A-Za-z_][A-Za-z0-9_]*$/.test(t) || /^\d+$/.test(t))
          out.push(t);
        else if (['+', '-', '*', '/'].includes(t)) {
          while (ops.length && ops[ops.length - 1] !== '(' && prec[ops[ops.length - 1]] >= prec[t])
            out.push(ops.pop());
          ops.push(t);
        } else if (t === '(') ops.push(t);
        else if (t === ')') {
          while (ops.length && ops[ops.length - 1] !== '(') out.push(ops.pop());
          ops.pop();
        } else if (t === '=') out.push('=');
      }
      while (ops.length) out.push(ops.pop());
      return out;
    }

    function genAssembly(rpn, options = { manualMap: {} }) {
      const lines = [];
      const tempStack = [];
      const varReg = Object.assign({}, options.manualMap || {});
      const usedRegs = new Set(Object.values(varReg));
      const regPool = ['$t0', '$t1', '$t2', '$t3', '$t4', '$t5', '$t6', '$t7', '$t8', '$t9'];
      let poolIdx = 0;

      function allocTemp() {
        while (poolIdx < regPool.length && usedRegs.has(regPool[poolIdx])) poolIdx++;
        if (poolIdx >= regPool.length) throw new Error('Out of temporary registers ($t0–$t9)');
        const r = regPool[poolIdx++];
        usedRegs.add(r);
        return r;
      }

      function ensureLoaded(operand) {
        // Handle array indexing like A[300]
        if (/^[A-Za-z_][A-Za-z0-9_]*\[\d+\]$/.test(operand)) {
          const m = operand.match(/^([A-Za-z_][A-Za-z0-9_]*)\[(\d+)\]$/);
          const arrName = m[1], offset = parseInt(m[2]) * 4; // word offset
          const baseReg = allocTemp();
          lines.push({ mn: 'lw', a: baseReg, b: `${offset}($t1)`, comment: `load ${operand}` }); // assume $t1 holds base of array
          return baseReg;
        }
        if (/^\$/.test(operand) || /^\d+$/.test(operand)) return operand;
        if (varReg[operand]) return varReg[operand];
        const r = allocTemp();
        lines.push({ mn: 'lw', a: r, b: operand, comment: `load ${operand}` });
        varReg[operand] = r;
        return r;
      }

      for (const t of rpn) {
        if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(t) || /^\d+$/.test(t) || /^\$/.test(t) || /^[A-Za-z_][A-Za-z0-9_]*\[\d+\]$/.test(t)) {
          tempStack.push(t);
        } else if (t === '=') {
          const val = tempStack.pop();
          const dest = tempStack.pop();
          const srcReg = ensureLoaded(val);

          // handle array store
          if (/^[A-Za-z_][A-Za-z0-9_]*\[\d+\]$/.test(dest)) {
            const m = dest.match(/^([A-Za-z_][A-Za-z0-9_]*)\[(\d+)\]$/);
            const arrName = m[1], offset = parseInt(m[2]) * 4;
            lines.push({ mn: 'sw', a: srcReg, b: `${offset}($t1)`, comment: `store ${dest}` });
          } else if (/^\$/.test(dest)) {
            lines.push({ mn: 'move', a: dest, b: srcReg, comment: `move to ${dest}` });
          } else {
            lines.push({ mn: 'sw', a: srcReg, b: dest, comment: `store ${dest}` });
          }
        } else if (['+', '-', '*', '/'].includes(t)) {
          const b = tempStack.pop(), a = tempStack.pop();
          const ra = ensureLoaded(a), rb = ensureLoaded(b);
          const outReg = allocTemp();
          const mn = { '+': 'add', '-': 'sub', '*': 'mul', '/': 'div' }[t];
          lines.push({ mn, a: outReg, b: ra, c: rb, comment: `${a} ${t} ${b}` });
          tempStack.push(outReg);
        }
      }
      return lines;
    }

    // --- rest of the code unchanged ---
    function buildBreakdown(obj) {
      const meta = instrMeta[obj.mn];
      if (!meta) return '';
      const opcode = meta.opcode || '000000';
      let rs = '00000', rt = '00000', rd = '00000', sh = '00000', funct = meta.funct || '000000', imm = '0000000000000000', addr = '000000000000000000000000';
      if (meta.type === 'R') {
        rd = toBin(regNum[obj.a] || 0, 5);
        rs = toBin(regNum[obj.b] || 0, 5);
        rt = toBin(regNum[obj.c] || 0, 5);
      } else if (meta.type === 'I') {
        rt = toBin(regNum[obj.a] || 0, 5);
        if (/^\d+\(\$[a-z0-9]+\)$/i.test(obj.b)) {
          const m = obj.b.match(/^(\d+)\((\$[a-z0-9]+)\)$/i);
          imm = toBin(parseInt(m[1]), 16);
          rs = toBin(regNum[m[2]] || 0, 5);
        } else if (/^\d+$/.test(obj.b)) {
          imm = toBin(parseInt(obj.b), 16);
          rs = '00000';
        } else {
          rs = toBin(regNum[obj.b] || 0, 5);
        }
      } else if (meta.type === 'J') {
        addr = toBin(parseInt(obj.a), 26);
      }
      const full = meta.type === 'R' ? `${opcode}${rs}${rt}${rd}${sh}${funct}`
                  : meta.type === 'I' ? `${opcode}${rs}${rt}${imm}`
                  : `${opcode}${addr}`;
      return `
        <div class="breakdown-container">
          <table class="mips-table">
            <tr><th>Field</th><th>Bits</th><th>Binary</th></tr>
            <tr><td>opcode</td><td>6</td><td>${opcode}</td></tr>
            <tr><td>rs</td><td>5</td><td>${rs}</td></tr>
            <tr><td>rt</td><td>5</td><td>${rt}</td></tr>
            ${meta.type === 'R' ? `<tr><td>rd</td><td>5</td><td>${rd}</td></tr>
            <tr><td>shamt</td><td>5</td><td>${sh}</td></tr>
            <tr><td>funct</td><td>6</td><td>${funct}</td></tr>` 
            : meta.type === 'I' ? `<tr><td>immediate</td><td>16</td><td>${imm}</td></tr>` 
            : `<tr><td>address</td><td>26</td><td>${addr}</td></tr>`}
            <tr><td colspan="3" class="fullcode">Full Machine Code → ${full}</td></tr>
          </table>
        </div>
      `;
    }

    function formatOutputLines(lines, mode) {
      return lines.map(obj => {
        const textLine = `${obj.mn.toUpperCase()} ${obj.a || ''}${obj.b ? ', ' + obj.b : ''}${obj.c ? ', ' + obj.c : ''}${obj.comment ? ' # ' + obj.comment : ''}`;
        if (mode === 'mips') return `<div class="line">${escapeHtml(textLine)}</div>` + buildBreakdown(obj);
        return `<div class="line">${escapeHtml(textLine)}</div>`;
      }).join('\n');
    }

    function escapeHtml(str) { return String(str).replace(/[&<>"']/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"}[m])); }

    function renderOutputFromText(text) {
      const mode = asmSelect ? asmSelect.value : 'mips';
      const manualMap = {};
      if (manualToggle && manualToggle.checked && mapGrid) {
        mapGrid.querySelectorAll('input').forEach(inp => {
          const v = inp.dataset.var, val = inp.value && inp.value.trim();
          if (v && val) manualMap[v] = val;
        });
      }
      let assemblyObjs = [];
      const firstWord = text.trim().split(/\s+/)[0].toLowerCase();
      if (Object.keys(instrMeta).includes(firstWord)) {
        const lines = text.split('\n').map(s => s.trim()).filter(Boolean);
        assemblyObjs = lines.map(l => {
          const [mn, ...args] = l.replace(/#.*$/,'').split(/[\s,]+/);
          return { mn, a: args[0] || '', b: args[1] || '', c: args[2] || '', comment: l.match(/#.*$/)?.[0] || '' };
        });
      } else {
        const tokens = tokenize(text);
        const rpn = toRPN(tokens);
        assemblyObjs = genAssembly(rpn, { manualMap });
      }
      outputEl.classList.remove('show');
      outputEl.innerHTML = formatOutputLines(assemblyObjs, mode) || '<div class="line small">No output generated.</div>';
      void outputEl.offsetWidth;
      outputEl.classList.add('show');
    }

    convertBtn.addEventListener('click', () => {
      try {
        const text = exprInput.value || '';
        if (!text.trim()) return setStatus('Please enter an equation or instruction.', 'error');
        setStatus('Converting...');
        renderOutputFromText(text);
        setStatus('Done', 'ok');
      } catch (e) {
        console.error(e);
        setStatus('Error: ' + e.message, 'error');
      }
    });

    if (copyBtn)
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(outputEl.textContent || '').then(() => setStatus('Copied', 'ok')).catch(() => setStatus('Copy failed', 'error'));
      });

    if (downloadBtn)
      downloadBtn.addEventListener('click', () => {
        const blob = new Blob([outputEl.textContent || ''], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'program.asm';
        a.click();
        URL.revokeObjectURL(a.href);
      });

    setStatus('Ready', 'ok');
  }

  function toBin(num, len) { return (Number(num) >>> 0).toString(2).padStart(len, '0'); }
  function setStatus(msg, type) { const s = document.getElementById('status'); if(!s) return; s.textContent=msg; s.style.color=type==='error'?'#ff7b7b':'#9aa0a6'; }

})();
