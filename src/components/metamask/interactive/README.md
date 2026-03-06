# Interactive Components - Extracted from MetaMask Website

This directory contains interactive UI components extracted from the MetaMask website repository and adapted for use with Astro/React.

## Components

### 1. AnimatedButton.jsx
**Source:** `Button.js`

Interactive button component with smooth hover/click animation states.

**Features:**
- CSS transition-based hover animations (300ms ease)
- Multiple variants: primary, secondary, white-outline
- Optional gradient backgrounds
- Icon support (start/end position with circular background)
- Responsive sizing

**Props:**
- `href` (string, required) - Link URL
- `text` (string, required) - Button text
- `variant` (string) - Style variant: 'primary', 'secondary', 'white-outline'
- `gradient` (boolean) - Use gradient background
- `iconUrl` (string) - Icon image URL
- `iconPosition` (string) - 'start' or 'end'
- `onClick` (function) - Custom click handler

**Animation Patterns:**
- Background color transitions on hover
- Border color transitions for outline variants
- Opacity fade for hide state

---

### 2. Accordion.jsx
**Source:** `Faq.js`

Expandable FAQ accordion with smooth open/close animations.

**Features:**
- CSS max-height transition for smooth expand/collapse (500ms ease)
- Rotating plus icon animation (400ms ease, 45deg rotation)
- Multiple background variants: primary, gradient, white
- Optional bordered style
- Accessible ARIA attributes

**Props:**
- `question` (string, required) - Question text
- `answer` (string, required) - Answer HTML content
- `backgroundColor` (string) - 'primary', 'gradient', or 'white'
- `bordered` (boolean) - Show border around accordion
- `defaultOpen` (boolean) - Start in open state

**Animation Patterns:**
- Max-height transition for content reveal
- Icon rotation transform on toggle
- Hover opacity change on question button

---

### 3. CallToAction.jsx
**Source:** `CTA.js`

CTA link component with layout variants and GSAP-based smooth scroll.

**Features:**
- GSAP smooth scroll for anchor links (700ms duration, 100px offset)
- Multiple layout types: default, header, footer, link-card
- Arrow icons with hover animation (translateX 4px)
- Social icon support
- Flexible alignment options

**Props:**
- `href` (string, required) - Link URL
- `text` (string, required) - CTA text (HTML supported)
- `align` (string) - 'left', 'center', or 'right'
- `typeLayout` (string) - Layout variant
- `showRightArrow` (boolean) - Show right arrow icon
- `showLeftArrow` (boolean) - Show left arrow icon
- `onClick` (function) - Custom click handler

**Animation Patterns:**
- GSAP scrollTo animation for anchor links
- Arrow translateX on hover
- Color transitions on hover (150ms ease)

**Dependencies:**
- `gsap` - For smooth scroll animation

---

### 4. FullWidthBanner.jsx
**Source:** `FullWidthCta.js`

Edge-to-edge CTA banner with background image support.

**Features:**
- Full-width or contained background images
- Flexible CTA button layouts
- Multiple background color variants
- Optional border styling
- Responsive padding controls

**Props:**
- `headline` (string) - Main headline (HTML supported)
- `description` (string) - Description text (HTML supported)
- `ctas` (array) - Array of CTA button configs
- `backgroundColor` (string) - 'dark', 'gray', or 'white'
- `backgroundImage` (string) - Background image URL
- `bordered` (boolean) - Show border
- `fullWidthBackground` (boolean) - Apply background to full width

**Animation Patterns:**
- Button hover transitions (300ms ease)
- Background color transitions

---

### 5. ModalOverlay.jsx
**Source:** `Popup.js` and `PopupAnnouncement.js`

Modal popup with body scroll lock and dismissible announcement banner.

**Features:**
- Body scroll lock when modal is open
- Backdrop fade-in animation (200ms)
- Modal slide-up animation (300ms)
- ESC key and backdrop click to close
- Scrollbar width compensation

**Props (ModalOverlay):**
- `isOpen` (boolean, required) - Control visibility
- `onClose` (function, required) - Close handler
- `children` (node, required) - Modal content
- `width` (string) - Modal width (default: '600px')
- `hideCloseIcon` (boolean) - Hide close button
- `closeOnBackdrop` (boolean) - Close on backdrop click
- `closeOnEscape` (boolean) - Close on ESC key

**Props (AnnouncementBanner):**
- `title` (string) - Announcement title
- `ctaText` (string) - CTA button text
- `ctaLink` (string) - CTA link URL
- `backgroundColor` (string) - Background color
- `onDismiss` (function) - Dismiss callback

**Animation Patterns:**
- Backdrop fadeIn keyframe animation
- Modal slideUp keyframe animation
- Close button hover background transition

---

## Animation Libraries Used

### GSAP (CallToAction only)
- **Version:** 3.12.1
- **Usage:** Smooth scroll for anchor links
- **Installation:** `npm install gsap`

### CSS Transitions (All components)
- Background color, border, color, opacity transitions
- Transform animations for icons
- Max-height transitions for accordion

---

## Styling

All components use **styled-components** for CSS-in-JS styling.

**Installation:**
```bash
npm install styled-components
```

**Theme Integration:**
Components reference MetaMask design tokens but have fallback values:
- Primary color: `#037dd6`
- Hover color: `#1565c0`
- Dark background: `#24292e`
- Light background: `#f2f4f6`

---

## Usage Examples

### AnimatedButton
```jsx
import AnimatedButton from './AnimatedButton'

<AnimatedButton
  href="/download"
  text="Download MetaMask"
  variant="primary"
  gradient={true}
/>
```

### Accordion
```jsx
import Accordion from './Accordion'

<Accordion
  question="What is MetaMask?"
  answer="<p>MetaMask is a crypto wallet...</p>"
  backgroundColor="gradient"
  bordered={true}
/>
```

### CallToAction
```jsx
import CallToAction from './CallToAction'

<CallToAction
  href="#features"
  text="Learn More"
  showRightArrow={true}
  align="center"
/>
```

### FullWidthBanner
```jsx
import FullWidthBanner from './FullWidthBanner'

<FullWidthBanner
  headline="Get Started with MetaMask"
  description="<p>The world's most popular crypto wallet</p>"
  ctas={[
    { text: 'Download', href: '/download', variant: 'primary' },
    { text: 'Learn More', href: '/about', variant: 'secondary' }
  ]}
  backgroundColor="dark"
/>
```

### ModalOverlay
```jsx
import ModalOverlay, { AnnouncementBanner } from './ModalOverlay'

// Modal
<ModalOverlay isOpen={isOpen} onClose={() => setIsOpen(false)}>
  <h2>Modal Content</h2>
  <p>Your content here...</p>
</ModalOverlay>

// Announcement Banner
<AnnouncementBanner
  title="New Feature!"
  ctaText="Learn More"
  ctaLink="/blog/new-feature"
  backgroundColor="#037dd6"
/>
```

---

## Astro Integration

To use these components in Astro:

1. **Install dependencies:**
```bash
npm install react react-dom styled-components gsap
```

2. **Add React integration to astro.config.mjs:**
```javascript
import { defineConfig } from 'astro/config'
import react from '@astrojs/react'

export default defineConfig({
  integrations: [react()],
})
```

3. **Use in Astro pages with client directive:**
```astro
---
import AnimatedButton from '../components/interactive/AnimatedButton.jsx'
---

<AnimatedButton
  client:load
  href="/download"
  text="Download Now"
  variant="primary"
/>
```

---

## Stripped Dependencies

The following Contentful/Gatsby dependencies were removed:
- `contentfulModuleToComponent` - Replaced with prop-driven content
- `gatsby-plugin-launchdarkly` - Removed A/B testing logic
- `react-device-detect` - Removed browser detection
- `@reach/router` - Replaced with standard anchor tags
- `@loadable/component` - Removed lazy loading
- GraphQL queries - Replaced with props

---

## Animation Patterns Preserved

✅ **GSAP smooth scroll** (CallToAction anchor links)
✅ **CSS transitions** (all hover/click states)
✅ **Transform animations** (icon rotations, translations)
✅ **Max-height transitions** (accordion expand/collapse)
✅ **Keyframe animations** (modal fade-in, slide-up)
✅ **Body scroll lock** (modal overlay)

---

## Browser Compatibility

All animations use standard CSS transitions and transforms, compatible with:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

GSAP provides additional cross-browser compatibility for smooth scroll.
