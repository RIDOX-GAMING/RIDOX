/* =========================================================
   RIDOX — app.js
   Core application logic:
   - Random order code generation (business logic preserved)
   - Copy to clipboard
   - Header scroll state
   - Mobile nav toggle
   - Active nav link tracking
   ========================================================= */

(function () {
  'use strict';

  /* -------------------------------------------------------
     Order code generator
     Preserves legacy logic: 5-char alphanumeric, unambiguous charset
  ------------------------------------------------------- */
  const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
  const CODE_LENGTH = 5;

  function generateOrderCode() {
    let out = '';
    for (let i = 0; i < CODE_LENGTH; i++) {
      out += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
    }
    return out;
  }

  /* -------------------------------------------------------
     Clipboard copy (with legacy execCommand fallback)
  ------------------------------------------------------- */
  function copyToClipboard(text, onDone) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(onDone).catch(function () {
        fallbackCopy(text, onDone);
      });
    } else {
      fallbackCopy(text, onDone);
    }
  }

  function fallbackCopy(text, cb) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try { document.execCommand('copy'); } catch (e) { /* no-op */ }
    document.body.removeChild(ta);
    cb();
  }

  /* -------------------------------------------------------
     Header: scrolled state
  ------------------------------------------------------- */
  function initHeaderScroll() {
    const header = document.querySelector('header');
    if (!header) return;
    const onScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 12);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* -------------------------------------------------------
     Mobile nav toggle
  ------------------------------------------------------- */
  function initMobileNav() {
    const toggle = document.querySelector('.nav-toggle');
    const links = document.querySelector('.nav-links');
    if (!toggle || !links) return;

    toggle.addEventListener('click', () => {
      const isOpen = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    links.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* -------------------------------------------------------
     Active nav link tracking via IntersectionObserver
  ------------------------------------------------------- */
  function initActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');
    if (!sections.length || !navLinks.length) return;

    const map = {};
    navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) map[href.slice(1)] = link;
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.id;
          const link = map[id];
          if (!link) return;
          if (entry.isIntersecting) {
            navLinks.forEach((l) => l.classList.remove('active'));
            link.classList.add('active');
          }
        });
      },
      { rootMargin: '-40% 0px -50% 0px', threshold: 0 }
    );

    sections.forEach((s) => observer.observe(s));
  }

  /* -------------------------------------------------------
     Electron platform detection (adds a body class so CSS
     can hide/show electron-only chrome, e.g. custom titlebar)
  ------------------------------------------------------- */
  function initElectronDetection() {
    const isElectron = !!(window.ridoxAPI && window.ridoxAPI.isElectron);
    document.body.classList.toggle('no-electron', !isElectron);
    document.body.classList.toggle('is-electron', isElectron);
  }

  /* -------------------------------------------------------
     Titlebar window controls (only functional inside Electron)
  ------------------------------------------------------- */
  function initTitlebarControls() {
    const min = document.querySelector('.tb-min');
    const max = document.querySelector('.tb-max');
    const close = document.querySelector('.tb-close');
    if (!window.ridoxAPI) return;

    if (min) min.addEventListener('click', () => window.ridoxAPI.minimize());
    if (max) max.addEventListener('click', () => window.ridoxAPI.maximize());
    if (close) close.addEventListener('click', () => window.ridoxAPI.close());
  }

  /* -------------------------------------------------------
     Expose shared API to modal.js / animation.js
  ------------------------------------------------------- */
  window.RIDOX = window.RIDOX || {};
  window.RIDOX.generateOrderCode = generateOrderCode;
  window.RIDOX.copyToClipboard = copyToClipboard;

  /* -------------------------------------------------------
     Boot
  ------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    initElectronDetection();
    initHeaderScroll();
    initMobileNav();
    initActiveNav();
    initTitlebarControls();
  });
})();
