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
function validateFields(ids, errorMessage = "This field is required.") {
    let allValid = true;

    ids.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;

        const errEl = document.getElementById(`err-${id}`);
        const value = (el.value || "").trim();
        const isValid = value !== "";

        if (!isValid) {
            allValid = false;
            el.classList.add("border-red-500");
            el.setAttribute("aria-invalid", "true");
            if (errEl) errEl.textContent = errorMessage;
        } else {
            el.classList.remove("border-red-500");
            el.removeAttribute("aria-invalid");
            if (errEl) errEl.textContent = "";
        }
    });

    return allValid;
}

function validateRadioGroups(groupNames, errorMessage = "Please select an option.") {
    let allValid = true;

    groupNames.forEach(name => {
        const checked = document.querySelector(`input[name="${name}"]:checked`);
        const errEl = document.getElementById(`err-${name}`);

        if (!checked) {
            allValid = false;
            if (errEl) errEl.textContent = errorMessage;
        } else if (errEl) {
            errEl.textContent = "";
        }
    });

    return allValid;
}

function showRequiredAlertIfNeeded(isValid) {
    if (!isValid) {
        alert("Please complete all required fields.");
        return false;
    }
    return true;
}
// Quality Form Submission
function handleQualitySubmit(e) {
    if (e) e.preventDefault();

    const required = [
        "ncrNumber",
        "dateReported",
        "processApplicable",
        "itemDescriptionSAP",
        "supplierName",
        "qtyReceived",
        "qtyDefective",
        "poOrProdNo",
        "salesOrderNo",
        "defectDescription",
        "reportedBy"
    ];

    const fieldsOk = validateFields(required);
    if (!showRequiredAlertIfNeeded(fieldsOk)) {
        return false;
    }

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
        poOrProdNo: get("poOrProdNo"),
        salesOrder: get("salesOrderNo"),
        reportedBy: get("reportedBy")
    };

    const list = JSON.parse(localStorage.getItem("ncrList") || "[]");
    list.push(ncr);
    localStorage.setItem("ncrList", JSON.stringify(list));

    // Success: show submit modal instead of another alert
    if (typeof openModal === "function") {
        openModal("submitModal");
    }

    return true;
}
// Engineer Form Submission
function handleEngineeringSubmit(e, action) {
    if (e) e.preventDefault();

    const requiredInputs = [
        "dispositionDetails",
        "origRevNum",
        "updatedRev",
        "enginName",
        "engDate"
    ];

    const requiredRadioGroups = [
        "cfEngDisposition",
        "reqNotif",
        "reqUpdating"
    ];

    const fieldsOk = validateFields(requiredInputs);
    const radiosOk = validateRadioGroups(requiredRadioGroups);

    if (!showRequiredAlertIfNeeded(fieldsOk && radiosOk)) {
        return false;
    }

    const get = id => document.getElementById(id)?.value || "";
    const getRadio = name => document.querySelector(`input[name="${name}"]:checked`)?.value || "";

    const engineeringData = {
        disposition: getRadio("cfEngDisposition"),
        dispositionDetails: get("dispositionDetails"),
        customerNotification: getRadio("reqNotif"),
        drawingUpdate: getRadio("reqUpdating"),
        originalRev: get("origRevNum"),
        updatedRev: get("updatedRev"),
        engineerName: get("enginName"),
        date: get("engDate"),
        submittedAt: new Date().toISOString()
    };

    const list = JSON.parse(localStorage.getItem("ncrList") || "[]");
    if (list.length > 0) {
        const lastIndex = list.length - 1;
        list[lastIndex] = { ...list[lastIndex], ...engineeringData };
        localStorage.setItem("ncrList", JSON.stringify(list));
    } else {
        localStorage.setItem("ncrList", JSON.stringify([engineeringData]));
    }

    if (typeof openModal === "function") {
        if (action === "save") {
            openModal("saveModal");
        } else {
            openModal("submitModal");
        }
    }

    return true;
}


function handleProcurementSubmit(e, action) {
    if (e) e.preventDefault();

    const required = [
        "operationsManager",
        "operationsManagerDate"
    ];

    let fieldsOk = validateFields(required);

    // If Follow Up Required = Yes, then followUpDetails + carNumber are required
    const followUpYes = document.querySelector('input[name="followUpRequired"][value="Yes"]:checked');
    if (followUpYes) {
        const followRequired = ["followUpDetails", "carNumber"];
        const followOk = validateFields(followRequired);
        fieldsOk = fieldsOk && followOk;
    }

    if (!showRequiredAlertIfNeeded(fieldsOk)) {
        return false;
    }

    const get = id => document.getElementById(id)?.value || "";
    const getRadio = name => document.querySelector(`input[name="${name}"]:checked`)?.value || "";

    const procurementData = {
        followUpRequired: getRadio("followUpRequired"),
        followUpDetails: get("followUpDetails"),
        carNumber: get("carNumber"),
        operationsManager: get("operationsManager"),
        operationsManagerDate: get("operationsManagerDate"),
        submittedAt: new Date().toISOString()
    };

    const list = JSON.parse(localStorage.getItem("ncrList") || "[]");
    if (list.length > 0) {
        const lastIndex = list.length - 1;
        list[lastIndex] = { ...list[lastIndex], ...procurementData };
        localStorage.setItem("ncrList", JSON.stringify(list));
    } else {
        localStorage.setItem("ncrList", JSON.stringify([procurementData]));
    }

    if (typeof openModal === "function") {
        if (action === "save") {
            openModal("saveModal");
        } else {
            openModal("submitModal");
        }
    }

    return true;
}

// --- Initialization Block Update ---
document.addEventListener("DOMContentLoaded", () => {
    // ... existing code ...

    // Bind Engineering Form
    const formEng = document.getElementById("formEngineering");
    if (formEng) {
        formEng.addEventListener("submit", handleEngineeringSubmit);
    }
});
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