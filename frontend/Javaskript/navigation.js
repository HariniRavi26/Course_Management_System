/* =========================================================
   DYNAMIC NAVIGATION
   Renders the shared <nav id="navbar"> based on who is
   actually logged in (from data.js), highlights the current
   page, and guards pages that require a session.
   Requires data.js to be loaded first.
========================================================= */

function guestNavLinks(page) {
  return `
    <a href="index.html" class="${page === 'home' ? 'active' : ''}">Home</a>
    <a href="browse-courses.html" class="${page === 'browse' ? 'active' : ''}">Courses</a>
    <a href="login.html" class="btn btn-secondary btn-sm">Login</a>
    <a href="register.html" class="btn btn-primary btn-sm">Sign Up</a>
  `;
}
function studentNavLinks(page, unread) {
  return `
    <a href="student-dashboard.html" class="${page === 'dashboard' ? 'active' : ''}">Dashboard</a>
    <a href="browse-courses.html" class="${page === 'browse' ? 'active' : ''}">Browse Courses</a>
    <a href="my-courses.html" class="${page === 'mycourses' ? 'active' : ''}">My Courses</a>
    <a href="notifications.html" class="${page === 'notif' ? 'active' : ''}">Notifications${unread ? `<span class="badge-count">${unread}</span>` : ''}</a>
  `;
}
function adminNavLinks(page, unread) {
  return `
    <a href="admin-dashboard.html" class="${page === 'dashboard' ? 'active' : ''}">Dashboard</a>
    <a href="browse-courses.html" class="${page === 'browse' ? 'active' : ''}">Browse Courses</a>
    <a href="courses.html" class="${page === 'manage' ? 'active' : ''}">Manage Courses</a>
    <a href="notifications.html" class="${page === 'notif' ? 'active' : ''}">Notifications${unread ? `<span class="badge-count">${unread}</span>` : ''}</a>
  `;
}

function renderNavbar() {
  const el = document.getElementById('navbar');
  if (!el) return;

  const page = document.body.dataset.page || '';
  const user = getCurrentUser();
  const homeHref = !user ? 'index.html' : (user.role === 'admin' ? 'admin-dashboard.html' : 'student-dashboard.html');

  let linksHtml;
  if (!user) {
    linksHtml = guestNavLinks(page);
  } else {
    const unread = getUnreadCount(user.email);
    linksHtml = user.role === 'admin' ? adminNavLinks(page, unread) : studentNavLinks(page, unread);
  }

  const userChip = user ? `
    <div class="user-chip">
      <span>👤 ${user.name}</span>
      <a href="#" onclick="logout();return false;" style="color:var(--danger);font-weight:600;">Logout</a>
    </div>` : '';

  el.innerHTML = `
    <div class="brand"><a href="${homeHref}">📚 LMS Portal</a></div>
    <div class="nav-links">
      ${linksHtml}
      ${userChip}
    </div>
  `;
}

/* data-auth on <body>: "public", "student", or "admin" */
function guardPage() {
  const required = document.body.dataset.auth || 'public';
  if (required === 'public') return;

  const user = getCurrentUser();
  if (!user) { window.location.href = 'login.html'; return; }
  if (required === 'admin' && user.role !== 'admin') { window.location.href = 'student-dashboard.html'; }
}

document.addEventListener('DOMContentLoaded', function () {
  guardPage();
  renderNavbar();
});
