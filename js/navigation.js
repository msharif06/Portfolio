/**
 * navigation.js
 * 1. Sidebar collapse/expand (desktop, persisted)
 * 2. Auto-collapse at ≤1100px (no hamburger — just shrinks)
 * 3. Mobile drawer at ≤900px (hamburger opens slide-in)
 * 4. Dropdowns
 * 5. Smooth scroll
 * 6. Active highlights — shown when expanded, numbers highlighted when collapsed
 * 7. Scroll progress
 */
'use strict';

(function NavigationModule() {

  const body          = document.body;
  const sidebar       = document.getElementById('sidebar');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const hamburger     = document.getElementById('hamburger');
  const overlay       = document.getElementById('sidebarOverlay');
  const scrollBar     = document.getElementById('scrollProgress');

  const SIDEBAR_KEY      = 'portfolio-sidebar';
  const AUTO_COLLAPSE_BP = 1100;
  const MOBILE_BP        = 900;

  const isMobile = () => window.innerWidth <= MOBILE_BP;
  const isNarrow = () => window.innerWidth <= AUTO_COLLAPSE_BP && window.innerWidth > MOBILE_BP;

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

  /* Hamburger only visible on mobile */
  function syncHamburger() {
    if (isMobile()) {
      hamburger.classList.add('is-visible');
    } else {
      hamburger.classList.remove('is-visible');
    }
  }

  /* Desktop collapse toggle (chevron button) */
  function toggleDesktopSidebar() {
    const next = body.getAttribute('data-sidebar') === 'expanded' ? 'collapsed' : 'expanded';
    applySidebarState(next);
    saveSidebarState(next);
    updateActiveHighlights();
  }

  if (sidebarToggle) sidebarToggle.addEventListener('click', toggleDesktopSidebar);

  /* Resize: auto-collapse between 900–1100px via CSS, restore outside */
  function handleResize() {
    if (isMobile()) { syncHamburger(); return; }
    if (!isNarrow()) {
      // Wide desktop: restore saved preference
      applySidebarState(getSaved());
    }
    // In narrow range, CSS handles the visual collapse via media query
    syncHamburger();
    updateActiveHighlights();
  }

  window.addEventListener('resize', handleResize, { passive: true });
  applySidebarState(getSaved());
  syncHamburger();

  /* Mobile drawer */
  function openDrawer() {
    sidebar.classList.add('is-mobile-open');
    overlay.classList.add('is-active');
    overlay.setAttribute('aria-hidden', 'false');
    hamburger.setAttribute('aria-expanded', 'true');
    body.style.overflow = 'hidden';
    const lines = hamburger.querySelectorAll('.hamburger__line');
    if (lines[0]) lines[0].style.transform = 'translateY(7px) rotate(45deg)';
    if (lines[1]) lines[1].style.opacity   = '0';
    if (lines[2]) lines[2].style.transform = 'translateY(-7px) rotate(-45deg)';
  }

  function closeDrawer() {
    sidebar.classList.remove('is-mobile-open');
    overlay.classList.remove('is-active');
    overlay.setAttribute('aria-hidden', 'true');
    hamburger.setAttribute('aria-expanded', 'false');
    body.style.overflow = '';
    hamburger.querySelectorAll('.hamburger__line').forEach(l => { l.style.transform=''; l.style.opacity=''; });
  }

  if (hamburger) hamburger.addEventListener('click', () => {
    sidebar.classList.contains('is-mobile-open') ? closeDrawer() : openDrawer();
  });
  if (overlay) overlay.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && isMobile()) closeDrawer(); });

  /* Dropdowns */
  sidebar && sidebar.querySelectorAll('.sidebar__nav-link--dropdown').forEach(trigger => {
    const menu = document.getElementById(trigger.getAttribute('aria-controls'));
    if (!menu) return;
    trigger.addEventListener('click', () => {
      const willOpen = trigger.getAttribute('aria-expanded') !== 'true';
      sidebar.querySelectorAll('.sidebar__nav-link--dropdown').forEach(t => {
        t.setAttribute('aria-expanded', 'false');
        const m = document.getElementById(t.getAttribute('aria-controls'));
        if (m) m.classList.remove('is-open');
      });
      if (willOpen) { trigger.setAttribute('aria-expanded', 'true'); menu.classList.add('is-open'); }
    });
  });

  /* Smooth scroll */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      const target = href && href.length > 1 ? document.querySelector(href) : null;
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, '', href);
      if (isMobile()) closeDrawer();
    });
  });

  /* Hero scroll arrow — slow smooth scroll to about section */
  const scrollArrow = document.getElementById('heroScrollArrow');
  if (scrollArrow) {
    scrollArrow.addEventListener('click', () => {
      const about = document.getElementById('about');
      if (!about) return;
      const start = window.scrollY;
      const end   = about.getBoundingClientRect().top + window.scrollY;
      const dist  = end - start;
      const dur   = Math.min(Math.max(Math.abs(dist) * .01, 50), 200); // 0.8–2s depending on distance
      let startTime = null;

      function ease(t) { return t < 0.5 ? 2*t*t : -1+(4-2*t)*t; }

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / dur, 1);
        window.scrollTo(0, start + dist * ease(progress));
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  /* Active highlights */
  const SECTION_NAV_MAP = {
    'overview':   'overview',
    'about':      'about',
    'experience': 'experience',
    'usg':        'experience',
    'cure':       'experience',
    'leadership': 'experience',
    'skills':     'skills',
    'projects':   'projects',
    'resources':  'resources',
    'contact':    'contact',
  };

  const allNavLinks = sidebar
    ? [...sidebar.querySelectorAll('.sidebar__nav-link[data-section], .sidebar__dropdown-link[data-section]')]
    : [];

  let currentActive = '';

  function isHighlightEnabled() {
    // Always highlight — collapsed state shows number highlights via CSS
    return true;
  }

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

    if (['usg', 'cure', 'leadership'].includes(sectionId)) {
      const expMenu    = document.getElementById('expMenu');
      const expTrigger = sidebar && sidebar.querySelector('[aria-controls="expMenu"]');
      if (expMenu && !expMenu.classList.contains('is-open')) {
        expMenu.classList.add('is-open');
        if (expTrigger) expTrigger.setAttribute('aria-expanded', 'true');
      }
    }
  }

  const ratioMap = new Map();
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => ratioMap.set(e.target.id, e.intersectionRatio));
    let bestId = '', bestRatio = -1;
    ratioMap.forEach((r, id) => { if (r > bestRatio) { bestRatio = r; bestId = id; } });
    if (bestId && bestRatio > 0) setActive(bestId);
  }, { rootMargin: '-15% 0px -70% 0px', threshold: [0,0.05,0.1,0.2,0.4,0.6,0.8,1.0] });

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
  }, { passive: true });

  /* Scroll progress */
  window.addEventListener('scroll', () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const pct   = total > 0 ? (window.scrollY / total) * 100 : 0;
    if (scrollBar) scrollBar.style.width = Math.min(pct, 100) + '%';
    document.documentElement.style.setProperty('--scroll-ratio', Math.min(window.scrollY / window.innerHeight, 1).toFixed(3));
  }, { passive: true });

  window.NavigationModule = { closeDrawer };

})();
