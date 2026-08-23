/* =========================================================
   UI COMPONENT MODULES   (NEW FILE)
   Does NOT modify any existing file. Two small, reusable
   JavaScript modules built with the Module Pattern (IIFE),
   usable from any page that includes this script:

     ToastModule.show("Saved!", "success")
     ModalModule.open("Title", "<p>Body HTML</p>")
========================================================= */

const ToastModule = (function () {
  function ensureContainer() {
    let c = document.getElementById('toastContainer');
    if (!c) {
      c = document.createElement('div');
      c.id = 'toastContainer';
      c.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:10px;';
      document.body.appendChild(c);
    }
    return c;
  }

  function show(message, type) {
    type = type || 'info';
    const colors = { success: '#16a34a', error: '#dc2626', info: '#4f46e5' };
    const el = document.createElement('div');
    el.textContent = message;
    el.style.cssText = 'background:' + (colors[type] || colors.info) +
      ';color:#fff;padding:12px 18px;border-radius:8px;box-shadow:0 6px 16px rgba(0,0,0,.15);' +
      'font-size:14px;min-width:220px;font-family:Segoe UI,Arial,sans-serif;';
    ensureContainer().appendChild(el);
    setTimeout(function () { el.remove(); }, 3000);
  }

  return { show: show };
})();

const ModalModule = (function () {
  let overlay = null;

  function open(title, bodyHtml) {
    close();
    overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;' +
      'align-items:center;justify-content:center;z-index:9998;';
    overlay.innerHTML =
      '<div style="background:#fff;border-radius:10px;padding:24px;max-width:420px;width:90%;font-family:Segoe UI,Arial,sans-serif;">' +
      '  <h3 style="margin-bottom:12px;">' + title + '</h3>' +
      '  <div style="margin-bottom:16px;color:#555;">' + bodyHtml + '</div>' +
      '  <button id="modalCloseBtn" style="background:#4f46e5;color:#fff;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;">Close</button>' +
      '</div>';
    document.body.appendChild(overlay);
    document.getElementById('modalCloseBtn').addEventListener('click', close);
  }

  function close() {
    if (overlay) { overlay.remove(); overlay = null; }
  }

  return { open: open, close: close };
})();

window.ToastModule = ToastModule;
window.ModalModule = ModalModule;
