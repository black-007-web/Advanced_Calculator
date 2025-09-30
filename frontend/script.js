// ================= Customer Functions =================
function addCustomer() {
  const name = document.getElementById("custName").value.trim();
  const id = document.getElementById("custId").value.trim();
  const product = document.getElementById("custProduct").value.trim();
  const quantity = parseFloat(document.getElementById("custQuantity").value);
  const value = parseFloat(document.getElementById("custValue").value);
  const date = document.getElementById("custDate").value;

  if (!name || !id || !product || isNaN(value) || isNaN(quantity) || !date) {
    alert("Please fill all fields correctly");
    return;
  }

  const customer = { name, id, products: [{ product, quantity, value }], date };
  let customers = JSON.parse(localStorage.getItem("customers") || "[]");
  customers.push(customer);
  localStorage.setItem("customers", JSON.stringify(customers));

  clearCustomerInputs();
  renderCustomerReceipts();
}

function clearCustomerInputs() {
  document
    .querySelectorAll("#custName,#custId,#custProduct,#custQuantity,#custValue,#custDate")
    .forEach((i) => (i.value = ""));
}

// Render Customer Table
function renderCustomerReceipts(mode = "normal") {
  const wrap = document.getElementById("customerReceipts");
  const totalBox = document.getElementById("salesTotal");
  if (!wrap) return;

  let customers = JSON.parse(localStorage.getItem("customers") || "[]");

  if (customers.length === 0) {
    wrap.innerHTML = "<p class='tiny'>No customer records.</p>";
    if (totalBox) totalBox.innerHTML = "";
    return;
  }

  wrap.innerHTML = "";
  let grandTotal = 0;

  customers.forEach((c, idx) => {
    // Calculate total only for numeric products
    let customerTotal = 0;
    c.products.forEach((p) => {
      const qty = parseFloat(p.quantity);
      const val = parseFloat(p.value);
      if (!isNaN(qty) && !isNaN(val)) customerTotal += qty * val;
    });
    grandTotal += customerTotal;

    let table = `<table class="data-table">
      <thead>
        <tr>
          <th>#</th><th>Product</th><th>Qty</th><th>Unit $</th><th>Total $</th><th>Action</th>
        </tr>
      </thead><tbody>`;

    c.products.forEach((p, pi) => {
      const qty = parseFloat(p.quantity);
      const val = parseFloat(p.value);
      const total = (!isNaN(qty) && !isNaN(val)) ? (qty * val).toFixed(2) : "";
      table += `<tr>
        <td>${pi + 1}.</td>
        <td contenteditable="true">${p.product}</td>
        <td contenteditable="true">${p.quantity}</td>
        <td contenteditable="true">${!isNaN(val) ? val.toFixed(2) : p.value}</td>
        <td>${total}</td>
        <td><button onclick="deleteCustomerProduct(${idx},${pi})">❌</button></td>
      </tr>`;
    });

    // --- Profit calculation dynamically (numeric only) ---
    const incomeRow = c.products.find((p) => p.product.toLowerCase() === "income");
    const expensesRow = c.products.find((p) => p.product.toLowerCase() === "expenses");
    if (incomeRow && expensesRow) {
      const incomeQty = parseFloat(incomeRow.quantity);
      const incomeVal = parseFloat(incomeRow.value);
      const expensesQty = parseFloat(expensesRow.quantity);
      const expensesVal = parseFloat(expensesRow.value);
      if (!isNaN(incomeQty) && !isNaN(incomeVal) && !isNaN(expensesQty) && !isNaN(expensesVal)) {
        const profit = incomeQty * incomeVal - expensesQty * expensesVal;
        table += `<tr class="highlight-row">
          <td>*</td>
          <td>Profit</td>
          <td colspan="3">${profit.toFixed(2)}</td>
          <td></td>
        </tr>`;
      }
    }

    table += `</tbody></table>`;

    // --- Totals for numeric columns only ---
    const totalQty = c.products.reduce((sum, p) => {
      const n = parseFloat(p.quantity);
      return sum + (!isNaN(n) ? n : 0);
    }, 0);

    const totalExpenses = c.products.reduce((sum, p) => {
      if (p.product.toLowerCase() === "expenses") {
        const nQty = parseFloat(p.quantity);
        const nVal = parseFloat(p.value);
        if (!isNaN(nQty) && !isNaN(nVal)) return sum + nQty * nVal;
      }
      return sum;
    }, 0);

    let totalsHtml = `<div class="totals">`;
    if (totalQty > 0) totalsHtml += `<p><strong>Total Quantity:</strong> ${totalQty}</p>`;
    if (totalExpenses > 0) totalsHtml += `<p><strong>Total Expenses:</strong> $${totalExpenses.toFixed(2)}</p>`;
    totalsHtml += `</div>`;

    const div = document.createElement("div");
    div.className = "receipt";
    div.innerHTML = `<h3>Customer #${idx + 1}: ${c.name} (${c.id})</h3>
                     <p>Date: ${c.date}</p>${table}${totalsHtml}
                     <strong>Total: $${customerTotal.toFixed(2)}</strong>`;
    wrap.appendChild(div);
  });

  if (totalBox)
    totalBox.innerHTML = `<strong>📊 Total Sales: $${grandTotal.toFixed(2)}</strong>`;

  if (mode === "normal") localStorage.setItem("customers", JSON.stringify(customers));
}

function deleteCustomerProduct(custIdx, prodIdx) {
  let customers = JSON.parse(localStorage.getItem("customers") || "[]");
  customers[custIdx].products.splice(prodIdx, 1);
  if (customers[custIdx].products.length === 0) customers.splice(custIdx, 1);
  localStorage.setItem("customers", JSON.stringify(customers));
  renderCustomerReceipts();
}

function clearCustomers() {
  localStorage.removeItem("customers");
  renderCustomerReceipts();
}

function updateCustomerTable() {
  let customers = JSON.parse(localStorage.getItem("customers") || "[]");
  const receipts = document.querySelectorAll("#customerReceipts .receipt");
  receipts.forEach((receipt, idx) => {
    const rows = receipt.querySelectorAll("tbody tr");
    let newProducts = [];
    rows.forEach((row) => {
      const cols = row.querySelectorAll("td");
      if (cols.length >= 4 && cols[1].isContentEditable) {
        const product = cols[1].innerText.trim();
        const quantity = parseFloat(cols[2].innerText.trim());
        const value = parseFloat(cols[3].innerText.trim());
        if (product && !isNaN(quantity) && !isNaN(value)) {
          newProducts.push({ product, quantity, value });
        } else if (product) {
          // Keep text-type entries without numeric totals
          newProducts.push({ product, quantity: cols[2].innerText.trim(), value: cols[3].innerText.trim() });
        }
      }
    });
    customers[idx].products = newProducts;
  });
  localStorage.setItem("customers", JSON.stringify(customers));
  renderCustomerReceipts();
}

// ================= Employee Functions =================
function addEmployee() {
  const emp = {
    name: document.getElementById("empName").value.trim(),
    id: document.getElementById("empId").value.trim(),
    post: document.getElementById("empPost").value.trim(),
    dept: document.getElementById("empDept").value.trim(),
    phone: document.getElementById("empPhone").value.trim(),
    salary: parseFloat(document.getElementById("empSalary").value),
  };

  if (!emp.name || !emp.id || !emp.post || !emp.dept || !emp.phone || isNaN(emp.salary)) {
    alert("Please fill all fields correctly");
    return;
  }

  let employees = JSON.parse(localStorage.getItem("employees") || "[]");
  employees.push(emp);
  localStorage.setItem("employees", JSON.stringify(employees));

  clearEmployeeInputs();
  renderEmployeeTable();
}

function clearEmployeeInputs() {
  document
    .querySelectorAll("#empName,#empId,#empPost,#empDept,#empPhone,#empSalary")
    .forEach((i) => (i.value = ""));
}

function renderEmployeeTable(mode = "normal") {
  const wrap = document.getElementById("employeeTable");
  if (!wrap) return;

  let employees = JSON.parse(localStorage.getItem("employees") || "[]");

  if (employees.length === 0) {
    wrap.innerHTML = "<p class='tiny'>No employee records.</p>";
    return;
  }

  let table = `<table class="data-table">
    <thead>
      <tr>
        <th>Name</th><th>ID</th><th>Post</th><th>Dept</th><th>Phone</th><th>Salary</th><th>Action</th>
      </tr>
    </thead><tbody>`;

  employees.forEach((e, idx) => {
    table += `<tr>
      <td contenteditable="true">${e.name}</td>
      <td contenteditable="true">${e.id}</td>
      <td contenteditable="true">${e.post}</td>
      <td contenteditable="true">${e.dept}</td>
      <td contenteditable="true">${e.phone}</td>
      <td contenteditable="true">${e.salary}</td>
      <td><button onclick="deleteEmployee(${idx})">❌</button></td>
    </tr>`;
  });

  table += "</tbody></table>";
  wrap.innerHTML = table;

  if (mode === "normal") localStorage.setItem("employees", JSON.stringify(employees));
}

function deleteEmployee(idx) {
  let employees = JSON.parse(localStorage.getItem("employees") || "[]");
  employees.splice(idx, 1);
  localStorage.setItem("employees", JSON.stringify(employees));
  renderEmployeeTable();
}

function clearEmployees() {
  localStorage.removeItem("employees");
  renderEmployeeTable();
}

function updateEmployeeTable() {
  let employees = JSON.parse(localStorage.getItem("employees") || "[]");
  const rows = document.querySelectorAll("#employeeTable tbody tr");
  employees = [];
  rows.forEach((row) => {
    const cols = row.querySelectorAll("td");
    if (cols.length >= 6) {
      const name = cols[0].innerText.trim();
      const id = cols[1].innerText.trim();
      const post = cols[2].innerText.trim();
      const dept = cols[3].innerText.trim();
      const phone = cols[4].innerText.trim();
      const salary = parseFloat(cols[5].innerText.trim());
      if (name && id && post && dept && phone && !isNaN(salary)) {
        employees.push({ name, id, post, dept, phone, salary });
      }
    }
  });
  localStorage.setItem("employees", JSON.stringify(employees));
  renderEmployeeTable();
}

function exportEmployeeCSV() {
  let employees = JSON.parse(localStorage.getItem("employees") || "[]");
  if (employees.length === 0) return;
  let csv = "Name,ID,Post,Dept,Phone,Salary\n";
  employees.forEach((e) => {
    csv += `${e.name},${e.id},${e.post},${e.dept},${e.phone},${e.salary}\n`;
  });
  downloadCSV(csv, "employees.csv");
}

function filterEmployees() {
  const term = document.getElementById("empSearch").value.toLowerCase();
  document.querySelectorAll("#employeeTable tbody tr").forEach((tr) => {
    const rowText = Array.from(tr.children)
      .map((td) => td.innerText.toLowerCase())
      .join(" ");
    tr.style.display = rowText.includes(term) ? "" : "none";
  });
}

// ================= Auto-enter-next =================
document.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    const inputs = Array.from(document.querySelectorAll("input"));
    const idx = inputs.indexOf(e.target);
    if (idx >= 0 && idx < inputs.length - 1) {
      inputs[idx + 1].focus();
      e.preventDefault();
    }
  }
});
// ======================
// Shared Logic Functions
// ======================
const DATA_KEY = "customerRecords";

function loadRecords(){
  try { return JSON.parse(localStorage.getItem(DATA_KEY)) || []; }
  catch(e){ return []; }
}

function formatCompact(num){
  return new Intl.NumberFormat("en", { notation:"compact", maximumFractionDigits:1 }).format(num);
}

function calcEquity(records){
  let totalExpenses=0, totalProfit=0, totalIncome=0;
  records.forEach(r=>{
    const inc = ("Rate" in r && "Amount" in r) ? (parseFloat(r["Rate"])||0)*(parseFloat(r["Amount"])||0) : (parseFloat(r["Income"])||0);
    if(!isNaN(inc)) totalIncome+=inc;

    const exp = parseFloat(r["Expenses"])||0;
    if(!isNaN(exp)) totalExpenses+=exp;

    const prof = (inc||0) - exp;
    if(!isNaN(prof)) totalProfit+=prof;
  });

  return { equity: totalExpenses+totalProfit, totalIncome, totalExpenses, totalProfit };
}

function groupByPeriod(records, period){
  const groups={};

  records.forEach(r=>{
    const d = r._recordDate ? new Date(r._recordDate) : null;
    if(!d || isNaN(d)) return;

    let key="";
    if(period==="weekly"){
      const year=d.getFullYear();
      const firstDay=new Date(d.getFullYear(),0,1);
      const days=Math.floor((d-firstDay)/(24*60*60*1000));
      const week=Math.ceil((days+firstDay.getDay()+1)/7);
      key=`${year}-W${week}`;
    }
    else if(period==="monthly"){
      key=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
    }
    else key="Unknown";

    if(!groups[key]) groups[key]=[];
    groups[key].push(r);
  });

  return groups;
}

// ======================
// Equity Page Renderer
// ======================
function renderEquityPage() {
  const records = loadRecords();
  const { totalIncome, totalExpenses, totalProfit, equity } = calcEquity(records);

  const header = document.getElementById("equityHeader");
  header.textContent = `Equity: ${formatCompact(equity)}`;
  header.style.textAlign = "center";

  const datasets = document.getElementById("datasets");
  datasets.innerHTML = "";

  const today = new Date();
  const todayDate = today.toISOString().split("T")[0];

  function getCurrentWeekKey(d) {
    const year=d.getFullYear();
    const firstDay=new Date(d.getFullYear(),0,1);
    const days=Math.floor((d-firstDay)/(24*60*60*1000));
    const week=Math.ceil((days+firstDay.getDay()+1)/7);
    return `${year}-W${week}`;
  }
  function getCurrentMonthKey(d) {
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
  }

  const currentWeekKey = getCurrentWeekKey(today);
  const currentMonthKey = getCurrentMonthKey(today);

  // ======================
  // Flex container for side-by-side tables
  // ======================
  const containerDiv = document.createElement("div");
  containerDiv.style.display = "flex";
  containerDiv.style.flexWrap = "wrap";
  containerDiv.style.gap = "20px";

  // Main totals table
  const mainDiv = document.createElement("div");
  mainDiv.style.flex = "1 1 400px";
  mainDiv.innerHTML = `
    <h3>${todayDate}</h3>
    <table class="summary-table">
      <thead>
        <tr><th>Income (Assets)</th><th>Expenses (Liabilities)</th><th>Profit</th></tr>
      </thead>
      <tbody>
        <tr>
          <td>${totalIncome.toFixed(2)}</td>
          <td>${totalExpenses.toFixed(2)}</td>
          <td>${totalProfit.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>
  `;

  // Current period table
  const currentDiv = document.createElement("div");
  currentDiv.style.flex = "1 1 300px";

  const weeklyGroups = groupByPeriod(records, "weekly");
  const monthlyGroups = groupByPeriod(records, "monthly");

  const currentWeekProfit = weeklyGroups[currentWeekKey] ? weeklyGroups[currentWeekKey].reduce((acc,r)=>{
    const inc = ("Rate" in r && "Amount" in r) ? (parseFloat(r["Rate"])||0)*(parseFloat(r["Amount"])||0) : (parseFloat(r["Income"])||0);
    const exp = parseFloat(r["Expenses"])||0;
    return acc + ((inc||0) - exp);
  },0) : 0;

  const currentMonthProfit = monthlyGroups[currentMonthKey] ? monthlyGroups[currentMonthKey].reduce((acc,r)=>{
    const inc = ("Rate" in r && "Amount" in r) ? (parseFloat(r["Rate"])||0)*(parseFloat(r["Amount"])||0) : (parseFloat(r["Income"])||0);
    const exp = parseFloat(r["Expenses"])||0;
    return acc + ((inc||0) - exp);
  },0) : 0;

  currentDiv.innerHTML = `
    <h3>Current Period Summary</h3>
    <table class="summary-table">
      <thead>
        <tr><th>Period</th><th>Profit</th></tr>
      </thead>
      <tbody>
        <tr title="This is the current week" style="background:rgba(255,107,107,0.2); font-weight:700;">
          <td>Week ${currentWeekKey}</td>
          <td>${currentWeekProfit.toFixed(2)}</td>
        </tr>
        <tr title="This is the current month" style="background:rgba(124,77,255,0.2); font-weight:700;">
          <td>Month ${currentMonthKey}</td>
          <td>${currentMonthProfit.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>
  `;

  containerDiv.appendChild(mainDiv);
  containerDiv.appendChild(currentDiv);
  datasets.appendChild(containerDiv);

  // ======================
  // Full Weekly/Monthly tables below
  // ======================
  const fullDiv = document.createElement("div");
  fullDiv.style.marginTop = "20px";

  // Weekly table
  let weeklyHtml = `
    <h4>Weekly Profits</h4>
    <table class="summary-table">
      <thead><tr><th>Week</th><th>Profit</th></tr></thead>
      <tbody>
        ${Object.keys(weeklyGroups).map(week=>{
          const sum = weeklyGroups[week].reduce((acc,r)=>{
            const inc = ("Rate" in r && "Amount" in r) ? (parseFloat(r["Rate"])||0)*(parseFloat(r["Amount"])||0) : (parseFloat(r["Income"])||0);
            const exp = parseFloat(r["Expenses"])||0;
            return acc + ((inc||0)-exp);
          },0);
          const highlight = week===currentWeekKey ? "style='background:rgba(255,107,107,0.2); font-weight:700;'" : "";
          return `<tr ${highlight}><td>${week}</td><td>${sum.toFixed(2)}</td></tr>`;
        }).join("")}
      </tbody>
    </table>
  `;
  fullDiv.innerHTML += weeklyHtml;

  // Monthly table
  let monthlyHtml = `
    <h4>Monthly Profits</h4>
    <table class="summary-table">
      <thead><tr><th>Month</th><th>Profit</th></tr></thead>
      <tbody>
        ${Object.keys(monthlyGroups).map(month=>{
          const sum = monthlyGroups[month].reduce((acc,r)=>{
            const inc = ("Rate" in r && "Amount" in r) ? (parseFloat(r["Rate"])||0)*(parseFloat(r["Amount"])||0) : (parseFloat(r["Income"])||0);
            const exp = parseFloat(r["Expenses"])||0;
            return acc + ((inc||0)-exp);
          },0);
          const highlight = month===currentMonthKey ? "style='background:rgba(124,77,255,0.2); font-weight:700;'" : "";
          return `<tr ${highlight}><td>${month}</td><td>${sum.toFixed(2)}</td></tr>`;
        }).join("")}
      </tbody>
    </table>
  `;
  fullDiv.innerHTML += monthlyHtml;

  datasets.appendChild(fullDiv);
}

// Call renderer
renderEquityPage();


// Initial Render
renderCustomerReceipts();
renderEmployeeTable();
