// JS for Create Page (made by: Alex)
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  if (!form) return;

  form.setAttribute("novalidate", "");

  const fields = {
    NCRID: form.querySelector('[name="NCRID"]'),
    QualityDep: form.querySelector('[name="QualityDep"]'),
    SupplierName: form.querySelector('[name="SupplierName"]'),
    SupplierOrReclnsp: form.querySelector('[name="SupplierOrReclnsp"]'),
    WIP: form.querySelector('[name="WIP"]'),
    POOrProd: form.querySelector('[name="POOrProd"]'),
    SalesOrder: form.querySelector('[name="SalesOrder"]'),
    QuantityRec: form.querySelector('[name="QuantityRec"]'),
    QuantityDef: form.querySelector('[name="QuantityDef"]'),
    ItemDesc: form.querySelector('[name="ItemDesc"]'),
    DefectDesc: form.querySelector('[name="DefectDesc"]'),
    Nonconformedltem: form.querySelector('[name="Nonconformedltem"]'), // note the lowercase L in "ltem"
    ToDispos: form.querySelector('[name="ToDispos"]'),
    QRName: form.querySelector('[name="QRName"]'),
    Date: form.querySelector('[name="Date"]'),
  };

  // Submit: validate and show a single popup with all issues
  form.addEventListener("submit", (e) => {
    const { errors } = validateForm(fields);
    if (errors.length) {
      e.preventDefault();

      const message = [
        "Please fix the following before submitting:",
        "",
        ...errors.map((er, i) => `${i + 1}. ${er.msg}`)
      ].join("\n");

      alert(message);
      // focus the first invalid field
      errors[0].el?.focus({ preventScroll: false });
    } else {
      // Optional success confirmation (comment out if not wanted)
      // if (!confirm("Submit NCR now?")) e.preventDefault();
    }
  });

  // Optional: warn live if a key cross-field rule is broken
  // (Quantity Defective > Quantity Received)
  const qRec = fields.QuantityRec;
  const qDef = fields.QuantityDef;
  const liveCrossCheck = () => {
    const rec = num(qRec?.value);
    const def = num(qDef?.value);
    if (!isNaN(rec) && !isNaN(def) && def > rec) {
      alert("Quantity Defective cannot exceed Quantity Received.");
      qDef?.focus();
    }
  };
  qRec?.addEventListener("change", liveCrossCheck);
  qDef?.addEventListener("change", liveCrossCheck);

  // Cancel button: confirm + reset
  const btnCancel = form.querySelector('button[type="button"]');
  if (btnCancel) {
    btnCancel.addEventListener("click", () => {
      if (confirm("Clear all fields?")) form.reset();
    });
  }
});

// Validation events for all the fields of the form
function validateForm(fields) {
  const order = [
    "QualityDep",
    "SupplierName",
    "SupplierOrReclnsp",
    "POOrProd",
    "QuantityRec",
    "QuantityDef",
    "ItemDesc",
    "DefectDesc",
    "Nonconformedltem",
    "ToDispos",
    "QRName",
    "Date",
  ];

  const errors = [];

  for (const key of order) {
    const el = fields[key];
    if (!el) continue;
    const msg = validateField(el, fields);
    if (msg) errors.push({ el, msg });
  }

  return { errors };
}

function validateField(el, fields) {
  const name = el.getAttribute("name");
  const imputt = (el.value ?? "").trim();

  const isEmpty = (v) => v === "";
  const n = num;

  switch (name) {
    case "QualityDep":
      if (isEmpty(imputt)) return "Select a Quality Department.";
      break;

    case "SupplierName":
      if (isEmpty(imputt)) return "Supplier Name is required.";
      if (val.length < 2) return "Supplier Name must be at least 2 characters.";
      break;

    case "SupplierOrReclnsp":
      if (isEmpty(imputt)) return "Select Supplier or Receiving Inspection.";
      break;

    case "POOrProd":
      if (isEmpty(imputt)) return "PO or Product Number is required.";
      break;

    case "QuantityRec": {
      const v = n(imputt);
      if (isNaN(v)) return "Enter Quantity Received (number).";
      if (v < 0) return "Quantity Received must be ≥ 0.";
      break;
    }

    case "QuantityDef": {
      const def = n(imputt);
      const rec = n(fields.QuantityRec?.value);
      if (isNaN(def)) return "Enter Quantity Defective (number, 0 if none).";
      if (def < 0) return "Quantity Defective must be ≥ 0.";
      if (!isNaN(rec) && def > rec) return "Quantity Defective cannot exceed Quantity Received.";
      break;
    }

    case "ItemDesc":
      if (isEmpty(imputt)) return "Item Description is required.";
      break;

    case "DefectDesc": {
      const def = n(fields.QuantityDef?.value);
      if (!isNaN(def) && def > 0 && isEmpty(imputt))
        return "Provide a Defect Description when defective quantity > 0.";
      break;
    }

    case "Nonconformedltem":
      if (isEmpty(imputt)) return "Non-conformed Item is required.";
      break;

    case "ToDispos":
      if (isEmpty(imputt)) return "Select a Disposition.";
      break;

    case "QRName":
      if (isEmpty(imputt)) return "Quality Representative Name is required.";
      break;

    case "Date":
      if (isEmpty(imputt)) return "Select a Date.";
      break;
  }

  return "";
}

function num(v) {
  return v === "" || v == null ? NaN : Number(v);
}
