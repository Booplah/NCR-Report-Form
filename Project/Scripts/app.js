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
    [ROLE_QA]: ['qa-section', 'insp-section'],
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
      [ROLE_QA]: ['qa-section', 'insp-section'],
      [ROLE_ENGINEER]: ['eng-section'],
      [ROLE_PROCUREMENT]: ['proc-section'],
      
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
      event.preventDefault(); // Prevent the default form submission

      // Enhanced validation - check all required fields
      if (!validateForm()) {
        alert('Please complete all the required fields in the Quality Representative section.');
        return;
      }
      
      // Collect data
      const ncrList = JSON.parse(localStorage.getItem('ncrList') || '[]');

      // Mock function for collecting field values
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
        status: 'In Progress',
        currentStage: 'Engineering', // Track current stage
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

        // Purchasing  Fields 
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
      
      // Save to localStorage
      ncrList.push(newNcr);
      localStorage.setItem('ncrList', JSON.stringify(ncrList));
      
      alert('NCR created successfully ✅');
      
      // *** REDIRECT TO ENGINEERING PAGE ***
      window.location.href = '../Sub-Pages/engineering.html';
    });
}

// Enhanced validation function for Quality Rep
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
  
  // Validate all required text/select fields
  requiredFields.forEach((id) => {
    const input = document.getElementById(id);
    const error = document.getElementById('err-' + id);
    
    if (input) {
      if (!input.value.trim()) {
        error.textContent = 'This field is required.';
        input.classList.add('border-red-500');
        valid = false;
      } else {
        error.textContent = '';
        input.classList.remove('border-red-500');
      }
    }
  });

  // Validate radio buttons
  const radios = document.getElementsByName('itemMarkedNonconforming');
  const errorRadio = document.getElementById('err-itemMarkedNonconforming');
  const checked = Array.from(radios).some(radio => radio.checked);
  
  if (radios.length > 0) {
    if (!checked) {
      errorRadio.textContent = 'You must select an option.';
      valid = false;
    } else {
      errorRadio.textContent = '';
    }
  }

  return valid;
}

// Real-time validation for better UX - Quality Rep
document.addEventListener('DOMContentLoaded', () => {
  // Quality Rep form real-time validation
  const requiredFields = [
    'ncrNumber', 'dateReported', 'processApplicable', 'itemDescriptionSAP',
    'supplierName', 'qtyReceived', 'qtyDefective', 'poOrProdNo', 
    'salesOrderNo', 'defectDescription', 'reportedBy'
  ];

  requiredFields.forEach(id => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener('blur', () => {
        const error = document.getElementById('err-' + id);
        if (!input.value.trim()) {
          error.textContent = 'This field is required.';
          input.classList.add('border-red-500');
        } else {
          error.textContent = '';
          input.classList.remove('border-red-500');
        }
      });
    }
  });

  // Real-time validation for radio buttons - Quality Rep
  const radios = document.getElementsByName('itemMarkedNonconforming');
  const errorRadio = document.getElementById('err-itemMarkedNonconforming');
  
  if (radios.length > 0 && errorRadio) {
    radios.forEach(radio => {
      radio.addEventListener('change', () => {
        errorRadio.textContent = '';
      });
    });
  }

  // Cancel button handler for Quality Rep page
  const cancelBtn = document.getElementById('btnValidate');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
        window.location.href = '../Sidebar/create-ncr.html';
      }
    });
  }
});

// Engineering Form Validation
const engineeringForm = document.getElementById('engineeringForm');
if (engineeringForm) {
    engineeringForm.addEventListener('submit', function (event) {
        event.preventDefault();

        if (!validateEngineeringForm()) {
            alert('Please complete all the required fields in the Engineering section.');
            return;
        }

        // Collect engineering data
        const engineeringData = {
            engineerName: document.getElementById('engineerName').value,
            engineerDate: document.getElementById('engineerDate').value,
            engineeringDept: document.getElementById('engineeringDept').value,
            disposition: document.getElementById('disposition').value,
            reviewByEngineering: document.querySelector('input[name="reviewByEngineering"]:checked')?.value,
            originalRevision: document.getElementById('originalRevision').value,
            updatedRevision: document.getElementById('updatedRevision').value,
            revisionDate: document.getElementById('revisionDate').value,
            customerMessage: document.getElementById('customerMessage').value,
            requireUpdate: document.querySelector('input[name="requireUpdate"]:checked')?.value,
            requireNotification: document.querySelector('input[name="requireNotification"]:checked')?.value
        };

        // Save engineering data (you can integrate this with your existing NCR storage)
        console.log('Engineering data saved:', engineeringData);
        alert('Engineering section saved successfully ✅');
        
        // Redirect to next page (Purchasing)
        window.location.href = '../Sub-Pages/purchasing.html';
    });
}

// Engineering form validation function
function validateEngineeringForm() {
    let valid = true;

    const requiredFields = [
        'engineerName',
        'engineerDate',
        'engineeringDept',
        'disposition'
    ];

    // Validate all required text/date fields
    requiredFields.forEach((id) => {
        const input = document.getElementById(id);
        const error = document.getElementById('err-' + id);
        
        if (input) {
            if (!input.value.trim()) {
                error.textContent = 'This field is required.';
                input.classList.add('border-red-500');
                valid = false;
            } else {
                error.textContent = '';
                input.classList.remove('border-red-500');
            }
        }
    });

    // Validate review by engineering radio buttons
    const reviewRadios = document.getElementsByName('reviewByEngineering');
    const errorReview = document.getElementById('err-reviewByEngineering');
    const reviewChecked = Array.from(reviewRadios).some(radio => radio.checked);
    
    if (reviewRadios.length > 0) {
        if (!reviewChecked) {
            errorReview.textContent = 'You must select a review option.';
            valid = false;
        } else {
            errorReview.textContent = '';
        }
    }

    return valid;
}

// Real-time validation for Engineering form
document.addEventListener('DOMContentLoaded', () => {
    // Engineering form real-time validation
    const engineeringRequiredFields = [
        'engineerName', 'engineerDate', 'engineeringDept', 'disposition'
    ];

    engineeringRequiredFields.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('blur', () => {
                const error = document.getElementById('err-' + id);
                if (!input.value.trim()) {
                    error.textContent = 'This field is required.';
                    input.classList.add('border-red-500');
                } else {
                    error.textContent = '';
                    input.classList.remove('border-red-500');
                }
            });
        }
    });

    // Real-time validation for engineering radio buttons
    const reviewRadios = document.getElementsByName('reviewByEngineering');
    const errorReview = document.getElementById('err-reviewByEngineering');
    
    if (reviewRadios.length > 0 && errorReview) {
        reviewRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                errorReview.textContent = '';
            });
        });
    }

    // Cancel button handler for engineering page
    const cancelBtn = document.getElementById('btnCancel');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
                window.location.href = '../Sidebar/create-ncr.html';
            }
        });
    }
});