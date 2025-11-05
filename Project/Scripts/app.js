// Quality Rep Form Validation
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