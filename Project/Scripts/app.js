// JS for Create Page (made by: Alex)


            // Create NCR //
// ======== Function to obtain ncr
/*function getExistingNcrCount() {
  const existing = JSON.parse(localStorage.getItem('ncrList') || '[]');
  return existing.length;
}*/

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
  ncrInput.value = generateNcrNumber();
  ncrInput.readOnly = true;
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
    'defectDescription',
    'reportedBy',
    
  ];

  requiredFields.forEach((id) => {
    const input = document.getElementById(id);
    const error = document.getElementById('err-' + id);

    if (!input.value.trim()) {
      error.textContent = 'This field is required.';
      valid = false;
    } else {
      error.textContent = '';
    }
  });

  // Validar radio buttons (Item marcado como No conforme)
  const radios = document.getElementsByName('itemMarkedNonconforming');
  const errorRadio = document.getElementById('err-itemMarkedNonconforming');
  const checked = Array.from(radios).some(radio => radio.checked);

  if (!checked) {
    errorRadio.textContent = 'You must select a option.';
    valid = false;
  } else {
    errorRadio.textContent = '';
  }

  return valid;
}

// ======== Save NCR (when is checked by the validation process)
document.getElementById('ncrForm').addEventListener('submit', function (event) {
  event.preventDefault(); // Prevenir envío por defecto

  if (!validateForm()) {
    alert('Please complete all the required fields');
    return;
  }

  const ncrList = JSON.parse(localStorage.getItem('ncrList') || '[]');

  const newNcr = {
    number: document.getElementById('ncrNumber').value,
    date: document.getElementById('dateReported').value,
    process: document.getElementById('processApplicable').value,
    supplier: document.getElementById('supplierName').value,
    poOrProd: document.getElementById('poOrProdNo').value,
    salesOrder: document.getElementById('salesOrderNo').value,
    itemDesc: document.getElementById('itemDescriptionSAP').value,
    qtyReceived: document.getElementById('qtyReceived').value,
    qtyDefective: document.getElementById('qtyDefective').value,
    defect: document.getElementById('defectDescription').value,
    marked: document.querySelector('input[name="itemMarkedNonconforming"]:checked').value,
    reportedBy: document.getElementById('reportedBy').value,
    status: document.getElementById('status').value,
    createdAt: new Date().toISOString()
  };

  ncrList.push(newNcr);
  localStorage.setItem('ncrList', JSON.stringify(ncrList));

  alert('NCR guardado correctamente ✅');
  this.reset();

  // Generate a new ncr number
  document.getElementById('ncrNumber').value = generateNcrNumber();
});

// ======== Cancel Button: limpia todo y genera nuevo NCR Number
document.getElementById('btnCancel').addEventListener('click', () => {
  document.getElementById('ncrForm').reset();
  document.getElementById('ncrNumber').value = generateNcrNumber();
});
