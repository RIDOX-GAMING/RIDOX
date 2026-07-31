/* =========================================================
   RIDOX — particles.js
   Ultra-light ambient particle field rendered on canvas.
   No external libraries. Pauses when tab hidden or when
   prefers-reduced-motion is set, to protect performance.
   ========================================================= */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const PARTICLE_COUNT_DESKTOP = 46;
  const PARTICLE_COUNT_MOBILE = 20;
  const MAX_LINK_DIST = 130;

  let canvas, ctx, particles, width, height, rafId, running = true;

  function createCanvas() {
    canvas = document.createElement('canvas');
    canvas.id = 'particles-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.prepend(canvas);
    ctx = canvas.getContext('2d');
  }

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = Math.min(window.innerHeight, 900);
  }

  function particleCount() {
    return window.innerWidth < 700 ? PARTICLE_COUNT_MOBILE : PARTICLE_COUNT_DESKTOP;
  }

  function makeParticles() {
    const count = particleCount();
    particles = new Array(count).fill(0).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.6 + 0.6,
    }));
  }

  function step() {
    if (!running) return;
    ctx.clearRect(0, 0, width, height);

    // Update + draw dots
    ctx.fillStyle = 'rgba(140, 200, 230, 0.45)';
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw faint connective lines between nearby particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_LINK_DIST) {
          ctx.strokeStyle = `rgba(38, 211, 255, ${0.08 * (1 - dist / MAX_LINK_DIST)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    rafId = requestAnimationFrame(step);
  }

  function handleVisibility() {
    running = document.visibilityState === 'visible';
    if (running) rafId = requestAnimationFrame(step);
    else cancelAnimationFrame(rafId);
  }

  function init() {
    // Lazy: only render particle field on capable / larger viewports
    // to keep the experience fast on low-power devices.
    if (window.innerWidth < 480) return;

    createCanvas();
    resize();
    makeParticles();
    rafId = requestAnimationFrame(step);

    window.addEventListener('resize', () => {
      resize();
      makeParticles();
    });
    document.addEventListener('visibilitychange', handleVisibility);
  }

  document.addEventListener('DOMContentLoaded', () => {
    // Defer slightly so it never competes with first paint / loader
    window.requestIdleCallback ? window.requestIdleCallback(init) : setTimeout(init, 300);
  });
})();
