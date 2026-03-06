# Astro Integration Guide

## Quick Start

### 1. Install Dependencies

```bash
npm install react react-dom styled-components gsap prop-types
```

### 2. Configure Astro

Add React integration to `astro.config.mjs`:

```javascript
import { defineConfig } from 'astro/config'
import react from '@astrojs/react'

export default defineConfig({
  integrations: [react()],
})
```

### 3. Copy Components

Copy the entire `interactive/` directory to your Astro project:

```bash
cp -r /Users/tk/Desktop/mm-temp/extracted/interactive/ ./src/components/
```

### 4. Use in Astro Pages

```astro
---
import { AnimatedButton, Accordion, CallToAction } from '../components/interactive'
---

<AnimatedButton
  client:load
  href="/download"
  text="Download Now"
  variant="primary"
/>

<Accordion
  client:visible
  question="What is this?"
  answer="<p>This is an accordion component.</p>"
/>

<CallToAction
  client:idle
  href="#features"
  text="Learn More"
  showRightArrow={true}
/>
```

## Client Directives

Choose the right directive for each component:

### `client:load` (Immediate)
Use for above-the-fold interactive elements:
- Primary CTA buttons
- Navigation elements
- Modals that might open immediately

```astro
<AnimatedButton client:load href="/signup" text="Sign Up" />
```

### `client:visible` (Lazy)
Use for below-the-fold content:
- Accordions in FAQ sections
- Banners further down the page
- Secondary CTAs

```astro
<Accordion client:visible question="FAQ" answer="..." />
```

### `client:idle` (Deferred)
Use for non-critical interactive elements:
- Footer CTAs
- Social links
- Announcement banners

```astro
<CallToAction client:idle href="#contact" text="Contact Us" />
```

### `client:only="react"` (React-only)
Use if you have SSR issues:

```astro
<ModalOverlay client:only="react" isOpen={false} onClose={() => {}} />
```

## Styled-Components Setup

### Option 1: Global Styles (Recommended)

Create `src/styles/global.css`:

```css
/* Reset and base styles */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  line-height: 1.6;
  color: #24292e;
}

a {
  text-decoration: none;
  color: inherit;
}

button {
  font-family: inherit;
}
```

Import in your layout:

```astro
---
import '../styles/global.css'
---
```

### Option 2: Theme Provider

Create `src/components/ThemeProvider.jsx`:

```jsx
import React from 'react'
import { ThemeProvider as StyledThemeProvider } from 'styled-components'

const theme = {
  colors: {
    primary: '#037dd6',
    primaryHover: '#1565c0',
    dark: '#24292e',
    light: '#f2f4f6',
    white: '#ffffff',
  },
  breakpoints: {
    mobile: '480px',
    tablet: '768px',
    desktop: '1200px',
  },
}

export const ThemeProvider = ({ children }) => (
  <StyledThemeProvider theme={theme}>
    {children}
  </StyledThemeProvider>
)
```

Wrap your components:

```astro
---
import { ThemeProvider } from '../components/ThemeProvider'
import { AnimatedButton } from '../components/interactive'
---

<ThemeProvider client:load>
  <AnimatedButton href="/download" text="Download" />
</ThemeProvider>
```

## GSAP Configuration

### For CallToAction Smooth Scroll

Install GSAP ScrollTo plugin:

```bash
npm install gsap
```

The CallToAction component already imports GSAP. No additional setup needed.

### Optional: Global GSAP Setup

If you want to use GSAP elsewhere, create `src/lib/gsap.js`:

```javascript
import { gsap } from 'gsap'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'

gsap.registerPlugin(ScrollToPlugin)

export { gsap }
```

## State Management

### Using React State

For components that need state (like ModalOverlay):

```astro
---
import { ModalOverlay } from '../components/interactive'
---

<ModalWrapper client:load />

<script>
  import React, { useState } from 'react'
  import { ModalOverlay } from '../components/interactive'

  function ModalWrapper() {
    const [isOpen, setIsOpen] = useState(false)

    return (
      <>
        <button onClick={() => setIsOpen(true)}>Open Modal</button>
        <ModalOverlay isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <h2>Modal Content</h2>
        </ModalOverlay>
      </>
    )
  }
</script>
```

### Using Astro Islands

Create a wrapper component `src/components/ModalButton.jsx`:

```jsx
import React, { useState } from 'react'
import { ModalOverlay } from './interactive'

export default function ModalButton({ buttonText, children }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button onClick={() => setIsOpen(true)}>{buttonText}</button>
      <ModalOverlay isOpen={isOpen} onClose={() => setIsOpen(false)}>
        {children}
      </ModalOverlay>
    </>
  )
}
```

Use in Astro:

```astro
---
import ModalButton from '../components/ModalButton'
---

<ModalButton client:load buttonText="Open Modal">
  <h2>Modal Content</h2>
  <p>Your content here</p>
</ModalButton>
```

## Performance Optimization

### 1. Code Splitting

Import only what you need:

```astro
---
// Good: Import specific components
import { AnimatedButton } from '../components/interactive'

// Avoid: Importing everything
import * as Interactive from '../components/interactive'
---
```

### 2. Lazy Loading

Use `client:visible` for below-the-fold components:

```astro
<section>
  <h2>FAQ</h2>
  <Accordion client:visible question="..." answer="..." />
  <Accordion client:visible question="..." answer="..." />
  <Accordion client:visible question="..." answer="..." />
</section>
```

### 3. Preload Critical Resources

For above-the-fold buttons with icons:

```astro
---
const iconUrl = '/images/icon.png'
---

<link rel="preload" href={iconUrl} as="image" />

<AnimatedButton
  client:load
  href="/download"
  text="Download"
  iconUrl={iconUrl}
/>
```

## Common Issues

### Issue: Styled-components SSR Warning

**Solution:** Add `client:only="react"` to the component:

```astro
<AnimatedButton client:only="react" href="/" text="Click" />
```

### Issue: GSAP Not Found

**Solution:** Ensure GSAP is installed:

```bash
npm install gsap
```

### Issue: Modal Not Closing

**Solution:** Ensure state is managed properly:

```jsx
const [isOpen, setIsOpen] = useState(false)

// Correct
<ModalOverlay isOpen={isOpen} onClose={() => setIsOpen(false)} />

// Wrong - missing state update
<ModalOverlay isOpen={isOpen} onClose={() => {}} />
```

### Issue: Accordion Not Animating

**Solution:** Ensure unique IDs for multiple accordions:

```astro
<Accordion id="faq-1" question="..." answer="..." />
<Accordion id="faq-2" question="..." answer="..." />
<Accordion id="faq-3" question="..." answer="..." />
```

## Example Page

Complete example `src/pages/demo.astro`:

```astro
---
import Layout from '../layouts/Layout.astro'
import {
  AnimatedButton,
  Accordion,
  CallToAction,
  FullWidthBanner,
} from '../components/interactive'
---

<Layout title="Interactive Components Demo">
  <main>
    <section>
      <h1>Interactive Components</h1>

      <h2>Buttons</h2>
      <AnimatedButton
        client:load
        href="/download"
        text="Download Now"
        variant="primary"
        gradient={true}
      />

      <h2>Accordion</h2>
      <Accordion
        client:visible
        id="faq-1"
        question="What is MetaMask?"
        answer="<p>MetaMask is a crypto wallet...</p>"
        backgroundColor="gradient"
      />

      <h2>Call to Action</h2>
      <CallToAction
        client:idle
        href="#features"
        text="Learn More"
        showRightArrow={true}
        align="center"
      />

      <h2>Full Width Banner</h2>
      <FullWidthBanner
        client:visible
        headline="Get Started Today"
        description="<p>Join millions of users worldwide</p>"
        ctas={[
          { text: 'Sign Up', href: '/signup', variant: 'primary' },
          { text: 'Learn More', href: '/about', variant: 'secondary' },
        ]}
        backgroundColor="dark"
      />
    </section>
  </main>
</Layout>
```

## TypeScript Support

If using TypeScript, create `src/components/interactive/types.d.ts`:

```typescript
declare module './AnimatedButton' {
  export interface AnimatedButtonProps {
    href: string
    text: string
    variant?: 'primary' | 'secondary' | 'white-outline'
    gradient?: boolean
    iconUrl?: string
    iconPosition?: 'start' | 'end'
    onClick?: (e: React.MouseEvent) => void
  }
  const AnimatedButton: React.FC<AnimatedButtonProps>
  export default AnimatedButton
}

// Add similar declarations for other components
```
