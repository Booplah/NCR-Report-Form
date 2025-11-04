// JS for Create Page (made by: Alex)

// ========================================================
// ======== NEW: Role Management and Field Disabling 
// ========================================================
const ROLE_QA = 'QA';
const ROLE_ENGINEER = 'ENGINEER';
const ROLE_PROCUREMENT = 'PROCUREMENT';
const ROLE_INSPECTOR = 'INSPECTOR';
const ROLE_ADMIN = 'ADMIN';

// --- Role Persistence (for prototype) ---
function getCurrentUserRole() {
  return localStorage.getItem('ncrUserRole') || ROLE_QA; // Default to QA
}

function setCurrentUserRole(role) {
  localStorage.setItem('ncrUserRole', role);
}

// --- Field Disabling Logic ---
function disableFieldsByRole(role) {
  // Define which roles can edit which sections
  const editableSections = {
    [ROLE_QA]: ['qa-section'],
    [ROLE_ENGINEER]: ['eng-section'],
    [ROLE_PROCUREMENT]: ['proc-section'],
    [ROLE_INSPECTOR]: ['insp-section'],
    [ROLE_ADMIN]: ['qa-section', 'eng-section', 'proc-section', 'insp-section'] // Admin can edit all
  };

  const allSections = document.querySelectorAll('[data-section-role]');

  allSections.forEach(section => {
    const sectionRole = section.getAttribute('data-section-role');
    const isEditable = editableSections[role] && editableSections[role].includes(sectionRole);

    // Select all form elements and action buttons within the section
    const inputs = section.querySelectorAll('input, select, textarea, .actions button');

    inputs.forEach(input => {
      // Disable all fields and buttons if the section is not editable
      input.disabled = !isEditable;
      if (!isEditable) {
          input.classList.add('bg-gray-100', 'cursor-not-allowed');
      } else {
          input.classList.remove('bg-gray-100', 'cursor-not-allowed');
      }
    });

    // Special handling for radio/checkbox groups
    const radioGroups = section.querySelectorAll('[role="radiogroup"], .checkbox-group');
    radioGroups.forEach(group => {
      const allInputs = group.querySelectorAll('input');
      allInputs.forEach(input => {
        input.disabled = !isEditable;
      });
    });
  });

  // Re-enable the role selector itself for any user
  const roleSelector = document.getElementById('roleSelector');
  if (roleSelector) {
    roleSelector.disabled = false;
  }
}

// ========================================================
// ======== END: Role Management and Field Disabling ========
// ========================================================


            // Create NCR //
// ======== Function to obtain ncr
/*function getExistingNcrCount() {
  const existing = JSON.parse(localStorage.getItem('ncrList') || '[]');        //// It's not implemented yet
  return existing.length;
}*/
// Mock function to simulate fetching existing NCR count (assuming a total count of 10 for demo)
function getExistingNcrCount() {
    // This is a mock implementation for the prototype to ensure a starting NCR number
    const mockList = JSON.parse(localStorage.getItem('ncrList') || '[]');
    // Start count higher if the mock list is small, to simulate an existing system.
    return Math.max(mockList.length, 10);
}

// function  to generate automatically NCR Number 
function generateNcrNumber() {
  const count = getExistingNcrCount();
  const next = (count + 1).toString().padStart(3, '0');
  const year = new Date().getFullYear();
  return `NCR-${year}-${next}`;
}

// when the user click on create ncr , automatically its generated the ncr number
document.addEventListener('DOMContentLoaded', () => {
  const ncrInput = document.getElementById('ncrNumber');
  if (ncrInput && !ncrInput.value) { // Only set if empty
    ncrInput.value = generateNcrNumber();
    ncrInput.readOnly = true;
  }
  
  // Apply role logic on load for all pages that include this script
  const role = getCurrentUserRole();
  const roleSelector = document.getElementById('roleSelector');
  if (roleSelector) {
      roleSelector.value = role;
      disableFieldsByRole(role);

      roleSelector.addEventListener('change', (event) => {
          const newRole = event.target.value;
          setCurrentUserRole(newRole);
          disableFieldsByRole(newRole);
      });
  } else {
      // Apply default disabling for pages that don't have a selector but use this script
      disableFieldsByRole(role);
  }
});

// ======== Validation only in the required fields
function validateForm() {
  let valid = true;

  const requiredFields = [
    'ncrNumber',
    'dateReported',
    'processApplicable',
    'itemDescriptionSAP',
    'supplierName',
    'qtyReceived',
    'qtyDefective',
    'poOrProdNo',
    'salesOrderNo',
    'defectDescription',
    'reportedBy',
    
  ];
  
  // Find all editable fields that are part of the currently editable section
  const currentRole = getCurrentUserRole();
  const editableSections = {
      [ROLE_QA]: ['qa-section'],
      [ROLE_ENGINEER]: ['eng-section'],
      [ROLE_PROCUREMENT]: ['proc-section'],
      [ROLE_INSPECTOR]: ['insp-section'],
      [ROLE_ADMIN]: ['qa-section', 'eng-section', 'proc-section', 'insp-section'] 
  };
  
  const isQaEditable = editableSections[currentRole] && editableSections[currentRole].includes('qa-section');
  const isEngEditable = editableSections[currentRole] && editableSections[currentRole].includes('eng-section');

  requiredFields.forEach((id) => {
    const input = document.getElementById(id);
    const error = document.getElementById('err-' + id);
    
    // Only validate required fields in the QA section if the QA section is editable
    if (input && isQaEditable) {
        if (requiredFields.includes(id) && !input.value.trim()) {
          error.textContent = 'This field is required.';
          valid = false;
        } else {
          error.textContent = '';
        }
    }
  });

  // validation for radio buttons (only validating if the QA section is editable)
  const radios = document.getElementsByName('itemMarkedNonconforming');
  const errorRadio = document.getElementById('err-itemMarkedNonconforming');
  const checked = Array.from(radios).some(radio => radio.checked);
  
  if (radios.length > 0 && isQaEditable) {
    if (!checked) {
      errorRadio.textContent = 'You must select a option.';
      valid = false;
    } else {
      errorRadio.textContent = '';
    }
  }


  return valid;
}

// ========  Save NCR when the validation is correct 
const ncrForm = document.getElementById('ncrForm');
if (ncrForm) {
    ncrForm.addEventListener('submit', function (event) {
      event.preventDefault(); // Prevent the event 

      // Only run validation if the QA section is currently editable and validation is simple (for prototype simplicity)
      if (getCurrentUserRole() === ROLE_QA || getCurrentUserRole() === ROLE_ADMIN) {
          if (!validateForm()) {
            alert('Please complete all the required fields in the Quality Representative section.');
            return;
          }
      }
      
      // Collect data (simplified for prototype)
      const ncrList = JSON.parse(localStorage.getItem('ncrList') || '[]');

      const isNewNcr = document.getElementById('ncrNumber')?.readOnly ?? true; // Simple check for new NCR page

      // Mock function for collecting field values, accounting for existence on the page
      const getVal = (id) => {
          const el = document.getElementById(id);
          return el ? el.value : null;
      }
      const getCheckedVal = (name) => {
          const el = document.querySelector(`input[name="${name}"]:checked`);
          return el ? el.value : null;
      }
      
      const newNcr = {
        // QA Fields
        number: getVal('ncrNumber'),
        date: getVal('dateReported'),
        process: getVal('processApplicable'),
        supplier: getVal('supplierName'),
        poOrProd: getVal('poOrProdNo'),
        salesOrder: getVal('salesOrderNo'),
        itemDesc: getVal('itemDescriptionSAP'),
        qtyReceived: getVal('qtyReceived'),
        qtyDefective: getVal('qtyDefective'),
        defect: getVal('defectDescription'),
        marked: getCheckedVal('itemMarkedNonconforming'),
        reportedBy: getVal('reportedBy'),
        status: getVal('status'),
        createdAt: new Date().toISOString(),
        
        // Engineer Fields 
        docNum: getVal('docNum'),
        cfEngDisposition: getCheckedVal('cfEngDisposition'),
        reqNotif: getCheckedVal('reqNotif'),
        dispositionDetails: getVal('dispositionDetails'),
        reqUpdating: getCheckedVal('reqUpdating'),
        origRevNum: getVal('origRevNum'),
        updatedRev: getVal('updatedRev'),
        enginName: getVal('enginName'),
        revDate: getVal('revDate'),
        engineeringDept: getVal('engineeringDept'),
        engDate: getVal('engDate'),

        // Procurement Fields 
        purchDecision: getCheckedVal('purchDecision'),
        carRaised: getCheckedVal('carRaised'),
        carNumber: getVal('carNumber'),
        followUpRequired: getCheckedVal('followUpRequired'),
        followUpDetails: getVal('followUpDetails'),
        operationsManager: getVal('operationsManager'),
        operationsManagerDate: getVal('operationsManagerDate'),

        // Inspector Fields
        reInspectAcceptable: getCheckedVal('reInspectAcceptable'),
        newNcrNumber: getVal('newNcrNumber'),
        inspectorName: getVal('inspectorName'),
        inspectorDate: getVal('inspectorDate'),
        ncrClosed: getCheckedVal('ncrClosed'),
        qualityDepartment: getVal('qualityDepartment'),
        qualityDepartmentDate: getVal('qualityDepartmentDate')
        
      };
      
      if (isNewNcr) {
          ncrList.push(newNcr);
          alert('NCR created succesfully ✅');
      } else {
          // For 'edit-ncr.html' we'd look up the NCR to update, but for this prototype, we'll just show a success message.
          alert('NCR changes saved succesfully (Prototype update) ✅');
      }
      
      localStorage.setItem('ncrList', JSON.stringify(ncrList));
      
      // *** NEW: REDIRECTION AFTER SAVE ***
      // This is the best way to move the user to the view page upon successful saving.
      window.location.href = '../Sub-Pages/view.html';


      // Only reset if it's a new NCR (or if the form is fully saved in a single go)
      if (isNewNcr) {
        this.reset();
        document.getElementById('ncrNumber').value = generateNcrNumber();
      }
      
      // Re-apply role logic after save/reset
      disableFieldsByRole(getCurrentUserRole());
    });
}


// ======== Cancel Button: Reset all the from and make a new ncr number
const btnCancel = document.getElementById('btnCancel');
if (btnCancel) {
    btnCancel.addEventListener('click', () => {
      document.getElementById('ncrForm').reset();
      const ncrInput = document.getElementById('ncrNumber');
      if (ncrInput && ncrInput.readOnly) {
        document.getElementById('ncrNumber').value = generateNcrNumber();
      }
      // Re-apply role logic after reset
      disableFieldsByRole(getCurrentUserRole());
    });
}