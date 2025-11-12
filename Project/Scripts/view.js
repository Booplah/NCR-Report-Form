// view.js – simple tabs with "Full Report" as a normal tab
console.log("view.js loaded");

(function () {
  if (!(document.body && document.body.dataset.page === "view-ncr")) return;

  const tabsContainer = document.querySelector(".section-tabs");
  const tabs = tabsContainer ? Array.from(tabsContainer.querySelectorAll(".tab-btn")) : [];
  const sections = Array.from(document.querySelectorAll(".ncr-section"));
  if (!tabsContainer || !tabs.length || !sections.length) return;

    /* helper that checks the URL */
  function getInitialTarget() {
    const params = new URLSearchParams(window.location.search);
    let target = params.get("section");  // e.g. "sec-quality"
    if (!target && window.location.hash) {
      target = window.location.hash.slice(1); // fallback to #hash
    }
     // Allow short aliases, just in case
  const alias = {
    quality: "sec-quality",
    engineering: "sec-engineering",
    purchasing: "sec-purchasing",
    all: "all"
  };
    // validate that it's an existing section ID or "all"
    const validIds = sections.map(s => s.id);
    if (target && (target === "all" || validIds.includes(target))) {
      return target;
    }
    return "all";
  }

  /*  END of inserted helper */

  function show(targetId) {
    if (targetId === "all") {
      // show every section
      sections.forEach(sec => sec.classList.add("active"));
    } else {
      // show only the selected section
      sections.forEach(sec => sec.classList.toggle("active", sec.id === targetId));
    }
    // highlight the chosen tab
    tabs.forEach(btn => btn.classList.toggle("active", btn.dataset.target === targetId));
  }

  // initialize to Full Report
   const initial = getInitialTarget();
  show(initial);

  
  // optional: scroll that section into view
  if (initial !== "all") {
    const el = document.getElementById(initial);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  /* END of changed section */

  // click to switch
  tabsContainer.addEventListener("click", (e) => {
    const btn = e.target.closest(".tab-btn");
    if (!btn) return;
    show(btn.dataset.target);
  });

  // --- PDF download: export the entire report (all sections) ---
  (function () {
  if (!(document.body && document.body.dataset.page === "view-ncr")) return;

  const btn = document.getElementById("btnDownloadPDF");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    const report = document.querySelector(".view-ncr-field");
    if (!report) return;

    // Clone so we can force all sections visible without touching the live page
    const cloneWrapper = document.createElement("div");
    cloneWrapper.className = "pdf-export";

    const clone = report.cloneNode(true);

    // Ensure every section is visible in the clone
    clone.querySelectorAll(".ncr-section").forEach(sec => sec.classList.add("active"));
    cloneWrapper.appendChild(clone);

    // Build a nice filename (falls back if not found)
    let fileName = "NCR_Report.pdf";
    try {
      const ncrStrong = clone.querySelector(".ncr-sum strong"); // first <strong> is NCR No in your markup
      if (ncrStrong && ncrStrong.textContent.trim()) {
        fileName = `NCR_${ncrStrong.textContent.trim()}.pdf`;
      }
    } catch { /* ignore */ }

    // Generate and download
    const opt = {
      margin:       5, // mm
      filename:     fileName,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak:    { mode: ['css', 'legacy'] }
    };

    await html2pdf().set(opt).from(cloneWrapper).save();
  });
})();
})();