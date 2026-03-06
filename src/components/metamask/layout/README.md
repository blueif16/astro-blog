# Layout Components

Extracted layout components and theme system from MetaMask website.

## Files

### 1. `theme.js`
Complete design system with colors, typography, spacing, breakpoints, and shadows.

**Exports:**
- `theme` (default) - Base theme tokens
- `defaultTheme` - Light theme with blue primary
- `defaultDarkTheme` - Dark theme with blue primary
- `purpleTheme` - Light theme with purple primary
- `purpleDarkTheme` - Dark theme with purple primary
- `darkTheme` - Light theme with black primary
- `darkDarkTheme` - Dark theme with white on black

**Key Tokens:**
- Colors: Brand colors (blue, purple, orange), grayscale
- Typography: Font sizes (12px-61px rem-based), weights (100-900)
- Breakpoints: mobile (480px), tablet (768px), miniDesktop (992px), desktop (1200px)
- Shadows: extraLight, light, medium
- Easing: `cubic-bezier(0.5,0.14,0,1.01)`

### 2. `SectionWrapper.jsx`
Responsive section container with configurable padding and max-width.

**Props:**
- `size`: 'wide' (1200px) or 'normal' (992px, default)
- `customClass`: Additional CSS classes
- `styleOverride`: Custom CSS string

**Usage:**
```jsx
<SectionWrapper size="wide" customClass="my-section">
  <h1>Content</h1>
</SectionWrapper>
```

### 3. `Primitives.jsx`
Shared styled-components primitives for consistent UI elements.

**Exports:**
- `Section` - Main section container with responsive padding (48px)
- `SectionTitle` - H2 heading with responsive sizing
- `FooterTitle` - Uppercase footer section titles
- `ModalInner` - Modal dialog container with scrolling
- `IconCloseModal` - Close button for modals
- `EyebrowStyle` - Small uppercase label text (orange, 700 weight)

**Usage:**
```jsx
import { Section, SectionTitle, EyebrowStyle } from './Primitives'

<Section sectionPadding="80px">
  <EyebrowStyle>New Feature</EyebrowStyle>
  <SectionTitle>Heading</SectionTitle>
</Section>
```

### 4. `PageShell.jsx`
Root layout component with ThemeProvider and global styles.

**Props:**
- `theme`: Theme object override
- `h2FontSize`: Custom H2 font size
- `themeColor`: 'dark' or 'light'
- `widerContainer`: Boolean for wider max-width

**Usage:**
```jsx
import PageShell from './PageShell'
import { defaultTheme } from './theme'

<PageShell theme={defaultTheme} themeColor="dark">
  {children}
</PageShell>
```

### 5. `smooth-scroll.js`
Lenis smooth scroll initialization with device-specific optimizations.

**Dependencies:**
```bash
npm install @studio-freight/lenis @studio-freight/hamo
```

**Functions:**
- `initSmoothScroll(options)` - Initialize smooth scroll (returns cleanup function)
- `useSmoothScroll(options)` - React hook version
- `scrollTo(lenis, target, options)` - Programmatic scrolling
- `onScroll(lenis, callback)` - Scroll event listener

**Options:**
- `wrapper`: Element with overflow (default: window)
- `content`: Scrollable content (default: document.documentElement)
- `lerp`: Smoothness 0-1 (auto-detected: Windows/Safari=1, others=0.2)
- `wheelMultiplier`: Scroll speed (auto-detected: Windows/Safari=1, others=0.7)

**Usage (Vanilla JS in Astro):**
```astro
<script>
  import { initSmoothScroll } from './smooth-scroll'
  const cleanup = initSmoothScroll()
  // Call cleanup() on page unload if needed
</script>
```

**Usage (React component):**
```jsx
import { useEffect } from 'react'
import { initSmoothScroll } from './smooth-scroll'

function Layout() {
  useEffect(() => {
    const cleanup = initSmoothScroll()
    return cleanup
  }, [])
  return <div>...</div>
}
```

## Integration Notes

### For Astro

1. **Install dependencies:**
```bash
npm install styled-components @studio-freight/lenis @studio-freight/hamo
```

2. **Use in Astro layout:**
```astro
---
import PageShell from './layout/PageShell.jsx'
import { defaultTheme } from './layout/theme.js'
---
<PageShell theme={defaultTheme} client:load>
  <slot />
</PageShell>

<script>
  import { initSmoothScroll } from './layout/smooth-scroll.js'
  initSmoothScroll()
</script>
```

3. **CSS Variables (optional):**
Add to global CSS for container widths:
```css
:root {
  --container-width: 992px;
  --container-width-miniDesktop: 784px;
}
```

### Removed Dependencies

- Gatsby (gatsby, gatsby-plugin-image, gatsby-plugin-sharp)
- Contentful (gatsby-source-contentful, GraphQL queries)
- React Helmet (replaced with Astro's built-in head management)
- Gatsby Link (replace with Astro's `<a>` tags)

### Lenis Initialization Location

**Original location:** `/Users/tk/Desktop/mm-temp/src/components/PortfolioPage/Map/Sidebar/PortfolioMapSidebar.js` (lines 179-204)

**Key finding:** Lenis was NOT globally initialized in the original MetaMask site. It was only used locally in the PortfolioMapSidebar component for a specific scrollable sidebar.

**For Astro:** If you want global smooth scroll, initialize in your root layout. If you only need it for specific components, initialize locally with `wrapper` and `content` refs.

## Theme Variants

Choose a theme based on your design:

- **defaultTheme** - Blue primary, light background (MetaMask brand)
- **defaultDarkTheme** - Blue primary, dark background
- **purpleTheme** - Purple gradient primary, light background
- **purpleDarkTheme** - Purple gradient primary, dark background
- **darkTheme** - Black primary, light background
- **darkDarkTheme** - White primary, black background

## Responsive Breakpoints

```js
mobile: 480px
tablet: 768px
miniDesktop: 992px
desktop: 1200px
twoKResolution: 2048px
```

Use in styled-components:
```jsx
@media (min-width: ${({ theme }) => theme.device.tablet}) {
  font-size: 24px;
}
```

## Next Steps

1. Copy these files to your Astro project
2. Install dependencies
3. Import PageShell in your layout
4. Use SectionWrapper and Primitives in your components
5. Initialize smooth scroll if desired
6. Customize theme colors to match your brand
