// Main NCR Application Controller
const ROLES = {
    QA: "QA", ENGINEER: "ENGINEER", OPERATIONS: "OPERATIONS", PROCUREMENT: "PROCUREMENT", INSPECTOR: "INSPECTOR", ADMIN: "ADMIN"
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
        // FIX: Map Operations role to 'ops-section'
        [ROLES.OPERATIONS]: ["ops-section"],
        // FIX: Map Procurement role to 'proc-section'
        [ROLES.PROCUREMENT]: ["proc-section"], 
        [ROLES.INSPECTOR]: ["insp-section"],
        // FIX: Update ADMIN to include both new sections
        [ROLES.ADMIN]: ["qa-section", "eng-section", "ops-section", "proc-section", "insp-section"]
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
        const errEl = document.getElementById(`err-${id}`);

        if (!el) return; // Skip if element not found

        // Handle error display
        if (!el.value.trim()) {
            el.classList.add("border-red-500");
            if (errEl) errEl.textContent = errorMessage;
            allValid = false;
        } else {
            el.classList.remove("border-red-500");
            if (errEl) errEl.textContent = "";
        }
    });
    return allValid;
}
// Quality Form Submission
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
/*/ Engineering Form Submission
function handleEngineeringSubmit(e) {
    e.preventDefault();

    // 1. Define required text/select fields (by ID)
    const requiredIds = [
        "dispositionDetails", 
        "enginName", 
        "engDate"
    ];

    // 2. Define required radio groups (by Name)
    const requiredRadioGroups = [
        "cfEngDisposition", 
        "reqNotif", 
        "reqUpdating"
    ];

    // 3. Perform Validation
    let isValid = validateFields(requiredIds); // Helper from existing code

    // Custom validation for Radio Groups
    requiredRadioGroups.forEach(groupName => {
        const checked = document.querySelector(`input[name="${groupName}"]:checked`);
        if (!checked) {
            isValid = false;
            // Optional: Add error highlighting logic here if specific container IDs exist
        }
    });

    if (!isValid) {
        return alert("Please fill all required Engineering fields (Disposition, Notifications, Updates, Name, Date).");
    }

    // 4. Alert for Confirmation
    const isConfirmed = confirm("Are you sure you want to submit the Engineering section?");
    if (!isConfirmed) {
        return; // Stop here if user cancelled
    }

    // 5. Normal Process (Save Data)
    const get = id => document.getElementById(id)?.value || "";
    const getRadio = name => document.querySelector(`input[name="${name}"]:checked`)?.value || "";

    // Create Engineering Data Object
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

    // Save to LocalStorage (Merging with existing list or current NCR context)
    // For this prototype, we push to the list or update the last entry
    const list = JSON.parse(localStorage.getItem("ncrList") || "[]");
    if (list.length > 0) {
        // Assuming we are updating the most recent NCR being worked on
        const lastIndex = list.length - 1;
        list[lastIndex] = { ...list[lastIndex], ...engineeringData };
        localStorage.setItem("ncrList", JSON.stringify(list));
    } else {
        // Fallback if no NCR exists yet
        localStorage.setItem("ncrList", JSON.stringify([engineeringData]));
    }

    alert("Engineering section saved successfully ✅");
    // Optional: Redirect or reset
    // e.target.reset(); 
}

function handleEngineeringSubmit(e) {
    e.preventDefault();

    // 1. Validate required text/date inputs
    // Assuming Disposition, Engineer Name, and Date are mandatory
    const requiredInputs = ["dispositionDetails", "enginName", "engDate"];
    let inputsValid = validateFields(requiredInputs);
    
    // 2. Validate required radio group: "Review by CF Engineering" (name: cfEngDisposition)
    const reviewRadioGroup = document.querySelector('input[name="cfEngDisposition"]:checked');
    let reviewValid = !!reviewRadioGroup;
    const reviewErrorDiv = document.getElementById('err-cfEngDisposition');

    if (!reviewValid) {
        if (reviewErrorDiv) reviewErrorDiv.textContent = "Please select a disposition option.";
    } else {
        if (reviewErrorDiv) reviewErrorDiv.textContent = "";
    }

    if (inputsValid && reviewValid) {
        console.log("Engineering form submitted and validated successfully! (Data saved placeholder)");
        alert("Engineering changes saved successfully. ✅");
    } else {
        alert("Please fill all required fields and correct the highlighted errors.");
    }
}*/
// Engineering Form Submission - NEW FUNCTION WITH VALIDATION
function handleEngineeringSubmit(e) {
    e.preventDefault();

    // 1. Validate required text/date inputs
    // Assuming Disposition, Engineer Name, and Date are mandatory
    const requiredInputs = ["dispositionDetails", "enginName", "engDate"];
    let inputsValid = validateFields(requiredInputs);

    // 2. Validate required radio group: "Review by CF Engineering" (name: cfEngDisposition)
    const reviewRadioGroup = document.querySelector('input[name="cfEngDisposition"]:checked');
    let reviewValid = !!reviewRadioGroup;
    const reviewErrorDiv = document.getElementById('err-cfEngDisposition');

    if (!reviewValid) {
        if (reviewErrorDiv) reviewErrorDiv.textContent = "Please select a disposition option.";
    } else {
        if (reviewErrorDiv) reviewErrorDiv.textContent = "";
    }

    if (inputsValid && reviewValid) {
        console.log("Engineering form submitted and validated successfully! (Data saved placeholder)");
        alert("Engineering changes saved successfully. ✅");
    } else {
        alert("Please fill all required fields and correct the highlighted errors.");
    }
}
// Handler for Operations Section
function handleOperationsSubmit(e) {
    e.preventDefault();

    // Validate required fields: Operations Manager Name and Date.
    const requiredInputs = ["operationsManager", "operationsManagerDate"];
    let inputsValid = validateFields(requiredInputs);

    if (inputsValid) {
        console.log("Operations form submitted and validated successfully! (Data saved placeholder)");
        alert("Operations changes saved successfully. ✅");
    } else {
        alert("Please fill all required fields and correct the highlighted errors.");
    }
}
function handleProcurementSubmit(e, action = 'submit') {
    e.preventDefault();

    const form = document.getElementById('formProcurement');

    // 1. Mandatory: Supplier Disposition Decision
    const requiredRadio = form.querySelector('input[name="supplierDispositionDecision"]:checked');
    const radioErrorDiv = document.getElementById('err-supplierDispositionDecision');
    let radioValid = !!requiredRadio;

    if (!radioValid) {
        if (radioErrorDiv) radioErrorDiv.textContent = "Please select Return or Dispose.";
    } else {
        if (radioErrorDiv) radioErrorDiv.textContent = "";
    }

    // 2. Conditional: If "Return" selected → RMA and Carrier required
    let conditionalValid = true;
    const rmaEl = document.getElementById('rmaNumber');
    const carrierEl = document.getElementById('carrierDetails');

    // Reset border styles
    [rmaEl, carrierEl].forEach(el => el?.classList.remove("border-red-500"));

    if (requiredRadio?.value === 'Return') {
        if (!rmaEl?.value.trim()) {
            rmaEl?.classList.add("border-red-500");
            conditionalValid = false;
        }
        if (!carrierEl?.value.trim()) {
            carrierEl?.classList.add("border-red-500");
            conditionalValid = false;
        }
    }

    // 3. Always require Operations Manager Name
    const opsManager = document.getElementById('operationsManager');
    const opsDate = document.getElementById('operationsManagerDate');
    let managerValid = opsManager?.value.trim() !== '';

    if (!managerValid) {
        opsManager?.classList.add("border-red-500");
    } else {
        opsManager?.classList.remove("border-red-500");
    }

    // Final validation result
    const allValid = radioValid && conditionalValid && managerValid;

    if (allValid && action === 'submit') {
        // Optional: Save to localStorage here if needed
        alert("NCR successfully submitted by Operations & Procurement! Proceeding to Final Review...");

        // REDIRECT TO FINAL REVIEW PAGE
        window.location.href = "./ncr-final-review.html";
    } else if (allValid && action === 'save') {
        alert("Draft saved successfully!");
    } else {
        alert("Please fix the highlighted errors before submitting.");
    }
}

// Add this near the other event listeners (after formProcurement submit binding)
const procurementSubmitBtn = document.getElementById('procurementSubmitBtn');
if (procurementSubmitBtn) {
    procurementSubmitBtn.addEventListener('click', (e) => {
        handleProcurementSubmit(e, 'submit'); // 'submit' triggers redirect
    });
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
    let showSectionForRole = () => { };
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
    // Form Submission: Attach submit handler for Operations form
    const formOperations = document.getElementById("formOperations");
    if (formOperations) formOperations.addEventListener("submit", handleOperationsSubmit);

    // Form Submission: Attach submit handler for Procurement form (calls revised function)
    const formProcurement = document.getElementById("formProcurement");
    if (formProcurement) formProcurement.addEventListener("submit", handleProcurementSubmit);

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
            [ROLES.OPERATIONS]: "operations", [ROLES.PROCUREMENT]: "procurement",
            [ROLES.INSPECTOR]: "final-review", [ROLES.ADMIN]: "quality"
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
