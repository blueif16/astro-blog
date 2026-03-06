# SiteHeader Component

Responsive header with mobile menu, extracted from MetaMask website.

## Features

- Responsive navigation with mobile hamburger menu
- Dropdown menus with hover/click behavior
- Sticky header positioning
- Dark mode support
- Mobile menu animation (slide-in with opacity transition)
- Click-outside detection to close mobile menu
- Optional announcement banner
- Optional download button

## Props Structure

```javascript
{
  // Logo configuration
  logo: {
    logo: '/path/to/logo.svg',           // Light mode logo
    logoDarkMode: '/path/to/logo-dark.svg' // Dark mode logo (optional)
  },

  // Mobile logo (optional, falls back to desktop logo)
  logoMobile: {
    logo: '/path/to/logo-mobile.svg',
    logoDarkMode: '/path/to/logo-mobile-dark.svg'
  },

  // Navigation menu items
  menus: [
    {
      title: 'Products',
      items: [                           // Dropdown items (optional)
        { title: 'Wallet', href: '/wallet' },
        { title: 'Extension', href: '/extension' }
      ]
    },
    {
      title: 'About',
      href: '/about'                     // Direct link (no dropdown)
    }
  ],

  // Optional announcement banner (React node)
  announcement: <div>Special announcement</div>,

  // Optional download button (React node)
  downloadButton: <button>Download</button>,

  // Configuration
  hideDownloadBtn: false,                // Hide download button
  isSticky: true,                        // Enable sticky positioning
  isDarkMode: false,                     // Dark mode state
  onToggleDarkMode: () => {},           // Dark mode toggle handler
  showDarkModeToggle: true              // Show dark mode toggle
}
```

## Animation Behavior

### Mobile Menu Animation
- **Trigger**: Hamburger button click
- **Effect**: Slide-in from top with opacity fade
- **Duration**: CSS transition (300ms ease)
- **Implementation**: CSS-based (no GSAP required)

### Dropdown Menus
- **Desktop**: Hover to open, mouse leave to close
- **Mobile**: Click to toggle, accordion-style expansion
- **Animation**: Opacity + visibility transition

### Scroll Behavior
- **Note**: Original MetaMask header does NOT have scroll-aware show/hide behavior
- **Current**: Static sticky header
- **To Add Scroll Behavior**: See integration notes below

## Integration with Astro

### Basic Usage

```astro
---
import SiteHeader from './SiteHeader.jsx'

const headerProps = {
  logo: {
    logo: '/logo.svg',
    logoDarkMode: '/logo-dark.svg'
  },
  menus: [
    {
      title: 'Blog',
      href: '/blog'
    },
    {
      title: 'Resources',
      items: [
        { title: 'Docs', href: '/docs' },
        { title: 'Guides', href: '/guides' }
      ]
    }
  ],
  isDarkMode: false,
  onToggleDarkMode: () => {}
}
---

<SiteHeader {...headerProps} client:load />
```

### Adding Scroll-Aware Behavior (Optional)

The original MetaMask header does not hide on scroll. To add this feature:

```javascript
// Add to SiteHeader component
import { useEffect, useState } from 'react'

const [isVisible, setIsVisible] = useState(true)
const [lastScrollY, setLastScrollY] = useState(0)

useEffect(() => {
  const handleScroll = () => {
    const currentScrollY = window.scrollY

    if (currentScrollY > lastScrollY && currentScrollY > 100) {
      setIsVisible(false) // Scrolling down
    } else {
      setIsVisible(true)  // Scrolling up
    }

    setLastScrollY(currentScrollY)
  }

  window.addEventListener('scroll', handleScroll, { passive: true })
  return () => window.removeEventListener('scroll', handleScroll)
}, [lastScrollY])

// Update HeaderElement styled component
const HeaderElement = styled.header`
  /* ... existing styles ... */
  transform: translateY(${({ isVisible }) => isVisible ? '0' : '-100%'});
  transition: transform 300ms ease, background 300ms ease;
`
```

### Dark Mode Integration

```astro
---
// In your Astro layout
import { useState } from 'react'

const [isDarkMode, setIsDarkMode] = useState(false)

const toggleDarkMode = () => {
  setIsDarkMode(!isDarkMode)
  document.body.classList.toggle('dark-mode')
}
---

<SiteHeader
  {...headerProps}
  isDarkMode={isDarkMode}
  onToggleDarkMode={toggleDarkMode}
  client:load
/>
```

## Dependencies

- `react` - Core React library
- `styled-components` - CSS-in-JS styling
- `react-responsive` - Media query hooks
- `classnames` - Conditional class names
- `prop-types` - Runtime prop validation

## Styling Notes

- Uses `styled-components` for all styling
- Dark mode via `.dark-mode` class on `<body>`
- Breakpoints: Desktop (1200px), Mobile (<1199px)
- Z-index: 999 (ensure no conflicts with other components)

## Browser Support

- Modern browsers (ES6+)
- Mobile responsive
- Touch-friendly mobile menu

## Customization

### Change Breakpoint
Edit media queries in styled components (currently 1200px for desktop).

### Change Colors
Update color values in styled components:
- Primary: `#037dd6`
- Background: `#fff` / `#121212` (dark)
- Hover: `#e6eaee` / `#24292e` (dark)

### Remove Dark Mode Toggle
Set `showDarkModeToggle={false}` in props.
