// Main NCR Application Controller
const ROLES = {
    QA: "QA", ENGINEER: "ENGINEER", PROCUREMENT: "PROCUREMENT", INSPECTOR: "INSPECTOR", ADMIN: "ADMIN"
};

// Role Management
const getCurrentUserRole = () => localStorage.getItem("ncrUserRole") || ROLES.QA;
const setCurrentUserRole = (role) => localStorage.setItem("ncrUserRole", role);
const normalizeRoleValue = (role) => role === "Operational Manager" ? ROLES.PROCUREMENT : role;

// Role-based Field Locking
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

// NCR Number Generation
function generateNcrNumber() {
    const list = JSON.parse(localStorage.getItem("ncrList") || "[]");
    const next = (Math.max(list.length, 10) + 1).toString().padStart(3, "0");
    return `NCR-${new Date().getFullYear()}-${next}`;
}

// Form Validation
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

// Quality Form Submission
function handleQualitySubmit(e) {
    e.preventDefault();
    const required = ["ncrNumber", "dateReported", "processApplicable", "itemDescriptionSAP",
        "supplierName", "qtyReceived", "qtyDefective", "poOrProdNo", "salesOrderNo",
        "defectDescription", "reportedBy"
    ];

    if (!validateFields(required)) return alert("Please fill all required fields.");
    if (window.lucide) lucide.createIcons();

    const get = id => document.getElementById(id)?.value || "";
    const getChecked = name => document.querySelector(`input[name="${name}"]:checked`)?.value || "";

    const ncr = {
        number: get("ncrNumber"), date: get("dateReported"), supplier: get("supplierName"),
        process: get("processApplicable"), qtyReceived: get("qtyReceived"), qtyDefective: get("qtyDefective"),
        description: get("defectDescription"), marked: getChecked("itemMarkedNonconforming"),
        reportedBy: get("reportedBy"), disposition: get("dispositionDetails"),
        enginName: get("enginName"), engDate: get("engDate"), createdAt: new Date().toISOString()
    };

    const list = JSON.parse(localStorage.getItem("ncrList") || "[]");
    list.push(ncr);
    localStorage.setItem("ncrList", JSON.stringify(list));

    alert("NCR created successfully ✅");
    e.target.reset();
}

// Main Initialization
document.addEventListener("DOMContentLoaded", () => {
    let showSectionForRole = () => {};
    // Auto-generate NCR Number
    const ncrNum = document.getElementById("ncrNumber");
    if (ncrNum && !ncrNum.value) {
        ncrNum.value = generateNcrNumber();
        ncrNum.readOnly = true;
    }

    // Role Management
    const roleSelector = document.getElementById("roleSelector");
    const role = normalizeRoleValue(getCurrentUserRole());
    setCurrentUserRole(role);
    disableFieldsByRole(role);
    
    if (roleSelector) {
        roleSelector.value = role;
        roleSelector.addEventListener("change", e => {
            const selectedRole = normalizeRoleValue(e.target.value);
            setCurrentUserRole(selectedRole);
            disableFieldsByRole(selectedRole);
            showSectionForRole(selectedRole);
        });
    }

    // Form Submission
    const formQA = document.getElementById("formQualityRep");
    if (formQA) formQA.addEventListener("submit", handleQualitySubmit);

    // Cancel Buttons
    document.querySelectorAll(".btn-cancel").forEach(btn => {
        btn.addEventListener("click", () => {
            const form = btn.closest("form");
            if (!form) return;
            const shouldReset = window.confirm("Cancel changes and clear this section?");
            if (shouldReset) form.reset();
        });
    });

    // Progress Tabs Management
    const tabs = document.querySelectorAll(".progress-tab");
    const sections = document.querySelectorAll(".progress-section");
    const ACTIVE_TAB_CLASSES = "border-b-2 border-blue-600 px-4 py-2 text-md font-medium text-blue-600 transition-colors hover:text-dblue-700";
    const INACTIVE_TAB_CLASSES = "border-b-2 border-transparent px-4 py-2 text-md font-medium text-gray-600 transition-colors hover:text-gray-700";

    if (tabs.length && sections.length) {
        function setActiveStep(step) {
            tabs.forEach((tab) => {
                const isActive = tab.dataset.step === step;
                tab.setAttribute("aria-selected", isActive);
                tab.className = `progress-tab ${isActive ? ACTIVE_TAB_CLASSES : INACTIVE_TAB_CLASSES}`;
            });

            sections.forEach((section) => {
                section.toggleAttribute("hidden", section.dataset.stepContent !== step);
            });
        }

        const lockTabsToStep = (step) => {
            tabs.forEach((tab) => {
                const locked = Boolean(step) && tab.dataset.step !== step;
                tab.classList.toggle("text-gray-400", locked);
                tab.classList.toggle("cursor-not-allowed", locked);
                tab.classList.toggle("pointer-events-none", locked);
                tab.setAttribute("aria-disabled", locked);
                tab.tabIndex = locked ? -1 : 0;
            });
        };

        const roleStepMap = {
            [ROLES.QA]: "quality", [ROLES.ENGINEER]: "engineering", 
            [ROLES.PROCUREMENT]: "procurement", [ROLES.INSPECTOR]: "final-review", 
            [ROLES.ADMIN]: "quality"
        };

        showSectionForRole = (selectedRole) => {
            const targetStep = roleStepMap[selectedRole];
            if (targetStep) {
                setActiveStep(targetStep);
                lockTabsToStep(targetStep);
            } else {
                lockTabsToStep(null);
            }
        };

        const initialTab = [...tabs].find((tab) => tab.getAttribute("aria-selected") === "true") || tabs[0];
        if (initialTab?.dataset.step) setActiveStep(initialTab.dataset.step);

        tabs.forEach((tab) => {
            tab.addEventListener("click", () => {
                if (tab.dataset.step && tab.getAttribute("aria-disabled") !== "true") {
                    setActiveStep(tab.dataset.step);
                }
            });
        });

        if (roleSelector) showSectionForRole(roleSelector.value);
    }
});
