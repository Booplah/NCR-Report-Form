// Scripts/role-manager.js
(function () {
  'use strict';

  const ROLE_KEY = 'crossfire.role';

  const ROLES = {
    Quality: { displayName: 'Quality Representative', canCreate: true },
    Engineering: { displayName: 'Engineer', canCreate: false },
    Purchasing: { displayName: 'Procurement / Purchasing', canCreate: false }
  };

  function getCurrentRole() {
    return localStorage.getItem(ROLE_KEY) || 'Quality';
  }

  function updateAccountLabel() {
    const role = getCurrentRole();
    document.querySelectorAll('.account-label, .account-name').forEach(el => {
      el.textContent = ROLES[role].displayName;
    });
  }

  function applyRoleVisibility() {
    const role = getCurrentRole();

    // Hide "Create NCR" in sidebar for non-QA
    document.querySelectorAll('.menu-link').forEach(link => {
      if (link.textContent.trim().includes('Create NCR') && role !== 'Quality') {
        link.closest('li').style.display = 'none';
      }
    });

    // View/Edit pages: Show only allowed tabs & sections
    if (document.body.dataset.page === 'view-ncr' || /edit-ncr/i.test(location.pathname)) {
      const allowed = {
        Quality: ['sec-quality'],
        Engineering: ['sec-quality', 'sec-engineering'],
        Purchasing: ['sec-quality', 'sec-engineering', 'sec-purchasing', 'sec-final']
      }[role];

      document.querySelectorAll('.ncr-section, .progress-tab').forEach(el => {
        const target = el.dataset.target || el.id;
        if (target && !allowed.includes(target)) {
          el.style.display = 'none';
        }
      });

      // Lock non-editable fields
      document.querySelectorAll('input, select, textarea').forEach(input => {
        const section = input.closest('.ncr-section');
        if (section && !allowed.includes(section.id)) {
          input.disabled = true;
          input.classList.add('bg-gray-100', 'cursor-not-allowed');
        }
      });
    }
  }

  function init() {
    updateAccountLabel();
    applyRoleVisibility();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.RoleManager = { getCurrentRole, ROLES };
})();