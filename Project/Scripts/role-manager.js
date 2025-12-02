// ==========================================
// ROLE-BASED ACCESS CONTROL SYSTEM
// ==========================================

(function() {
  'use strict';
  
  const ROLE_KEY = 'crossfire.role';
  
  // Role definitions with permissions
  const ROLES = {
    Quality: {
      displayName: 'Quality Representative',
      permissions: {
        canCreateNCR: true,
        canViewDashboard: true,
        canEditNCR: true,
        dashboardView: 'quality',
        createNCRView: 'quality',
        sidebarCreateNCR: true
      }
    },
    Engineering: {
      displayName: 'Engineer',
      permissions: {
        canCreateNCR: false,
        canViewDashboard: true,
        canEditNCR: true,
        dashboardView: 'engineering',
        createNCRView: 'engineering',
        sidebarCreateNCR: false
      }
    },
    Purchasing: {
      displayName: 'Procurement/Purchasing',
      permissions: {
        canCreateNCR: false,
        canViewDashboard: true,
        canEditNCR: true,
        dashboardView: 'purchasing',
        createNCRView: 'purchasing',
        sidebarCreateNCR: false
      }
    }
  };

  // Get current user role
  function getCurrentRole() {
    return localStorage.getItem(ROLE_KEY) || 'Quality';
  }

  // Set user role
  function setRole(role) {
    if (ROLES[role]) {
      localStorage.setItem(ROLE_KEY, role);
      return true;
    }
    return false;
  }

  // Get role permissions
  function getPermissions() {
    const role = getCurrentRole();
    return ROLES[role]?.permissions || ROLES.Quality.permissions;
  }

  // ==========================================
  // PAGE-SPECIFIC MODIFICATIONS
  // ==========================================

  // Modify Homepage (index.html)
  function modifyHomepage() {
    const perms = getPermissions();
    
    // Remove "Create NCR" links for roles without permission
    if (!perms.canCreateNCR) {
      const createLinks = document.querySelectorAll('a[href*="Create-NCR.html"]');
      createLinks.forEach(link => {
        const inSidebar = !!link.closest('.sidebar');
        if (inSidebar) {
          const container = link.closest('li');
          if (container) container.remove();
          return;
        }
        link.remove();
      });
    }
  }

  // Modify Sidebar
  function modifySidebar() {
    const perms = getPermissions();
    
    // Hide "Create NCR" link in sidebar for non-Quality roles
    const sidebarCreateLink = document.querySelector('.sidebar a[href*="Create-NCR.html"]');
    if (sidebarCreateLink && !perms.sidebarCreateNCR) {
      const listItem = sidebarCreateLink.closest('.sidebar-item');
      if (listItem) listItem.style.display = 'none';
    }
  }

  // Modify Dashboard
  function modifyDashboard() {
    const perms = getPermissions();
    const role = getCurrentRole();
    
    // Update page title
    const pageTitle = document.querySelector('.page-title');
    if (pageTitle && pageTitle.textContent === 'Dashboard') {
      pageTitle.textContent = `Dashboard - ${ROLES[role].displayName}`;
    }

    // Hide "Create New NCR" button for non-Quality roles
    const createNewBtn = document.querySelector('a[href*="Create-NCR.html"]');
    if (createNewBtn && !perms.canCreateNCR) {
      createNewBtn.style.display = 'none';
    }

    // Process table rows
    const tableRows = document.querySelectorAll('tbody tr');
    tableRows.forEach(row => {
      const sectionCell = row.querySelector('td:nth-child(3)');
      const actionCell = row.querySelector('td:last-child');
      
      if (!sectionCell || !actionCell) return;
      
      const section = sectionCell.textContent.trim();
      actionCell.innerHTML = '';
      
      // Apply role-specific logic
      if (role === 'Quality') {
        if (section === 'Quality Rep') {
          row.style.display = '';
          actionCell.innerHTML = '<a href="../NCR-Samples/View-NCR-001.html" class="btnActions">View/Edit</a>';
        } else {
          row.style.display = 'none';
        }
      } else if (role === 'Engineering') {
        if (section === 'Quality Rep') {
          row.style.display = '';
          actionCell.innerHTML = '<a href="../Sidebar/Create-NCR-Engineer.html" class="btnActions create">Create Engineer</a>';
        } else if (section === 'Engineering') {
          row.style.display = '';
          actionCell.innerHTML = '<a href="../NCR-Samples/View-NCR-001.html" class="btnActions">View/Edit</a>';
        } else {
          row.style.display = 'none';
        }
      } else if (role === 'Purchasing') {
        if (section === 'Engineering') {
          row.style.display = '';
          actionCell.innerHTML = '<a href="../Sidebar/Create-NCR-Procurement.html" class="btnActions create">Create Purchasing</a>';
        } else if (section === 'Purchasing') {
          row.style.display = '';
          actionCell.innerHTML = '<a href="../NCR-Samples/View-NCR-001.html" class="btnActions">View/Edit</a>';
        } else {
          row.style.display = 'none';
        }
      }
    });
  }

  // Modify Create NCR Page
  function modifyCreateNCR() {
    const perms = getPermissions();
    const role = getCurrentRole();
    
    // Redirect non-Quality users
    if (!perms.canCreateNCR && window.location.pathname.includes('Create-NCR.html')) {
      const isBaseCreate = !window.location.pathname.includes('Engineer') && 
                          !window.location.pathname.includes('Procurement');
      if (isBaseCreate) {
        alert(`Access Denied: ${ROLES[role].displayName} cannot create new NCRs.`);
        window.location.href = '../../Html/Sidebar/dashboard.html';
        return;
      }
    }

    // Update page title
    const pageTitle = document.querySelector('.page-title');
    if (pageTitle) pageTitle.textContent = `Create NCR - ${ROLES[role].displayName}`;

    // Show appropriate form sections
    const qualitySection = document.querySelector('[data-step-content="quality"]');
    const engineeringSection = document.querySelector('[data-step-content="engineering"]');
    const procurementSection = document.querySelector('[data-step-content="procurement"]');

    if (perms.createNCRView === 'engineering' && engineeringSection) {
      if (qualitySection) qualitySection.removeAttribute('hidden');
      engineeringSection.removeAttribute('hidden');
      if (procurementSection) procurementSection.setAttribute('hidden', '');
    } else if (perms.createNCRView === 'purchasing' && procurementSection) {
      if (qualitySection) qualitySection.removeAttribute('hidden');
      if (engineeringSection) engineeringSection.removeAttribute('hidden');
      procurementSection.removeAttribute('hidden');
    }
  }

  // Modify View/Edit NCR Pages
  function modifyViewEditNCR() {
    const perms = getPermissions();
    const role = getCurrentRole();
    
    // Update page title
    const pageTitle = document.querySelector('.page-title');
    if (pageTitle && pageTitle.textContent.includes('View NCR')) {
      pageTitle.textContent = `View NCR - ${ROLES[role].displayName}`;
    } else if (pageTitle && pageTitle.textContent.includes('Edit NCR')) {
      pageTitle.textContent = `Edit NCR - ${ROLES[role].displayName}`;
    }

    // Show/hide action buttons
    const closeBtn = document.getElementById('btnCloseNCR');
    if (closeBtn && role !== 'Quality') closeBtn.style.display = 'none';

    // Filter visible sections
    const sections = document.querySelectorAll('.ncr-section');
    sections.forEach(section => {
      const sectionId = section.id;
      if (role === 'Quality') return;
      
      if (role === 'Engineering') {
        if (sectionId === 'sec-purchasing' || sectionId === 'sec-final') section.style.display = 'none';
      }
      
      if (role === 'Purchasing') {
        if (sectionId === 'sec-final') section.style.display = 'none';
      }
    });
  }

  // Update account label
  function updateAccountLabel() {
    const role = getCurrentRole();
    const accountLabels = document.querySelectorAll('.account-label');
    accountLabels.forEach(label => {
      label.textContent = ROLES[role].displayName;
    });
  }

  // ==========================================
  // INITIALIZATION
  // ==========================================
  function init() {
    const role = getCurrentRole();
    console.log('Current Role:', role, 'Permissions:', getPermissions());

    updateAccountLabel();

    const path = window.location.pathname;
    
    if (path.includes('index.html')) {
      modifyHomepage();
      modifySidebar();
    } else if (path.includes('dashboard.html') || path.includes('Dashboard.html')) {
      modifyDashboard();
      modifySidebar();
    } else if (path.includes('Create-NCR')) {
      modifyCreateNCR();
      modifySidebar();
    } else if (path.includes('View-NCR') || path.includes('Edit-NCR')) {
      modifyViewEditNCR();
      modifySidebar();
    } else {
      modifySidebar();
    }
  }

  // Run on DOM load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Export functions for global use
  window.RoleManager = {
    getCurrentRole,
    setRole,
    getPermissions,
    ROLES
  };
})();