/* =========================================================
   RIDOX — animation.js
   Orchestrates: page loader, scroll reveals, mouse light,
   button ripple, parallax orbs, smooth anchor scrolling
   ========================================================= */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -------------------------------------------------------
     Page loader — hides once DOM + a minimum dwell time pass
  ------------------------------------------------------- */
  function initLoader() {
    const loader = document.querySelector('.loader');
    if (!loader) return;
    const MIN_DWELL = 550;
    const start = Date.now();

    const hide = () => {
      const elapsed = Date.now() - start;
      const wait = Math.max(0, MIN_DWELL - elapsed);
      setTimeout(() => {
        loader.classList.add('hide');
        document.body.classList.remove('pre-load');
        setTimeout(() => loader.remove(), 900);
      }, wait);
    };

    if (document.readyState === 'complete') {
      hide();
    } else {
      window.addEventListener('load', hide);
    }
  }

  /* -------------------------------------------------------
     Scroll reveal — tags elements with .reveal / .reveal-scale
     / .reveal-stagger automatically, then observes them
  ------------------------------------------------------- */
  function initScrollReveal() {
    if (prefersReducedMotion) return;

    const autoTargets = [
      ['.sec-head', 'reveal'],
      ['.info-split', 'reveal'],
      ['.row-list', 'reveal'],
      ['.note-box', 'reveal'],
      ['.stat-panel', 'reveal-scale'],
      ['footer .footer-row', 'reveal'],
    ];

    autoTargets.forEach(([selector, cls]) => {
      document.querySelectorAll(selector).forEach((el) => el.classList.add(cls));
    });

    const revealEls = document.querySelectorAll('.reveal, .reveal-scale, .reveal-stagger');
    if (!revealEls.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );

    revealEls.forEach((el) => observer.observe(el));
  }

  /* -------------------------------------------------------
     Mouse light — soft radial glow following the cursor
  ------------------------------------------------------- */
  function initMouseLight() {
    if (prefersReducedMotion) return;
    const light = document.querySelector('.mouse-light');
    if (!light) return;

    let raf = null;
    window.addEventListener('mousemove', (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        light.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
        raf = null;
      });
    });
  }

  /* -------------------------------------------------------
     Button ripple effect
  ------------------------------------------------------- */
  function initRipple() {
    document.querySelectorAll('.btn').forEach((btn) => {
      btn.addEventListener('click', function (e) {
        const rect = btn.getBoundingClientRect();
        const ripple = document.createElement('span');
        const size = Math.max(rect.width, rect.height);
        ripple.className = 'ripple';
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
        ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
        btn.appendChild(ripple);
        setTimeout(() => ripple.remove(), 650);
      });
    });
  }

  /* -------------------------------------------------------
     Parallax orbs on scroll (subtle depth)
  ------------------------------------------------------- */
  function initParallax() {
    if (prefersReducedMotion) return;
    const orb1 = document.querySelector('.orb1');
    const orb2 = document.querySelector('.orb2');
    if (!orb1 && !orb2) return;

    let raf = null;
    window.addEventListener('scroll', () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        if (orb1) orb1.style.transform = `translateY(${y * 0.08}px)`;
        if (orb2) orb2.style.transform = `translateY(${y * -0.06}px)`;
        raf = null;
      });
    }, { passive: true });
  }

  /* -------------------------------------------------------
     Smooth anchor scroll with header offset
  ------------------------------------------------------- */
  function initSmoothAnchors() {
    const header = document.querySelector('header');
    const offset = header ? header.offsetHeight + 12 : 90;

    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        if (!id || id === '#') return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        target.classList.add('section-flash');
        setTimeout(() => target.classList.remove('section-flash'), 600);
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initLoader();
    initScrollReveal();
    initMouseLight();
    initRipple();
    initParallax();
    initSmoothAnchors();
  });
})();
