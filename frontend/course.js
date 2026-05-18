
const courses = [
  { code: "AA099", title: "Academic Reading & Writing", credit: "3", prerequisite: "None" },
  { code: "AA150", title: "Fundamentals of Quantitative Reasoning", credit: "3", prerequisite: "None" },
  { code: "AA200", title: "Student Development Seminar", credit: "3", prerequisite: "None" },
  { code: "ENG111", title: "Advanced Academic Reading & Writing", credit: "3", prerequisite: "AA099" },
  { code: "ENG112", title: "Advanced Academic Listening & Speaking", credit: "1.5", prerequisite: "None" },
  { code: "BNG101", title: "Bangla Language and Literature", credit: "3", prerequisite: "None" },
  { code: "HIS101", title: "History of the Emergence of Bangladesh", credit: "3", prerequisite: "None" },
  { code: "PSC100", title: "Introduction to Political Science", credit: "3", prerequisite: "None" },
  { code: "IGLE300", title: "International Graduate Leadership Experience", credit: "3", prerequisite: "None" },
  { code: "SOC101", title: "Introduction to Sociology", credit: "3", prerequisite: "None" },
  { code: "JRN101", title: "Mass Communication in Contemporary Society", credit: "3", prerequisite: "None" },
  { code: "BCH101", title: "Bangladesh Culture and Heritage", credit: "3", prerequisite: "None" },
  { code: "BPH101", title: "Bangladesh Political History", credit: "3", prerequisite: "None" },
  { code: "PSY101", title: "Principles of Psychology", credit: "3", prerequisite: "None" },
  { code: "ANT101", title: "Physical Anthropology", credit: "3", prerequisite: "None" },
  { code: "FRN101", title: "Elementary French I", credit: "3", prerequisite: "None" },
  { code: "SDA101", title: "Public Speaking", credit: "3", prerequisite: "None" },
  { code: "PHI102", title: "Moral Problems", credit: "3", prerequisite: "None" },
  { code: "PSC150", title: "World Politics", credit: "3", prerequisite: "None" },
  { code: "ECO203", title: "Bangladesh Economy", credit: "3", prerequisite: "None" },
  { code: "ENG300", title: "Critical Reading and Writing Skills", credit: "3", prerequisite: "None" },
  { code: "IGS101", title: "Introduction to Gender and Women's Studies", credit: "3", prerequisite: "None" },
  { code: "IIR101", title: "Introduction to International Relations Theory", credit: "3", prerequisite: "None" },
  { code: "WPP101", title: "Western Political Philosophy", credit: "3", prerequisite: "None" },
  { code: "BUS300", title: "Business Communication", credit: "3", prerequisite: "None" },
  { code: "HUM105", title: "Bangladesh Studies", credit: "3", prerequisite: "None" },
  { code: "HUM107", title: "Industrial Management and Law", credit: "3", prerequisite: "None" },
  { code: "HUM201", title: "Macro & Microeconomics", credit: "3", prerequisite: "None" },
  { code: "HUM203", title: "Communication Skills for Engineers", credit: "3", prerequisite: "None" },
  { code: "HUM211", title: "Entrepreneurship for Engineers", credit: "3", prerequisite: "None" },
  { code: "HUM301", title: "Financial & Managerial Accounting", credit: "3", prerequisite: "None" },
  { code: "HUM303", title: "Sociology & Ethics", credit: "3", prerequisite: "None" },
  { code: "HUM305", title: "Professional Ethics & Environmental Protection", credit: "3", prerequisite: "None" },
  { code: "IPD400", title: "Integrated Professional Development", credit: "3", prerequisite: "None" },
  { code: "PHY101", title: "Physics", credit: "3", prerequisite: "None" },
  { code: "PHY102", title: "Physics Laboratory", credit: "1.5", prerequisite: "None" },
  { code: "CHEM201", title: "Chemistry", credit: "3", prerequisite: "None" },
  { code: "MATH107", title: "Differential Calculus, Co-ordinate Geometry & Complex Variables", credit: "3", prerequisite: "AA150" },
  { code: "MATH207", title: "Integral Calculus, Vector Analysis & Linear Algebra", credit: "3", prerequisite: "MATH107" },
  { code: "MATH205", title: "Numerical Analysis", credit: "3", prerequisite: "MATH107" },
  { code: "MATH203", title: "Fourier Analysis, Laplace Transform & Differential Equations", credit: "3", prerequisite: "MATH107" },
  { code: "MATH301", title: "Probability & Statistics", credit: "3", prerequisite: "MATH107" },
  { code: "ME102", title: "Engineering Drawing", credit: "1.5", prerequisite: "None" },
  { code: "EEE111", title: "Introduction to Electrical Engineering", credit: "3", prerequisite: "None" },
  { code: "EEE112", title: "Introduction to Electrical Engineering Laboratory", credit: "1.5", prerequisite: "None" },
  { code: "CSE111", title: "Computer Fundamentals and Programming Basics", credit: "3", prerequisite: "None" },
  { code: "CSE112", title: "Computer Fundamentals and Programming Basics Laboratory", credit: "1.5", prerequisite: "None" },
  { code: "CSE113", title: "Structured Programming Language", credit: "3", prerequisite: "CSE111" },
  { code: "CSE114", title: "Structured Programming Language Laboratory", credit: "1.5", prerequisite: "None" },
  { code: "CSE115", title: "Discrete Mathematics", credit: "3", prerequisite: "CSE113" },
  { code: "CSE123", title: "Object Oriented Programming Language", credit: "3", prerequisite: "CSE113" },
  { code: "CSE124", title: "Object Oriented Programming Language Laboratory", credit: "1.5", prerequisite: "None" },
  { code: "CSE211", title: "Data Structure", credit: "3", prerequisite: "CSE113" },
  { code: "CSE212", title: "Data Structure Laboratory", credit: "1.5", prerequisite: "None" },
  { code: "CSE215", title: "Digital Logic Design", credit: "4", prerequisite: "None" },
  { code: "CSE216", title: "Digital Logic Design Laboratory", credit: "1.5", prerequisite: "None" },
  { code: "CSE221", title: "Algorithms", credit: "3", prerequisite: "CSE211, CSE123" },
  { code: "CSE222", title: "Algorithms Laboratory", credit: "1.5", prerequisite: "None" },
  { code: "CSE223", title: "Digital Electronics & Pulse Technique", credit: "3", prerequisite: "CSE215" },
  { code: "CSE224", title: "Digital Electronics & Pulse Technique Laboratory", credit: "1.5", prerequisite: "None" },
  { code: "CSE225", title: "Database Management System", credit: "3", prerequisite: "CSE123" },
  { code: "CSE226", title: "Database Management System Laboratory", credit: "1.5", prerequisite: "None" },
  { code: "CSE242", title: "Web Development", credit: "1.5", prerequisite: "CSE225" },
  { code: "CSE311", title: "Operating System", credit: "3", prerequisite: "CSE123" },
  { code: "CSE312", title: "Operating System Laboratory", credit: "1.5", prerequisite: "None" },
  { code: "CSE313", title: "Data Communication", credit: "3", prerequisite: "None" },
  { code: "CSE315", title: "Microprocessor and Interfacing", credit: "3", prerequisite: "CSE215, CSE113" },
  { code: "CSE316", title: "Microprocessor and Interfacing Laboratory", credit: "1.5", prerequisite: "None" },
  { code: "CSE317", title: "Computer Organization and Architecture", credit: "3", prerequisite: "CSE211, CSE123" },
  { code: "CSE319", title: "Compiler Design", credit: "3", prerequisite: "CSE123, CSE115, CSE211" },
  { code: "CSE320", title: "Compiler Design Lab", credit: "1.5", prerequisite: "None" },
  { code: "CSE321", title: "Computer Graphics", credit: "3", prerequisite: "CSE221" },
  { code: "CSE322", title: "Computer Graphics Lab", credit: "1.5", prerequisite: "None" },
  { code: "CSE325", title: "Computer Networks", credit: "3", prerequisite: "CSE313" },
  { code: "CSE326", title: "Computer Networks Laboratory", credit: "1.5", prerequisite: "None" },
  { code: "CSE327", title: "Artificial Intelligence", credit: "3", prerequisite: "CSE115, CSE221, CSE315" },
  { code: "CSE328", title: "Artificial Intelligence Lab", credit: "1.5", prerequisite: "None" },
  { code: "CSE342", title: "IoT based Project Development", credit: "1.5", prerequisite: "CSE315" },
  { code: "CSE400", title: "Project / Thesis", credit: "6", prerequisite: "None" },
  { code: "CSE411", title: "Software Engineering", credit: "3", prerequisite: "CSE123, CSE211" },
  { code: "CSE429", title: "Software Project Management", credit: "3", prerequisite: "CSE225, CSE221" },
  { code: "CSE435", title: "Pattern Recognition", credit: "3", prerequisite: "None" },
  { code: "CSE436", title: "Pattern Recognition Lab", credit: "1.5", prerequisite: "None" },
  { code: "CSE439", title: "Digital Image Processing", credit: "3", prerequisite: "CSE321" },
  { code: "CSE440", title: "Digital Image Processing Lab", credit: "1.5", prerequisite: "None" },
  { code: "CSE443", title: "Neural Network and Fuzzy Systems", credit: "3", prerequisite: "CSE327" },
  { code: "CSE447", title: "Robotics", credit: "3", prerequisite: "None" },
  { code: "CSE455", title: "Business Process Reengineering", credit: "3", prerequisite: "CSE225, CSE327" },
  { code: "CSE457", title: "Cyber Security", credit: "3", prerequisite: "CSE325" },
  { code: "CSE459", title: "Network Security", credit: "3", prerequisite: "CSE325" },
  { code: "CSE463", title: "Machine Learning for Big Data Analytics", credit: "3", prerequisite: "CSE225, CSE327" },
  { code: "CSE464", title: "Python based Project Development", credit: "1.5", prerequisite: "CSE327, CSE445" },
  { code: "CSE466", title: "Mobile App Development", credit: "1.5", prerequisite: "CSE227" },
  { code: "ETE309", title: "Digital Signal Processing", credit: "3", prerequisite: "CSE313" },
  { code: "ETE310", title: "Digital Signal Processing Laboratory", credit: "1.5", prerequisite: "CSE313" },
  { code: "ETE431", title: "Mobile Cellular & Wireless Communication", credit: "3", prerequisite: "None" },
  { code: "ETE435", title: "Digital Communication", credit: "3", prerequisite: "CSE313" },
  { code: "ETE436", title: "Digital Communication Laboratory", credit: "1.5", prerequisite: "CSE313" },
  { code: "EEE213", title: "Electronics Devices & Circuits", credit: "3", prerequisite: "EEE111" },
  { code: "EEE214", title: "Electronics Devices & Circuits Lab", credit: "1.5", prerequisite: "None" },
  { code: "EEE317", title: "Electrical Drives & Instrumentation", credit: "3", prerequisite: "CSE215, EEE213" },
  { code: "EEE318", title: "Electrical Drives & Instrumentation Lab", credit: "1.5", prerequisite: "None" }
];

const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const liveResults = document.getElementById("liveResults");

const modalOverlay = document.getElementById("modalOverlay");
const modalCode = document.getElementById("modalCode");
const modalTitle = document.getElementById("modalTitle");
const modalCredit = document.getElementById("modalCredit");
const modalPrerequisite = document.getElementById("modalPrerequisite");

function normalize(text) {
  return (text || "").replace(/\s+/g, "").toUpperCase();
}

/* ✅ GLOBAL HELPER (IMPORTANT FOR CLICK NAVIGATION) */
function getCourseByCode(code) {
  return courses.find(c =>
    normalize(c.code) === normalize(code)
  );
}

function showModal(course) {
  modalCode.textContent = course.code;
  modalTitle.textContent = course.title;
  modalCredit.textContent = course.credit;

  const prereq = course.prerequisite;

  if (!prereq || prereq.toLowerCase() === "none") {
    modalPrerequisite.textContent = "None";
  } else {
    const parts = prereq.split(",");

    modalPrerequisite.innerHTML = parts.map(p => {
      const code = normalize(p.trim());
      const match = getCourseByCode(code);

      if (match) {
        return `
          <div>
            <span
              style="cursor:pointer; color:#7c4dff; font-weight:700;"
              onclick="showModal(getCourseByCode('${match.code}'))"
            >
              ${match.code}
            </span>
            — ${match.title}
          </div>
        `;
      }

      return `<div>${p.trim()}</div>`;
    }).join("");
  }

  modalOverlay.classList.add("active");
}

function closeModal() {
  modalOverlay.classList.remove("active");
}

function searchCourse() {
  const query = normalize(searchInput.value);

  const found = courses.find(course =>
    normalize(course.code) === query
  );

  if (found) {
    showModal(found);
  } else {
    liveResults.innerHTML = `
      <div class="live-item">
        <div class="live-code">Course Not Found</div>
        <div class="live-title">No matching course for ${searchInput.value}</div>
      </div>
    `;
  }
}

function liveSearch() {
  const query = normalize(searchInput.value);

  liveResults.innerHTML = "";

  if (!query) return;

  const matches = courses.filter(course =>
    normalize(course.code).includes(query) ||
    course.title.toUpperCase().includes(query)
  );

  if (matches.length === 0) {
    liveResults.innerHTML = `
      <div class="live-item">
        <div class="live-code">No Results Found</div>
      </div>
    `;
    return;
  }

  matches.forEach(course => {
    const div = document.createElement("div");
    div.className = "live-item";

    div.innerHTML = `
      <div class="live-code">${course.code}</div>
      <div class="live-title">${course.title}</div>
    `;

    div.addEventListener("click", () => {
      showModal(course);
    });

    liveResults.appendChild(div);
  });
}

searchBtn.addEventListener("click", searchCourse);

searchInput.addEventListener("input", liveSearch);

searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    searchCourse();
  }
});

modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) {
    closeModal();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeModal();
  }
});