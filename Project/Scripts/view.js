// view.js – simple tabs with "Full Report" as a normal tab
console.log("view.js loaded");

(function () {
  if (!(document.body && document.body.dataset.page === "view-ncr")) return;

  const tabs = Array.from(document.querySelectorAll(".progress-tab[data-target]"));
  const sections = Array.from(document.querySelectorAll(".ncr-section"));
  const ACTIVE_TAB_CLASSES = "border-b-2 border-blue-600 px-4 py-2 text-md font-medium text-blue-600 transition-colors hover:text-blue-700";
  const INACTIVE_TAB_CLASSES = "border-b-2 border-transparent px-4 py-2 text-md font-medium text-gray-600 transition-colors hover:text-gray-700";

  const alias = {
    quality: "sec-quality",
    engineering: "sec-engineering",
    procurement: "sec-purchasing",
    purchasing: "sec-purchasing",
    final: "sec-final",
    "final-review": "sec-final",
    all: "all"
  };

  function normalizeTarget(raw) {
    if (!raw) return null;
    const trimmed = raw.trim().toLowerCase();
    const candidate = trimmed.startsWith("sec-")
      ? trimmed
      : alias[trimmed] || null;
    if (!candidate) return null;
    return sections.some(sec => sec.id === candidate) ? candidate : null;
  }

  function getInitialTarget() {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = normalizeTarget(params.get("section"));
    if (fromQuery) return fromQuery;

    const fromHash = normalizeTarget(window.location.hash?.slice(1));
    if (fromHash) return fromHash;

    return tabs[0]?.dataset.target || sections[0]?.id || null;
  }

  function setActiveTab(targetId) {
    tabs.forEach((tab) => {
      const isActive = tab.dataset.target === targetId;
      tab.setAttribute("aria-selected", isActive);
      tab.className = `progress-tab ${isActive ? ACTIVE_TAB_CLASSES : INACTIVE_TAB_CLASSES}`;
    });
  }

  function showSection(targetId) {
    sections.forEach((section) => {
      const showAll = targetId === "all";
      const matches = showAll || section.id === targetId;
      section.classList.toggle("active", matches);
      section.toggleAttribute("hidden", !matches);
    });
  }

  function updateView(targetId) {
    if (!targetId) return;
    showSection(targetId);
    setActiveTab(targetId);
  }

  if (tabs.length && sections.length) {
    const initialTarget = getInitialTarget();
    updateView(initialTarget);

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        if (!tab.dataset.target) return;
        updateView(tab.dataset.target);
      });
    });
  }

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
