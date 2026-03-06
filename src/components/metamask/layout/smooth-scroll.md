# Lenis Smooth Scroll

Smooth scrolling implementation extracted from MetaMask website.

## Installation

```bash
npm install @studio-freight/lenis @studio-freight/hamo
```

## Functions

### initSmoothScroll(options)
Initialize smooth scroll (vanilla JS).

**Returns:** Cleanup function to destroy Lenis instance

**Options:**
- `wrapper`: Element with overflow (default: window)
- `content`: Scrollable content element (default: document.documentElement)
- `lerp`: Smoothness 0-1 (auto-detected based on device)
- `wheelMultiplier`: Scroll speed multiplier (auto-detected)

### useSmoothScroll(options)
React hook version for use in React components.

**Returns:** Lenis instance

### scrollTo(lenis, target, options)
Programmatic scrolling.

**Parameters:**
- `lenis`: Lenis instance
- `target`: Number (px), string (selector), or HTMLElement
- `options`: Scroll options (duration, offset, etc.)

### onScroll(lenis, callback)
Scroll event listener.

**Returns:** Cleanup function

## Usage

### Vanilla JS in Astro

```astro
<script>
  import { initSmoothScroll } from './smooth-scroll.js'

  const cleanup = initSmoothScroll()

  // Optional: cleanup on page unload
  window.addEventListener('beforeunload', cleanup)
</script>
```

### React Component

```jsx
import { useEffect } from 'react'
import { initSmoothScroll } from './smooth-scroll'

function Layout({ children }) {
  useEffect(() => {
    const cleanup = initSmoothScroll()
    return cleanup
  }, [])

  return <div>{children}</div>
}
```

### React Hook

```jsx
import { useSmoothScroll, scrollTo } from './smooth-scroll'

function MyComponent() {
  const lenis = useSmoothScroll()

  const handleClick = () => {
    scrollTo(lenis, '#section-2', { duration: 1.5 })
  }

  return <button onClick={handleClick}>Scroll to Section 2</button>
}
```

### Custom Scroll Container

```jsx
import { useRef, useEffect } from 'react'
import { initSmoothScroll } from './smooth-scroll'

function ScrollablePanel() {
  const wrapperRef = useRef()
  const contentRef = useRef()

  useEffect(() => {
    const cleanup = initSmoothScroll({
      wrapper: wrapperRef.current,
      content: contentRef.current,
    })
    return cleanup
  }, [])

  return (
    <div ref={wrapperRef} style={{ height: '500px', overflow: 'auto' }}>
      <div ref={contentRef}>
        <p>Scrollable content...</p>
      </div>
    </div>
  )
}
```

### Scroll Progress Indicator

```jsx
import { useSmoothScroll, onScroll } from './smooth-scroll'
import { useState, useEffect } from 'react'

function ScrollProgress() {
  const lenis = useSmoothScroll()
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!lenis) return
    return onScroll(lenis, (e) => {
      setProgress(e.progress)
    })
  }, [lenis])

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: `${progress * 100}%`,
      height: '4px',
      background: 'blue'
    }} />
  )
}
```

## Configuration

### Device-Specific Optimizations

The library auto-detects Windows and Safari for optimal performance:

- **Windows/Safari**: `lerp: 1`, `wheelMultiplier: 1` (instant, no smoothing)
- **Other devices**: `lerp: 0.2`, `wheelMultiplier: 0.7` (smooth scrolling)

Override with custom values:
```js
initSmoothScroll({
  lerp: 0.1,  // More smooth
  wheelMultiplier: 0.5,  // Slower scroll
})
```

### Options Reference

```js
{
  wrapper: undefined,              // Element with overflow (default: window)
  content: undefined,              // Scrollable content (default: document.documentElement)
  lerp: 0.2,                       // Smoothness (0-1, lower = smoother)
  smoothWheel: true,               // Enable smooth wheel scrolling
  normalizeWheel: true,            // Normalize wheel delta across browsers
  wheelMultiplier: 0.7,            // Scroll speed multiplier
  smoothTouch: false,              // Disable on mobile for native feel
  touchInertiaMultiplier: 15,      // Touch inertia
  syncTouch: true,                 // Sync touch events
  orientation: 'vertical',         // Scroll direction
  gestureOrientation: 'vertical',  // Gesture direction
  infinite: false,                 // Infinite scroll
}
```

## Original Location

Extracted from: `/Users/tk/Desktop/mm-temp/src/components/PortfolioPage/Map/Sidebar/PortfolioMapSidebar.js` (lines 179-204)

**Note:** Lenis was NOT globally initialized in the original MetaMask site. It was only used locally in the PortfolioMapSidebar component for a specific scrollable sidebar.

## Performance Notes

- Lenis uses RAF (requestAnimationFrame) for smooth 60fps scrolling
- Device detection optimizes for Windows/Safari (instant scroll)
- Mobile uses native scrolling (`smoothTouch: false`) for better performance
- Cleanup function properly destroys instance and cancels RAF loop
