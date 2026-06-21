/**
 * main.js
 * Top-level orchestration:
 *  1. Lazy-load images via IntersectionObserver
 *  2. Scroll-based hero parallax (blueprint grid, glow)
 *  3. Keyboard accessibility helpers
 *  4. Any future global init hooks
 */

'use strict';

(function MainModule() {

  /* ── 1. Lazy image loading ───────────────────────────────────── */
  function initLazyImages() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    if ('loading' in HTMLImageElement.prototype) return; // native support

    const imgObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) img.src = img.dataset.src;
          img.classList.add('is-loaded');
          imgObserver.unobserve(img);
        }
      });
    }, { rootMargin: '200px 0px' });

    images.forEach(img => imgObserver.observe(img));
  }

  /* ── 2. Hero scroll parallax ─────────────────────────────────── */
  function initHeroParallax() {
    // CSS var --scroll-ratio is already set by navigation.js on scroll.
    // Here we add additional glow drift based on mouse position.
    const hero = document.querySelector('.section--hero');
    if (!hero) return;

    hero.addEventListener('mousemove', e => {
      const { left, top, width, height } = hero.getBoundingClientRect();
      const x = ((e.clientX - left) / width  - 0.5) * 30;
      const y = ((e.clientY - top)  / height - 0.5) * 20;
      const glow1 = document.querySelector('.hero__glow--1');
      const glow2 = document.querySelector('.hero__glow--2');
      if (glow1) glow1.style.transform = `translate(${x}px, ${y}px) scale(1)`;
      if (glow2) glow2.style.transform = `translate(${-x * 0.6}px, ${-y * 0.6}px) scale(1)`;
    }, { passive: true });

    hero.addEventListener('mouseleave', () => {
      const glow1 = document.querySelector('.hero__glow--1');
      const glow2 = document.querySelector('.hero__glow--2');
      if (glow1) glow1.style.transform = '';
      if (glow2) glow2.style.transform = '';
    });
  }

  /* ── 3. Skip-to-content link (a11y) ─────────────────────────── */
  function initSkipLink() {
    const skip = document.createElement('a');
    skip.href = '#overview';
    skip.className = 'skip-link';
    skip.textContent = 'Skip to content';
    skip.addEventListener('click', e => {
      e.preventDefault();
      const target = document.getElementById('overview');
      if (target) { target.focus(); target.scrollIntoView(); }
    });
    document.body.prepend(skip);
  }

  /* ── 4. Smooth image placeholder fade-in ────────────────────── */
  function initImageFadeIn() {
    document.querySelectorAll('.project-card__image').forEach(img => {
      img.style.opacity = '0';
      img.style.transition = 'opacity 0.4s ease';
      const onLoad = () => { img.style.opacity = '1'; };
      if (img.complete) { onLoad(); }
      else { img.addEventListener('load', onLoad); }
    });
  }

  /* ── Init ────────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    initLazyImages();
    initHeroParallax();
    initSkipLink();
    initImageFadeIn();
    console.info('[Portfolio] Initialised successfully.');
  });

})();
