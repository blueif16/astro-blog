# Layout System Extraction Summary

**Date:** 2026-03-06
**Source:** MetaMask website repository
**Target:** Astro blog integration

## Extracted Components

### 1. theme.js (395 lines)
Complete design system with 6 theme variants.

**Tokens:**
- Colors: Blue, purple, orange brand colors + grayscale
- Typography: 10 font sizes (12px-61px), 8 weights (100-900)
- Breakpoints: 5 responsive breakpoints (480px-2048px)
- Shadows: 3 shadow variants
- Spacing: Container widths, hero dimensions
- Easing: Custom cubic-bezier curve

**Theme Variants:**
- defaultTheme (blue light)
- defaultDarkTheme (blue dark)
- purpleTheme (purple light)
- purpleDarkTheme (purple dark)
- darkTheme (black light)
- darkDarkTheme (white on black)

### 2. SectionWrapper.jsx (79 lines)
Responsive section container with configurable max-width.

**Features:**
- Normal (992px) or wide (1200px) max-width
- 20px horizontal padding
- CSS variable support
- Style override prop
- Built-in utility classes

### 3. Primitives.jsx (138 lines)
6 shared styled-components primitives.

**Components:**
- Section (responsive padding container)
- SectionTitle (H2 with mobile sizing)
- FooterTitle (uppercase footer headings)
- ModalInner (scrollable modal container)
- IconCloseModal (modal close button)
- EyebrowStyle (orange accent labels)

### 4. PageShell.jsx (93 lines)
Root layout with ThemeProvider.

**Features:**
- Wraps content with styled-components ThemeProvider
- Theme color variants (dark/light)
- Custom H2 font size override
- Overflow-x clipping
- Gatsby/Contentful dependencies removed

### 5. smooth-scroll.js (169 lines)
Lenis smooth scroll with device optimizations.

**Functions:**
- initSmoothScroll() - Vanilla JS initialization
- useSmoothScroll() - React hook version
- scrollTo() - Programmatic scrolling
- onScroll() - Scroll event listener

**Features:**
- Device-specific lerp values (Windows/Safari: 1, others: 0.2)
- RAF loop with cleanup
- Custom scroll container support
- Scroll progress tracking

## Lenis Location Found

**Original file:** `/Users/tk/Desktop/mm-temp/src/components/PortfolioPage/Map/Sidebar/PortfolioMapSidebar.js`
**Lines:** 179-204

**Key finding:** Lenis was NOT globally initialized. It was only used locally in PortfolioMapSidebar for a specific scrollable sidebar with custom wrapper/content refs.

**For Astro:** If global smooth scroll is desired, initialize in root layout. Otherwise, use locally with refs for specific scrollable containers.

## Documentation Created

- README.md (main integration guide)
- theme.md (theme tokens reference)
- SectionWrapper.md (component usage)
- Primitives.md (primitives reference)
- PageShell.md (layout component guide)
- smooth-scroll.md (Lenis integration guide)

## Dependencies Required

```bash
npm install styled-components @studio-freight/lenis @studio-freight/hamo
```

## Removed Dependencies

- Gatsby (gatsby, gatsby-plugin-image, gatsby-plugin-sharp)
- Contentful (gatsby-source-contentful, GraphQL)
- React Helmet (use Astro's <head>)
- Gatsby Link (use Astro's <a>)
- classnames (optional, can keep)
- PropTypes (optional, can keep)

## Total Lines of Code

- JavaScript/JSX: 874 lines
- Documentation: ~500 lines
- Total: ~1,374 lines

## Integration Steps for Astro

1. Copy `/Users/tk/Desktop/mm-temp/extracted/layout/` to Astro project
2. Install dependencies: `npm install styled-components @studio-freight/lenis @studio-freight/hamo`
3. Import PageShell in Astro layout with `client:load`
4. Add CSS variables to global CSS (optional)
5. Initialize smooth scroll in layout script tag (optional)
6. Use SectionWrapper and Primitives in components

## Example Astro Integration

```astro
---
// src/layouts/Layout.astro
import PageShell from '../components/layout/PageShell.jsx'
import { defaultTheme } from '../components/layout/theme.js'
---

<PageShell theme={defaultTheme} client:load>
  <slot />
</PageShell>

<script>
  import { initSmoothScroll } from '../components/layout/smooth-scroll.js'
  initSmoothScroll()
</script>

<style is:global>
  :root {
    --container-width: 992px;
    --container-width-miniDesktop: 784px;
  }
</style>
```

## Files Extracted

```
/Users/tk/Desktop/mm-temp/extracted/layout/
├── theme.js (395 lines)
├── SectionWrapper.jsx (79 lines)
├── Primitives.jsx (138 lines)
├── PageShell.jsx (93 lines)
├── smooth-scroll.js (169 lines)
├── README.md
├── theme.md
├── SectionWrapper.md
├── Primitives.md
├── PageShell.md
├── smooth-scroll.md
└── EXTRACTION_SUMMARY.md (this file)
```

## Verification

```bash
ls /Users/tk/Desktop/mm-temp/extracted/layout/theme.js
# Output: /Users/tk/Desktop/mm-temp/extracted/layout/theme.js
```

## Next Steps

1. Review extracted components
2. Test in Astro environment
3. Customize theme colors for brand
4. Extract additional components as needed (buttons, cards, etc.)
