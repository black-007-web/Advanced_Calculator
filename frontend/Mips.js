// --- Mips.js — Final Full Multi-Mode Converter ---
(function () {

  // --- Tokenizer ---
  function tokenize(expr) {
    const tokens = [];
    const re = /\s*([A-Za-z_][A-Za-z0-9_]*|\d+|\(|\)|\+|\-|\*|\/|=)\s*/g;
    let m;
    while ((m = re.exec(expr)) !== null) tokens.push(m[1]);
    return tokens;
  }

  // --- Operator Precedence ---
  const prec = { '+': 1, '-': 1, '*': 2, '/': 2 };

  function toRPN(tokens) {
    const out = [], ops = [];
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

  // --- MIPS Register Numbers ---
  const regNum = {
    $zero:0,$at:1,$v0:2,$v1:3,$a0:4,$a1:5,$a2:6,$a3:7,
    $t0:8,$t1:9,$t2:10,$t3:11,$t4:12,$t5:13,$t6:14,$t7:15,
    $s0:16,$s1:17,$s2:18,$s3:19,$s4:20,$s5:21,$s6:22,$s7:23,
    $t8:24,$t9:25,$k0:26,$k1:27,$gp:28,$sp:29,$fp:30,$ra:31
  };

  // --- Instruction Metadata (Opcode/Funct) ---
  const instrMeta = {
    add:{opcode:'000000',funct:'100000'},
    sub:{opcode:'000000',funct:'100010'},
    mul:{opcode:'000000',funct:'011000'},
    div:{opcode:'000000',funct:'011010'},
    move:{opcode:'000000',funct:'100000'},
    lw:{opcode:'100011'},
    sw:{opcode:'101011'}
  };

  function toBin(num,len){ return (num >>> 0).toString(2).padStart(len,'0'); }

  // --- Assembly Generation ---
  function genAssembly(rpn, options) {
    const lines = [], stack = [];
    const varReg = Object.assign({}, options.manualMap || {});
    const used = new Set(Object.values(varReg));
    const pool = ['$t0','$t1','$t2','$t3','$t4','$t5','$t6','$t7','$t8','$t9'];
    let idx = 0;

    function alloc() {
      while (idx < pool.length && used.has(pool[idx])) idx++;
      if (idx >= pool.length) throw new Error('Out of temp registers ($t0–$t9)');
      const r = pool[idx++]; used.add(r); return r;
    }

    function ensure(op) {
      if (/^\$/.test(op)) return op;
      if (/^\d+$/.test(op)) return op;
      if (varReg[op]) return varReg[op];
      const r = alloc();
      lines.push({mn:'lw', a:r, b:op, comment:`load ${op}`});
      varReg[op] = r;
      return r;
    }

    for (const t of rpn) {
      if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(t) || /^\d+$/.test(t) || /^\$/.test(t)) stack.push(t);
      else if (t === '=') {
        const val = stack.pop(), dest = stack.pop(), src = ensure(val);
        if (/^\$/.test(dest)) lines.push({mn:'move', a:dest, b:src, comment:`move to ${dest}`});
        else lines.push({mn:'sw', a:src, b:dest, comment:`store ${dest}`});
        varReg[dest] = src;
      } else if (['+','-','*','/'].includes(t)) {
        const b = stack.pop(), a = stack.pop(), ra = ensure(a), rb = ensure(b), r = alloc();
        const mn = { '+':'add','-':'sub','*':'mul','/':'div' }[t];
        lines.push({mn,a:r,b:ra,c:rb,comment:`${a} ${t} ${b}`});
        stack.push(r);
      }
    }
    return lines;
  }

  // --- Machine Code Breakdown ---
  function buildBreakdown(obj){
    const meta = instrMeta[obj.mn];
    if(!meta) return '';
    const opcode = meta.opcode || '000000';
    const funct = meta.funct || '------';
    let rs='00000', rt='00000', rd='00000', sh='00000';

    if(['add','sub','mul','div'].includes(obj.mn)){
      rd=toBin(regNum[obj.a],5);
      rs=toBin(regNum[obj.b],5);
      rt=toBin(regNum[obj.c],5);
    } else if(obj.mn==='move'){
      rd=toBin(regNum[obj.a],5);
      rs=toBin(regNum[obj.b],5);
    }

    const full = `${opcode}${rs}${rt}${rd}${sh}${funct}`;
    return `
      <table class="mips-table">
        <tr><th>Field</th><th>Bits</th><th>Binary</th><th>Meaning</th></tr>
        <tr><td>opcode</td><td>6</td><td>${opcode}</td><td>Operation code</td></tr>
        <tr><td>rs</td><td>5</td><td>${rs}</td><td>Source register</td></tr>
        <tr><td>rt</td><td>5</td><td>${rt}</td><td>Target register</td></tr>
        <tr><td>rd</td><td>5</td><td>${rd}</td><td>Destination register</td></tr>
        <tr><td>shamt</td><td>5</td><td>${sh}</td><td>Shift amount</td></tr>
        <tr><td>funct</td><td>6</td><td>${funct}</td><td>Function code</td></tr>
      </table>
      <div class="fullcode">Full Machine Code → ${full}</div>
    `;
  }

  // --- Output Formatter ---
  function formatLine(obj, mode) {
    const M = s => `<span class="token-mn">${s}</span>`;
    const R = s => `<span class="token-reg">${s}</span>`;
    const C = s => `<span class="token-comment"> # ${s}</span>`;
    let base = '';

    if(obj.mn==='move') base=`${M('MOVE')} ${R(obj.a)}, ${R(obj.b)}${C(obj.comment)}`;
    else if(obj.mn==='lw'||obj.mn==='sw') base=`${M(obj.mn.toUpperCase())} ${R(obj.a)}, ${obj.b}${C(obj.comment)}`;
    else base=`${M(obj.mn.toUpperCase())} ${R(obj.a)}, ${R(obj.b)}, ${R(obj.c)}${C(obj.comment)}`;

    if(mode==='mips') return base + buildBreakdown(obj);
    if(mode==='mipsFormat') return `MOV ${obj.a}, ${obj.b||''}, ${obj.c||''}`.replace(/,\s*$/,'')+';';
    return base;
  }

  // --- DOM Elements ---
  const exprInput=document.getElementById('expr-input');
  const convertBtn=document.getElementById('convert-btn');
  const outputEl=document.getElementById('output');
  const statusEl=document.getElementById('status');
  const copyBtn=document.getElementById('copy-btn');
  const downloadBtn=document.getElementById('download-btn');
  const modeSelect=document.getElementById('modeSelect');

  // --- Conversion Trigger ---
  convertBtn.addEventListener('click',()=>{
    const expr=exprInput.value.trim();
    if(!expr) return setStatus('Empty expression','error');
    try{
      setStatus('Converting...');
      const tokens=tokenize(expr), rpn=toRPN(tokens);
      const lines=genAssembly(rpn,{});
      const mode=modeSelect.value;
      const formatted=lines.map(l=>formatLine(l,mode));
      render(formatted);
      setStatus(`Done (${mode.toUpperCase()})`);
    }catch(e){setStatus(e.message||'Error','error');}
  });

  // --- Render Lines ---
  function render(lines){
    outputEl.innerHTML='';
    lines.forEach((l,i)=>{
      const div=document.createElement('div');
      div.className='line';
      div.innerHTML=l;
      div.style.animationDelay=`${i*0.05}s`;
      outputEl.appendChild(div);
    });
  }

  // --- Status Display ---
  function setStatus(msg,type){
    statusEl.textContent=msg;
    statusEl.style.color=type==='error'?'#ff7b7b':'#a0ffa0';
  }

  // --- Copy & Download ---
  copyBtn.addEventListener('click',()=>{
    navigator.clipboard.writeText(outputEl.textContent||'')
      .then(()=>setStatus('Copied!'))
      .catch(()=>setStatus('Copy failed','error'));
  });

  downloadBtn.addEventListener('click',()=>{
    const blob=new Blob([outputEl.textContent||''],{type:'text/plain'});
    const a=document.createElement('a');
    a.href=URL.createObjectURL(blob);
    a.download='output.txt';
    a.click();
    URL.revokeObjectURL(a.href);
  });

})();
