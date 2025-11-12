// [ Roles ]
const ROLES = {
  QA: "QA",
  ENGINEER: "ENGINEER",
  PROCUREMENT: "PROCUREMENT",
  INSPECTOR: "INSPECTOR",
  ADMIN: "ADMIN"
};

// [ Role Helpers ]
const getCurrentUserRole = () => localStorage.getItem("ncrUserRole") || ROLES.QA;
const setCurrentUserRole = (role) => localStorage.setItem("ncrUserRole", role);

// [ Role-based Field Locking ]
function disableFieldsByRole(role) {
  const editable = {
    [ROLES.QA]: ["qa-section", "insp-section"],
    [ROLES.ENGINEER]: ["eng-section"],
    [ROLES.PROCUREMENT]: ["proc-section"],
    [ROLES.INSPECTOR]: ["insp-section"],
    [ROLES.ADMIN]: ["qa-section", "eng-section", "proc-section", "insp-section"]
  };

  document.querySelectorAll("[data-section-role]").forEach(section => {
    const isEditable = editable[role]?.includes(section.dataset.sectionRole);
    section.querySelectorAll("input, select, textarea, .actions button").forEach(el => {
      el.disabled = !isEditable;
      el.classList.toggle("bg-gray-100", !isEditable);
      el.classList.toggle("cursor-not-allowed", !isEditable);
    });
  });
}

// ======== NCR Number
function generateNcrNumber() {
  const list = JSON.parse(localStorage.getItem("ncrList") || "[]");
  const next = (Math.max(list.length, 10) + 1).toString().padStart(3, "0");
  return `NCR-${new Date().getFullYear()}-${next}`;
}

// ======== Form Validation (Simple Check)
function validateFields(ids) {
  let valid = true;
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el && !el.value.trim()) {
      el.classList.add("border-red-500");
      valid = false;
    } else if (el) el.classList.remove("border-red-500");
  });
  return valid;
}

// ======== Save Handlers
function handleQualitySubmit(e) {
  e.preventDefault();
  const required = ["ncrNumber", "dateReported", "processApplicable", "itemDescriptionSAP",
    "supplierName", "qtyReceived", "qtyDefective", "poOrProdNo", "salesOrderNo",
    "defectDescription", "reportedBy"
  ];

  if (!validateFields(required)) return alert("Please fill all required fields.");

  const get = id => document.getElementById(id)?.value || "";
  const getChecked = name => document.querySelector(`input[name="${name}"]:checked`)?.value || "";

  const ncr = {
    number: get("ncrNumber"),
    date: get("dateReported"),
    supplier: get("supplierName"),
    process: get("processApplicable"),
    qtyReceived: get("qtyReceived"),
    qtyDefective: get("qtyDefective"),
    description: get("defectDescription"),
    marked: getChecked("itemMarkedNonconforming"),
    reportedBy: get("reportedBy"),
    disposition: get("dispositionDetails"),
    enginName: get("enginName"),
    engDate: get("engDate"),
    createdAt: new Date().toISOString()
  };

  const list = JSON.parse(localStorage.getItem("ncrList") || "[]");
  list.push(ncr);
  localStorage.setItem("ncrList", JSON.stringify(list));

  alert("NCR created successfully ✅");
  e.target.reset();
}

// ======== Initialization
document.addEventListener("DOMContentLoaded", () => {
  // Auto-generate NCR #
  const ncrNum = document.getElementById("ncrNumber");
  if (ncrNum && !ncrNum.value) {
    ncrNum.value = generateNcrNumber();
    ncrNum.readOnly = true;
  }

  // Role management
  const role = getCurrentUserRole();
  disableFieldsByRole(role);
  const roleSelector = document.getElementById("roleSelector");
  if (roleSelector) {
    roleSelector.value = role;
    roleSelector.addEventListener("change", e => {
      setCurrentUserRole(e.target.value);
      disableFieldsByRole(e.target.value);
    });
  }

  // Form submit
  const formQA = document.getElementById("formQualityRep");
  if (formQA) formQA.addEventListener("submit", handleQualitySubmit);

  // Cancel buttons (reset only)
  document.querySelectorAll(".btnCancel").forEach(btn => {
    btn.addEventListener("click", () => btn.closest("form")?.reset());
  });
});
