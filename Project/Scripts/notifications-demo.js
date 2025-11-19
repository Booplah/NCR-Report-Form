
(function () {
  const STORAGE_KEY = 'crossfire.notifications';
  const ROLE_KEY = 'crossfire.role';

  // ---------- helpers ----------
  function now() { return Date.now(); }

  function formatRelativeTime(ts) {
    const diffMs = now() - ts;
    const sec = Math.floor(diffMs / 1000);
    const min = Math.floor(sec / 60);
    const hr  = Math.floor(min / 60);
    const day = Math.floor(hr / 24);

    if (sec < 10) return 'just now';
    if (sec < 60) return `${sec}s ago`;
    if (min < 60) return `${min}m ago`;
    if (hr  < 24) return `${hr}h ago`;
    if (day === 1) return 'Yesterday';

    // fallback to short date (e.g., "Nov 2")
    const d = new Date(ts);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  function getRole() {
    return localStorage.getItem(ROLE_KEY) || 'Engineering'; // default for demo
  }

  function loadAll() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  function saveAll(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  // ---------- seed data (first run only) ----------
  function seedIfEmpty() {
    const existing = loadAll();
    if (existing) return existing;

    const t = now();
    const data = {
      notifications: [
        // Engineering audience
        {
          id: 'n-001',
          ncrId: 123,
          type: 'QUALITY_DONE',
          title: 'New NCR - Quality Inspection completed',
          message: 'NCR #123 is ready for Engineering review',
          createdAt: t - 1000 * 60 * 6,   // 6m ago
          read: false,
          url: 'view.html?section=sec-quality',
          audience: 'Engineering'
        },
        {
          id: 'n-002',
          ncrId: 118,
          type: 'QUALITY_DONE',
          title: 'New NCR - Quality Inspection completed',
          message: 'NCR #118 is ready for Engineering review',
          createdAt: t - 1000 * 60 * 60 * 2, // 2h ago
          read: false,
          url: 'view.html?section=sec-quality',
          audience: 'Engineering'
        },

        // Quality audience
        {
          id: 'n-003',
          ncrId: 130,
          type: 'EMAIL_SENT_TO_ENGINEERING',
          title: 'Email sent to Engineering',
          message: 'NCR #130 has been created and emailed to Engineering',
          createdAt: t - 1000 * 60 * 42, // 42m ago
          read: false,
          url: 'view.html',
          audience: 'Quality'
        },
        {
          id: 'n-004',
          ncrId: 110,
          type: 'EMAIL_SENT_TO_ENGINEERING',
          title: 'Email sent to Engineering',
          message: 'NCR #110 was sent to Engineering',
          createdAt: t - 1000 * 60 * 60 * 26, // ~1 day ago
          read: true,
          url: 'view.html?section=sec-quality',
          audience: 'Quality'
        },
      ]
    };
    saveAll(data);
    return data;
  }

  function getForRole(role, all) {
    return all.notifications.filter(n => n.audience === role || n.audience === 'All');
  }

  function unreadCount(list) {
    return list.filter(n => !n.read).length;
  }

  // ---------- rendering / interactions ----------
  // expects: a bell button with id="notif-bell", a badge span with id="notif-badge",
  // and a dropdown container with id="notif-dropdown"
  function render(role) {
    const data = seedIfEmpty();
    const items = getForRole(role, data);

    // badge
    const badgeEl = document.getElementById('notif-badge');
    if (badgeEl) {
      const count = unreadCount(items);
      badgeEl.textContent = count > 99 ? '99+' : String(count);
      badgeEl.style.display = count > 0 ? 'inline-flex' : 'none';
    }

    // list
    const listEl = document.getElementById('notif-list');
    const emptyEl = document.getElementById('notif-empty');
    if (!listEl || !emptyEl) return;

    listEl.innerHTML = '';
    if (items.length === 0) {
      emptyEl.style.display = 'block';
    } else {
      emptyEl.style.display = 'none';
      items
        .sort((a, b) => b.createdAt - a.createdAt)
        .forEach(n => {
          const li = document.createElement('li');
          li.className = 'notif-item ' + (n.read ? 'read' : 'unread');
          li.innerHTML = `
            <a href="${n.url}" class="notif-link" data-id="${n.id}">
    <div class="notif-main">
      <span class="notif-type">${iconFor(n.type)}</span>
      <div class="notif-title">${n.title}</div>
      <div class="notif-meta">
        <span class="notif-time">${formatRelativeTime(n.createdAt)}</span>
        ${n.read ? '' : '<span class="notif-dot"></span>'}
      </div>
    </div>
    ${n.message ? `<div class="notif-msg">${n.message}</div>` : ''}
  </a>
          `;
          listEl.appendChild(li);
        });
    }

    // click → mark read + navigate
    listEl.querySelectorAll('.notif-link').forEach(a => {
      a.addEventListener('click', (e) => {
        // allow normal navigation after we mark as read
        const id = a.getAttribute('data-id');
        markRead(id);
      });
    });

    // mark all read
    const markAllBtn = document.getElementById('notif-markall');
    if (markAllBtn) {
      markAllBtn.onclick = () => {
        markAllReadForRole(role);
        render(role);
      };
    }
    lucide.createIcons();

  }

  function iconFor(type) {
    switch (type) {
      case 'QUALITY_DONE': return '<i data-lucide="check-circle"></i>';
      case 'EMAIL_SENT_TO_ENGINEERING': return '<i data-lucide="send"></i>'; 
      default: return '<i data-lucide="bell"></i>';
    }
  }

  function markRead(id) {
    const all = loadAll() || seedIfEmpty();
    const idx = all.notifications.findIndex(n => n.id === id);
    if (idx >= 0) {
      all.notifications[idx].read = true;
      saveAll(all);
    }
  }

  function markAllReadForRole(role) {
    const all = loadAll() || seedIfEmpty();
    all.notifications.forEach(n => {
      if (n.audience === role || n.audience === 'All') n.read = true;
    });
    saveAll(all);
  }

  // ---------- dropdown open/close wiring ----------
  function setupDropdown() {
    const bell = document.getElementById('notif-bell');
    const panel = document.getElementById('notif-dropdown');

    if (!bell || !panel) return;

    function open() {
      panel.classList.add('open');
      bell.setAttribute('aria-expanded', 'true');
    }
    function close() {
      panel.classList.remove('open');
      bell.setAttribute('aria-expanded', 'false');
    }

    bell.addEventListener('click', (e) => {
      e.stopPropagation();
      panel.classList.toggle('open');
      const role = getRole();
      render(role); // re-render on open so timestamps feel fresh
    });

    document.addEventListener('click', (e) => {
      if (!panel.contains(e.target) && e.target !== bell) close();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });
  }

  // ---------- init ----------
  document.addEventListener('DOMContentLoaded', () => {
    seedIfEmpty();
    setupDropdown();
    const role = getRole();
    render(role);

    // Optional: show current role somewhere in header
    const roleEl = document.getElementById('current-role');
    if (roleEl) roleEl.textContent = role;
  });
})();
