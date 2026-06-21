# Mohammad Sharif — Mechanical Engineering Portfolio

A production-quality, single-page engineering portfolio built with semantic HTML5, modular CSS3, and vanilla JavaScript. No frameworks.

---

## Project Structure

```
project/
├── index.html              # Main single-page site
├── css/
│   ├── styles.css          # Design tokens, layout, all component styles
│   ├── animations.css      # Reveal animations, hero entrance, parallax
│   ├── responsive.css      # Breakpoints: 1200px, 900px, 600px, 400px
│   └── project.css         # Styles for individual project pages
├── js/
│   ├── theme.js            # Dark/light toggle + dynamic accent color extraction
│   ├── navigation.js       # Sidebar collapse, dropdowns, active section, scroll progress
│   ├── animations.js       # IntersectionObserver reveals, timeline expand/collapse, form
│   └── main.js             # Lazy loading, hero parallax, skip link, image fade-in
├── assets/
│   ├── images/             # headshot.jpg, project images (tomato-slicer.jpg, etc.)
│   ├── videos/             # Future video assets
│   ├── icons/              # Custom icons if needed (Font Awesome used by default)
│   └── pdf/
│       ├── resume.pdf      # Resume download
│       └── portfolio.pdf   # Full portfolio PDF
├── projects/
│   ├── tomato-slicer.html
│   ├── foam-chair.html
│   ├── quadruped.html
│   └── senior-design.html  # Placeholder — update as project develops
├── blogs/                  # Future blog system
└── README.md
```

---

## Setup

No build step required. Open `index.html` in a browser or serve with any static file server:

```bash
# Python
python3 -m http.server 8000

# Node (npx)
npx serve .

# VS Code
# Use the Live Server extension
```

---

## Personalizing

### 1. Replace the headshot
Drop your photo as `assets/images/headshot.jpg`. The site automatically extracts its dominant accent color and updates buttons, glows, and borders throughout.

### 2. Update your info
All personal content is in `index.html`. Search for placeholder values:
- `Mohammad Sharif` → your name
- `@hawk.iit.edu` → your email
- GitHub / LinkedIn URLs → your profile URLs

### 3. Add a project
1. Create `projects/your-project.html` (copy any existing project page as a template)
2. Add a card in the `#projects` section of `index.html`
3. Add a sidebar dropdown link in the Projects menu

### 4. Add images
Place project images in `assets/images/` matching the filename used in each card's `<img src>`.

---

## Design System

### Colors (CSS variables on `:root`)
| Variable | Default | Purpose |
|---|---|---|
| `--color-bg` | `#0A0A0F` | Page background |
| `--color-surface` | `#111118` | Sidebar, cards |
| `--color-accent` | `#5B8DEF` | Buttons, highlights (auto-updated from headshot) |
| `--color-text-primary` | `#E8E8F0` | Headings, body |
| `--color-text-secondary` | `#9090A8` | Supporting text |

### Typography
| Role | Font |
|---|---|
| Display / Headings | Space Grotesk |
| Body | Inter |
| Labels / Code / Tags | JetBrains Mono |

---

## JavaScript Modules

| File | Responsibility |
|---|---|
| `theme.js` | Loads first (before DOM); handles theme persistence and color extraction |
| `navigation.js` | Sidebar collapse, mobile drawer, dropdowns, smooth scroll, active section |
| `animations.js` | Scroll-reveal via IntersectionObserver, timeline cards, contact form |
| `main.js` | Hero parallax, lazy images, skip link, image fade-ins |

---

## Future Expansion

The architecture is designed for zero-friction additions:

- **Three.js CAD viewer**: Add `js/cad-viewer.js` and a `<canvas>` in any project page
- **Blog system**: Add posts to `blogs/` and a listing page
- **Project filtering**: Add `data-category` attrs to project cards and a filter bar in JS
- **Dark/light persistence**: Already implemented via `localStorage`
- **Additional projects**: Copy a project page, add a card to the grid — done

---

## Accessibility

- Semantic HTML5 throughout
- ARIA labels on all interactive elements
- Keyboard navigation (Tab, Enter, Space, Escape)
- `prefers-reduced-motion` respected in `animations.css`
- Skip-to-content link injected by `main.js`
- High contrast ratios on dark and light themes

---

## Performance Notes

- Fonts loaded via `preconnect` + Google Fonts
- Project images are `loading="lazy"`
- Hero photo is `loading="eager"` (above fold)
- No JavaScript frameworks — zero bundle overhead
- CSS animations use `transform` and `opacity` only (GPU-composited)
- IntersectionObserver used instead of scroll event listeners for reveals
