(() => {
  const cgpaGpa = document.getElementById('cgpaGpa');
  const cgpaCredit = document.getElementById('cgpaCredit');
  const addCgpaBtn = document.getElementById('addCgpaBtn');
  const cgpaExprBox = document.getElementById('cgpaExprBox');
  const cgpaResult = document.getElementById('cgpaResult');

  const gradeInput = document.getElementById('gradeInput');
  const gradeResult = document.getElementById('gradeResult');

  const computeBtn = document.getElementById('computeBtn');
  const clearBtn = document.getElementById('gradeClear');

  let cgpaData = []; // store { gpa, credit }

  // Add GPA + Credit entry
  addCgpaBtn.addEventListener('click', () => {
    const gpa = parseFloat(cgpaGpa.value);
    const credit = parseFloat(cgpaCredit.value);

    if (isNaN(gpa) || gpa < 0 || gpa > 4.0) {
      alert("Enter a valid GPA between 0.0 and 4.0");
      cgpaGpa.focus();
      return;
    }

    cgpaData.push({ gpa, credit });
    updateCgpaExpr();
    cgpaGpa.value = '';
    cgpaGpa.focus(); // auto-redirect keyboard to GPA input
  });

  function updateCgpaExpr() {
    if (cgpaData.length === 0) {
      cgpaExprBox.value = '';
      return;
    }
    const parts = cgpaData.map(d => `${d.gpa}×${d.credit}`);
    cgpaExprBox.value = parts.join(" + ");
  }

  // Grade system
  const gradeScale = [
    { min: 93, max: 100, grade: "A", gpa: 4.0 },
    { min: 89, max: 92, grade: "A-", gpa: 3.7 },
    { min: 86, max: 88, grade: "B+", gpa: 3.3 },
    { min: 82, max: 85, grade: "B", gpa: 3.0 },
    { min: 79, max: 81, grade: "B-", gpa: 2.7 },
    { min: 75, max: 78, grade: "C+", gpa: 2.3 },
    { min: 72, max: 74, grade: "C", gpa: 2.0 },
    { min: 69, max: 71, grade: "C-", gpa: 1.7 },
    { min: 65, max: 68, grade: "D+", gpa: 1.3 },
    { min: 60, max: 64, grade: "D", gpa: 1.0 },
    { min: 0,  max: 59, grade: "F", gpa: 0.0 },
  ];

  function gradeFromMarks(marks) {
    for (const row of gradeScale) {
      if (marks >= row.min && marks <= row.max) return row;
    }
    return null;
  }

  function gradeFromGpa(gpa) {
    return gradeScale.find(r => r.gpa === gpa) || null;
  }

  // Compute results
  computeBtn.addEventListener('click', () => {
    // --- CGPA calculation ---
    if (cgpaData.length > 0) {
      const total = cgpaData.reduce((acc, d) => acc + d.gpa * d.credit, 0);
      const totalCredits = cgpaData.reduce((acc, d) => acc + d.credit, 0);
      const cgpa = (total / totalCredits).toFixed(2);
      cgpaResult.textContent = `CGPA Result: ${cgpa}`;
    }

    // --- Grade calculation ---
    const val = parseFloat(gradeInput.value);
    if (!isNaN(val)) {
      if (val > 4.0) {
        // Marks mode
        const res = gradeFromMarks(val);
        if (res) {
          gradeResult.textContent = `Grade Result: GPA ${res.gpa} — ${res.grade}`;
        } else {
          gradeResult.textContent = "Grade Result: Invalid marks";
        }
      } else {
        // GPA mode
        const res = gradeFromGpa(val);
        if (res) {
          gradeResult.textContent = `Grade Result: ${res.grade}`;
        } else {
          gradeResult.textContent = "Grade Result: Invalid GPA";
        }
      }
    }
  });

  // Clear everything
  clearBtn.addEventListener('click', () => {
    cgpaData = [];
    cgpaGpa.value = '';
    gradeInput.value = '';
    cgpaExprBox.value = '';
    cgpaResult.textContent = "CGPA Result: —";
    gradeResult.textContent = "Grade Result: —";
    cgpaGpa.focus();
  });

  // Press Enter = compute
  [cgpaGpa, gradeInput].forEach(inp => {
    inp.addEventListener('keypress', e => {
      if (e.key === 'Enter') computeBtn.click();
    });
  });
})();
