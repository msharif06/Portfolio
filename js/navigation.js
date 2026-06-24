/**
 * navigation.js
 *
 * Sidebar responsive behavior:
 * - >1200px: expanded or collapsed per user preference + toggle arrow
 * - 901–1200px: auto-collapsed via CSS, toggle arrow still works to expand
 * - ≤900px: PERMANENTLY collapsed, no toggle, no hamburger, no drawer
 *           JS is completely locked out from opening the sidebar here.
 */
'use strict';

(function NavigationModule() {

  const body          = document.body;
  const sidebar       = document.getElementById('sidebar');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const scrollBar     = document.getElementById('scrollProgress');

  const SIDEBAR_KEY    = 'portfolio-sidebar';
  const LOCKED_BP      = 900;   // below this: sidebar permanently collapsed, no JS interaction

  const isLocked = () => window.innerWidth <= LOCKED_BP;

  function getSaved() {
    try { return localStorage.getItem(SIDEBAR_KEY) || 'expanded'; } catch { return 'expanded'; }
  }
  function saveSidebarState(s) {
    try { localStorage.setItem(SIDEBAR_KEY, s); } catch {}
  }

  function applySidebarState(state) {
    body.setAttribute('data-sidebar', state);
    if (sidebarToggle) sidebarToggle.setAttribute('aria-expanded', state === 'expanded');
  }

  /* Desktop collapse/expand toggle — locked out on mobile */
  function toggleDesktopSidebar() {
    if (isLocked()) return;  /* ← key guard: no-op below 900px */
    const next = body.getAttribute('data-sidebar') === 'expanded' ? 'collapsed' : 'expanded';
    applySidebarState(next);
    saveSidebarState(next);
    updateActiveHighlights();
  }

  if (sidebarToggle) sidebarToggle.addEventListener('click', toggleDesktopSidebar);

  /* Resize handler */
  function handleResize() {
    if (isLocked()) {
      /* Force collapsed, no saving, no interaction */
      body.setAttribute('data-sidebar', 'collapsed');
      return;
    }
    /* Desktop: restore saved preference */
    applySidebarState(getSaved());
    updateActiveHighlights();
  }

  window.addEventListener('resize', handleResize, { passive: true });

  /* Initial state */
  if (isLocked()) {
    body.setAttribute('data-sidebar', 'collapsed');
  } else {
    applySidebarState(getSaved());
  }

  /* Smooth scroll (works on all viewport sizes) */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      const target = href && href.length > 1 ? document.querySelector(href) : null;
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, '', href);
    });
  });

  /* Hero scroll arrow */
  const scrollArrow = document.getElementById('heroScrollArrow');
  if (scrollArrow) {
    scrollArrow.addEventListener('click', () => {
      const about = document.getElementById('about');
      if (!about) return;
      const start = window.scrollY;
      const end   = about.getBoundingClientRect().top + window.scrollY;
      const dist  = end - start;
      const dur   = Math.min(Math.max(Math.abs(dist) * 0.01, 50), 200);
      let startTime = null;
      function ease(t) { return t < 0.5 ? 2*t*t : -1+(4-2*t)*t; }
      function step(ts) {
        if (!startTime) startTime = ts;
        const p = Math.min((ts - startTime) / dur, 1);
        window.scrollTo(0, start + dist * ease(p));
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  /* Dropdowns (Projects) */
  sidebar && sidebar.querySelectorAll('.sidebar__nav-link--dropdown').forEach(trigger => {
    const menu = document.getElementById(trigger.getAttribute('aria-controls'));
    if (!menu) return;
    trigger.addEventListener('click', () => {
      if (isLocked()) return;  /* no dropdowns when permanently collapsed */
      const willOpen = trigger.getAttribute('aria-expanded') !== 'true';
      sidebar.querySelectorAll('.sidebar__nav-link--dropdown').forEach(t => {
        t.setAttribute('aria-expanded', 'false');
        const m = document.getElementById(t.getAttribute('aria-controls'));
        if (m) m.classList.remove('is-open');
      });
      if (willOpen) { trigger.setAttribute('aria-expanded', 'true'); menu.classList.add('is-open'); }
    });
  });

  /* Active section highlights */
  const SECTION_NAV_MAP = {
    'overview':   'about',      /* overview scrolls to about now */
    'about':      'about',
    'experience': 'experience',
    'usg':        'experience',
    'cure':       'experience',
    'leadership': 'experience',
    'vision':     'experience',
    'projects':   'projects',
    'resources':  'resources',
    'skills':     'skills',
    'contact':    'contact',
  };

  const allNavLinks = sidebar
    ? [...sidebar.querySelectorAll('.sidebar__nav-link[data-section], .sidebar__dropdown-link[data-section]')]
    : [];

  let currentActive = '';

  function updateActiveHighlights() {
    if (currentActive) setActive(currentActive);
  }

  function setActive(sectionId) {
    currentActive = sectionId;
    const navTarget = SECTION_NAV_MAP[sectionId] || sectionId;
    allNavLinks.forEach(link => {
      const ds = link.getAttribute('data-section') || '';
      link.classList.toggle('is-active', ds === navTarget);
    });
  }

  const ratioMap = new Map();
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => ratioMap.set(e.target.id, e.intersectionRatio));
    let bestId = '', bestRatio = -1;
    ratioMap.forEach((r, id) => { if (r > bestRatio) { bestRatio = r; bestId = id; } });
    if (bestId && bestRatio > 0) setActive(bestId);
  }, { rootMargin: '-15% 0px -70% 0px', threshold: [0, 0.05, 0.1, 0.2, 0.4, 0.6, 0.8, 1.0] });

  document.querySelectorAll('section[id], article[id]').forEach(el => {
    ratioMap.set(el.id, 0); observer.observe(el);
  });

  let scrollTimer;
  window.addEventListener('scroll', () => {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      const sections = [...document.querySelectorAll('section[id]')];
      const viewLine = window.scrollY + window.innerHeight * 0.28;
      let closest = sections[0], minDist = Infinity;
      sections.forEach(s => { const d = Math.abs(s.offsetTop - viewLine); if (d < minDist) { minDist = d; closest = s; } });
      if (closest) setActive(closest.id);
    }, 100);

    /* Scroll progress */
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const pct = total > 0 ? (window.scrollY / total) * 100 : 0;
    if (scrollBar) scrollBar.style.width = Math.min(pct, 100) + '%';
    document.documentElement.style.setProperty('--scroll-ratio', Math.min(window.scrollY / window.innerHeight, 1).toFixed(3));

    /* Parallax on section image panels */
    if (!isLocked()) {
      document.querySelectorAll('.section__col-img').forEach(img => {
        const wrap = img.closest('.section__col--image');
        if (!wrap) return;
        const rect = wrap.getBoundingClientRect();
        const ratio = (rect.top + rect.height / 2) / window.innerHeight;
        const offset = (0.5 - ratio) * 40;
        img.style.setProperty('--parallax-offset', `${offset}px`);
      });
    }
  }, { passive: true });

  window.NavigationModule = {};

})();
