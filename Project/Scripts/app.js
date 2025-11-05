// JS for Create Page (made by: Alex)

// ========================================================
// ======== Role Management and Field Disabling 
// ========================================================
const ROLE_QA = 'QA';
const ROLE_ENGINEER = 'ENGINEER';
const ROLE_PROCUREMENT = 'PROCUREMENT';
const ROLE_INSPECTOR = 'INSPECTOR';
const ROLE_ADMIN = 'ADMIN';

// Role Persistence
function getCurrentUserRole() {
  return localStorage.getItem('ncrUserRole') || ROLE_QA;
}

function setCurrentUserRole(role) {
  localStorage.setItem('ncrUserRole', role);
}

// Field Disabling Logic
function disableFieldsByRole(role) {
  const editableSections = {
    [ROLE_QA]: ['qa-section', 'insp-section'],
    [ROLE_ENGINEER]: ['eng-section'],
    [ROLE_PROCUREMENT]: ['proc-section'],
    [ROLE_INSPECTOR]: ['insp-section'],
    [ROLE_ADMIN]: ['qa-section', 'eng-section', 'proc-section', 'insp-section']
  };

  const allSections = document.querySelectorAll('[data-section-role]');

  allSections.forEach(section => {
    const sectionRole = section.getAttribute('data-section-role');
    const isEditable = editableSections[role]?.includes(sectionRole);
    const inputs = section.querySelectorAll('input, select, textarea, .actions button');

    inputs.forEach(input => {
      input.disabled = !isEditable;
      if (!isEditable) {
        input.classList.add('bg-gray-100', 'cursor-not-allowed');
      } else {
        input.classList.remove('bg-gray-100', 'cursor-not-allowed');
      }
    });

    const radioGroups = section.querySelectorAll('[role="radiogroup"], .checkbox-group');
    radioGroups.forEach(group => {
      group.querySelectorAll('input').forEach(input => {
        input.disabled = !isEditable;
      });
    });
  });

  const roleSelector = document.getElementById('roleSelector');
  if (roleSelector) roleSelector.disabled = false;
}

// ========================================================
// ======== NCR Number Generation
// ========================================================
function getExistingNcrCount() {
  const mockList = JSON.parse(localStorage.getItem('ncrList') || '[]');
  return Math.max(mockList.length, 10);
}

function generateNcrNumber() {
  const count = getExistingNcrCount();
  const next = (count + 1).toString().padStart(3, '0');
  const year = new Date().getFullYear();
  return `NCR-${year}-${next}`;
}

// ========================================================
// ======== Form Validation Functions
// ========================================================
function validateForm() {
  let valid = true;
  const requiredFields = [
    'ncrNumber', 'dateReported', 'processApplicable', 'itemDescriptionSAP',
    'supplierName', 'qtyReceived', 'qtyDefective', 'poOrProdNo', 
    'salesOrderNo', 'defectDescription', 'reportedBy'
  ];

  requiredFields.forEach(id => {
    const input = document.getElementById(id);
    const error = document.getElementById('err-' + id);
    if (input && !input.value.trim()) {
      error.textContent = 'This field is required.';
      input.classList.add('border-red-500');
      valid = false;
    } else if (input) {
      error.textContent = '';
      input.classList.remove('border-red-500');
    }
  });

  const radios = document.getElementsByName('itemMarkedNonconforming');
  const errorRadio = document.getElementById('err-itemMarkedNonconforming');
  const checked = Array.from(radios).some(radio => radio.checked);
  
  if (radios.length > 0 && !checked) {
    errorRadio.textContent = 'You must select an option.';
    valid = false;
  } else if (errorRadio) {
    errorRadio.textContent = '';
  }

  return valid;
}

function validateEngineeringForm() {
  let valid = true;
  const requiredFields = ['engineerName', 'engineerDate', 'engineeringDept', 'disposition'];

  requiredFields.forEach(id => {
    const input = document.getElementById(id);
    const error = document.getElementById('err-' + id);
    if (input && !input.value.trim()) {
      error.textContent = 'This field is required.';
      input.classList.add('border-red-500');
      valid = false;
    } else if (input) {
      error.textContent = '';
      input.classList.remove('border-red-500');
    }
  });

  const reviewRadios = document.getElementsByName('reviewByEngineering');
  const errorReview = document.getElementById('err-reviewByEngineering');
  const reviewChecked = Array.from(reviewRadios).some(radio => radio.checked);
  
  if (reviewRadios.length > 0 && !reviewChecked) {
    errorReview.textContent = 'You must select a review option.';
    valid = false;
  } else if (errorReview) {
    errorReview.textContent = '';
  }

  return valid;
}

// ========================================================
// ======== Form Submission Handlers
// ========================================================
const ncrForm = document.getElementById('ncrForm');
if (ncrForm) {
  ncrForm.addEventListener('submit', function (event) {
    event.preventDefault();

    if (!validateForm()) {
      alert('Please complete all the required fields in the Quality Representative section.');
      return;
    }

    const ncrList = JSON.parse(localStorage.getItem('ncrList') || '[]');
    const getVal = (id) => document.getElementById(id)?.value || null;
    const getCheckedVal = (name) => document.querySelector(`input[name="${name}"]:checked`)?.value || null;

    const newNcr = {
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
      currentStage: 'Engineering',
      createdAt: new Date().toISOString(),
      
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

      purchDecision: getCheckedVal('purchDecision'),
      carRaised: getCheckedVal('carRaised'),
      carNumber: getVal('carNumber'),
      followUpRequired: getCheckedVal('followUpRequired'),
      followUpDetails: getVal('followUpDetails'),
      operationsManager: getVal('operationsManager'),
      operationsManagerDate: getVal('operationsManagerDate'),

      reInspectAcceptable: getCheckedVal('reInspectAcceptable'),
      newNcrNumber: getVal('newNcrNumber'),
      inspectorName: getVal('inspectorName'),
      inspectorDate: getVal('inspectorDate'),
      ncrClosed: getCheckedVal('ncrClosed'),
      qualityDepartment: getVal('qualityDepartment'),
      qualityDepartmentDate: getVal('qualityDepartmentDate')
    };

    ncrList.push(newNcr);
    localStorage.setItem('ncrList', JSON.stringify(ncrList));
    
    alert('NCR created successfully ✅');
    window.location.href = '../Sub-Pages/engineering.html';
  });
}

const engineeringForm = document.getElementById('engineeringForm');
if (engineeringForm) {
  engineeringForm.addEventListener('submit', function (event) {
    event.preventDefault();

    if (!validateEngineeringForm()) {
      alert('Please complete all the required fields in the Engineering section.');
      return;
    }

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

    console.log('Engineering data saved:', engineeringData);
    alert('Engineering section saved successfully ✅');
    window.location.href = '../Sub-Pages/purchasing.html';
  });
}

// ========================================================
// ======== Event Listeners and Initialization
// ========================================================
document.addEventListener('DOMContentLoaded', () => {
  // NCR Number Generation
  const ncrInput = document.getElementById('ncrNumber');
  if (ncrInput && !ncrInput.value) {
    ncrInput.value = generateNcrNumber();
    ncrInput.readOnly = true;
  }

  // Role Management
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
    disableFieldsByRole(role);
  }

  // Real-time Validation - Quality Rep
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

  // Real-time Validation - Engineering
  const engineeringRequiredFields = ['engineerName', 'engineerDate', 'engineeringDept', 'disposition'];
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

  // Radio Button Validation
  const radios = document.getElementsByName('itemMarkedNonconforming');
  const errorRadio = document.getElementById('err-itemMarkedNonconforming');
  if (radios.length > 0 && errorRadio) {
    radios.forEach(radio => {
      radio.addEventListener('change', () => errorRadio.textContent = '');
    });
  }

  const reviewRadios = document.getElementsByName('reviewByEngineering');
  const errorReview = document.getElementById('err-reviewByEngineering');
  if (reviewRadios.length > 0 && errorReview) {
    reviewRadios.forEach(radio => {
      radio.addEventListener('change', () => errorReview.textContent = '');
    });
  }

  // Cancel Buttons
  const cancelBtn = document.getElementById('btnValidate');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
        window.location.href = '../Sidebar/create-ncr.html';
      }
    });
  }

  const engCancelBtn = document.getElementById('btnCancel');
  if (engCancelBtn) {
    engCancelBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
        window.location.href = '../Sidebar/create-ncr.html';
      }
    });
  }
});