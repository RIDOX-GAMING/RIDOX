/* =========================================================
   RIDOX — modal.js
   Order-code modal: open/close, code generation display,
   copy button, custom-package note, focus trap (a11y)
   ========================================================= */

(function () {
  'use strict';

  let overlay, modal, codeEl, copyBtn, customExtra, closeBtn;
  let lastFocusedEl = null;

  function cacheEls() {
    overlay = document.getElementById('modalOverlay');
    modal = overlay ? overlay.querySelector('.modal') : null;
    codeEl = document.getElementById('genCode');
    copyBtn = document.getElementById('copyBtn');
    customExtra = document.getElementById('customExtra');
    closeBtn = document.getElementById('modalCloseBtn');
  }

  /**
   * Opens the order modal.
   * @param {string} kind - 'steam' | 'silver' | 'gold' | 'custom'
   */
  function openCodeModal(kind) {
    if (!overlay) return;
    const code = window.RIDOX.generateOrderCode();
    codeEl.textContent = code;
    customExtra.style.display = kind === 'custom' ? 'block' : 'none';

    lastFocusedEl = document.activeElement;
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    overlay.setAttribute('aria-hidden', 'false');

    // Move focus into the modal for accessibility
    requestAnimationFrame(() => {
      closeBtn && closeBtn.focus();
    });
  }

  function closeCodeModal() {
    if (!overlay) return;
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    overlay.setAttribute('aria-hidden', 'true');
    if (lastFocusedEl && typeof lastFocusedEl.focus === 'function') {
      lastFocusedEl.focus();
    }
  }

  function copyCode(e) {
    const code = codeEl.textContent;
    const btn = e.currentTarget;
    const original = btn.textContent;
    window.RIDOX.copyToClipboard(code, () => {
      btn.textContent = 'کپی شد ✓';
      setTimeout(() => { btn.textContent = original; }, 1500);
    });
  }

  /* -------------------------------------------------------
     Focus trap — keeps Tab navigation inside the open modal
  ------------------------------------------------------- */
  function trapFocus(e) {
    if (!overlay || !overlay.classList.contains('open')) return;
    if (e.key !== 'Tab') return;

    const focusable = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function bindEvents() {
    // Purchase buttons — data-order attribute drives the "kind"
    document.querySelectorAll('[data-order]').forEach((btn) => {
      btn.addEventListener('click', () => openCodeModal(btn.getAttribute('data-order')));
    });

    if (closeBtn) closeBtn.addEventListener('click', closeCodeModal);
    if (copyBtn) copyBtn.addEventListener('click', copyCode);

    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeCodeModal();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeCodeModal();
      trapFocus(e);
    });
  }

  // Expose for inline fallback / other modules
  window.RIDOX = window.RIDOX || {};
  window.RIDOX.openCodeModal = openCodeModal;
  window.RIDOX.closeCodeModal = closeCodeModal;

  document.addEventListener('DOMContentLoaded', () => {
    cacheEls();
    bindEvents();
  });
})();
