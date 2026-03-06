/**
 * Lenis Smooth Scroll Initialization
 *
 * Extracted from MetaMask PortfolioMapSidebar.js (lines 179-204)
 *
 * Usage in Astro:
 * 1. Install: npm install @studio-freight/lenis @studio-freight/hamo
 * 2. Import in your layout component
 * 3. Call initSmoothScroll() on mount
 * 4. Call cleanup function on unmount
 *
 * Example (React component in Astro):
 * ```jsx
 * import { useEffect } from 'react'
 * import { initSmoothScroll } from './smooth-scroll'
 *
 * function Layout() {
 *   useEffect(() => {
 *     const cleanup = initSmoothScroll()
 *     return cleanup
 *   }, [])
 *
 *   return <div>...</div>
 * }
 * ```
 *
 * Example (Vanilla JS in Astro):
 * ```astro
 * ---
 * // In your layout .astro file
 * ---
 * <script>
 *   import { initSmoothScroll } from './smooth-scroll'
 *   initSmoothScroll()
 * </script>
 * ```
 *
 * Configuration:
 * - lerp: Smoothness (0-1). Lower = smoother. Windows/Safari use 1 for performance.
 * - wheelMultiplier: Scroll speed multiplier
 * - smoothTouch: Disable on mobile for native feel
 * - wrapper: Element with overflow (default: window)
 * - content: Scrollable content element (default: document.documentElement)
 */

import Lenis from '@studio-freight/lenis'
import { useFrame } from '@studio-freight/hamo'

/**
 * Device detection for optimal lerp values
 */
function detectDevice() {
  const isWindows = navigator.platform.indexOf('Win') > -1
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
  return { isWindows, isSafari }
}

/**
 * Initialize Lenis smooth scroll
 * @param {Object} options - Configuration options
 * @param {HTMLElement} options.wrapper - Element with overflow (optional)
 * @param {HTMLElement} options.content - Scrollable content element (optional)
 * @param {number} options.lerp - Smoothness factor (optional, auto-detected)
 * @param {number} options.wheelMultiplier - Scroll speed (optional, auto-detected)
 * @returns {Function} Cleanup function to destroy Lenis instance
 */
export function initSmoothScroll(options = {}) {
  const { isWindows, isSafari } = detectDevice()

  // Device-specific performance optimizations
  const lerp = options.lerp ?? (isWindows || isSafari ? 1 : 0.2)
  const wheelMultiplier = options.wheelMultiplier ?? (isWindows || isSafari ? 1 : 0.7)

  const lenis = new Lenis({
    wrapper: options.wrapper, // undefined = window
    content: options.content, // undefined = document.documentElement
    lerp: lerp,
    smoothWheel: true,
    normalizeWheel: true,
    wheelMultiplier: wheelMultiplier,
    smoothTouch: false, // Disable on mobile for native feel
    touchInertiaMultiplier: 15,
    syncTouch: true,
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    infinite: false,
  })

  lenis.start()

  // RAF loop using hamo (or use requestAnimationFrame)
  let rafId
  function raf(time) {
    lenis.raf(time)
    rafId = requestAnimationFrame(raf)
  }
  rafId = requestAnimationFrame(raf)

  // Cleanup function
  return () => {
    cancelAnimationFrame(rafId)
    lenis.destroy()
  }
}

/**
 * React Hook version for use in React components
 * @param {Object} options - Configuration options
 */
export function useSmoothScroll(options = {}) {
  const { isWindows, isSafari } = detectDevice()
  const lerp = options.lerp ?? (isWindows || isSafari ? 1 : 0.2)
  const wheelMultiplier = options.wheelMultiplier ?? (isWindows || isSafari ? 1 : 0.7)

  const [lenis, setLenis] = React.useState(null)

  React.useEffect(() => {
    const lenisInstance = new Lenis({
      wrapper: options.wrapper,
      content: options.content,
      lerp: lerp,
      smoothWheel: true,
      normalizeWheel: true,
      wheelMultiplier: wheelMultiplier,
      smoothTouch: false,
      touchInertiaMultiplier: 15,
      syncTouch: true,
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      infinite: false,
    })

    lenisInstance.start()
    setLenis(lenisInstance)

    return () => {
      lenisInstance.destroy()
    }
  }, [lerp, wheelMultiplier])

  // Use hamo's useFrame for RAF loop
  useFrame(time => {
    lenis?.raf(time)
  }, [lenis])

  return lenis
}

/**
 * Scroll to element or position
 * @param {Lenis} lenis - Lenis instance
 * @param {number|string|HTMLElement} target - Scroll target (number, selector, or element)
 * @param {Object} options - Scroll options
 */
export function scrollTo(lenis, target, options = {}) {
  if (!lenis) return
  lenis.scrollTo(target, options)
}

/**
 * Example: Custom scroll progress indicator
 * @param {Lenis} lenis - Lenis instance
 * @param {Function} callback - Callback with scroll data
 */
export function onScroll(lenis, callback) {
  if (!lenis) return
  lenis.on('scroll', callback)
  return () => lenis.off('scroll', callback)
}
