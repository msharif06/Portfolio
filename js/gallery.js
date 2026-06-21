/**
 * gallery.js
 * Reusable fullscreen lightbox gallery.
 * Reads image arrays from data-gallery attributes on timeline articles.
 * Triggered by .gallery-trigger buttons.
 */
'use strict';

(function GalleryModule() {

  const lightbox    = document.getElementById('lightbox');
  const backdrop    = document.getElementById('lightboxBackdrop');
  const closeBtn    = document.getElementById('lightboxClose');
  const prevBtn     = document.getElementById('lightboxPrev');
  const nextBtn     = document.getElementById('lightboxNext');
  const imgEl       = document.getElementById('lightboxImg');
  const counterEl   = document.getElementById('lightboxCounter');
  const thumbsEl    = document.getElementById('lightboxThumbs');

  if (!lightbox) return;

  let images  = [];
  let current = 0;

  /* ── Open ────────────────────────────────────────────────────── */
  function open(galleryId, startIndex) {
    startIndex = startIndex || 0;

    // Find the article with matching gallery-id and read its data-gallery
    const article = document.querySelector(`[data-gallery-id="${galleryId}"]`);
    if (!article) return;

    const parentArticle = article.closest('[data-gallery]');
    if (!parentArticle) return;

    try {
      images = JSON.parse(parentArticle.getAttribute('data-gallery') || '[]');
    } catch {
      images = [];
    }

    // Add primary image to front if not already in gallery
    const primaryImg = parentArticle.getAttribute('data-primary-img');
    if (primaryImg && !images.includes(primaryImg)) {
      images.unshift(primaryImg);
    }

    if (images.length === 0) return;

    current = Math.min(startIndex, images.length - 1);
    buildThumbs();
    showImage(current);
    lightbox.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  /* ── Close ───────────────────────────────────────────────────── */
  function close() {
    lightbox.setAttribute('hidden', '');
    document.body.style.overflow = '';
    images = [];
  }

  /* ── Navigation ──────────────────────────────────────────────── */
  function showImage(idx) {
    current = ((idx % images.length) + images.length) % images.length;
    imgEl.src = images[current];
    imgEl.alt = `Gallery image ${current + 1}`;
    counterEl.textContent = `${current + 1} / ${images.length}`;

    // Update thumb highlights
    document.querySelectorAll('.lightbox__thumb').forEach((t, i) => {
      t.classList.toggle('is-active', i === current);
    });
  }

  function prev() { showImage(current - 1); }
  function next() { showImage(current + 1); }

  /* ── Build thumbnail strip ───────────────────────────────────── */
  function buildThumbs() {
    thumbsEl.innerHTML = '';
    images.forEach((src, i) => {
      const div = document.createElement('div');
      div.className = 'lightbox__thumb';
      const img = document.createElement('img');
      img.src = src; img.alt = `Thumbnail ${i + 1}`;
      img.loading = 'lazy';
      div.appendChild(img);
      div.addEventListener('click', () => showImage(i));
      thumbsEl.appendChild(div);
    });
  }

  /* ── Event listeners ─────────────────────────────────────────── */
  closeBtn.addEventListener('click', close);
  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);
  backdrop.addEventListener('click', close);

  document.addEventListener('keydown', e => {
    if (lightbox.hasAttribute('hidden')) return;
    if (e.key === 'Escape')     close();
    if (e.key === 'ArrowLeft')  prev();
    if (e.key === 'ArrowRight') next();
  });

  /* Prevent inner click from closing */
  lightbox.querySelector('.lightbox__inner').addEventListener('click', e => e.stopPropagation());

  /* ── Wire gallery trigger buttons ────────────────────────────── */
  document.addEventListener('click', e => {
    const trigger = e.target.closest('.gallery-trigger');
    if (!trigger) return;
    const galleryId = trigger.getAttribute('data-gallery-id');
    if (galleryId) open(galleryId, 0);
  });

  window.GalleryModule = { open, close };

})();
