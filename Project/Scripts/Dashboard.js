document.getElementById("toggleNCRList").addEventListener("click", function() {
  const extraRows = document.getElementById("extraNCRs");
  const isHidden = extraRows.classList.contains("hidden");
  extraRows.classList.toggle("hidden");
  this.textContent = isHidden ? "Hide NCRs ▲" : "View All NCRs ▼";
});
