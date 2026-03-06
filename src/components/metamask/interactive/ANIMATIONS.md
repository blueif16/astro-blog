# Animation Patterns Summary

## Extracted Components Animation Details

### 1. AnimatedButton.jsx
**Animation Type:** CSS Transitions
- **Hover State:** Background color, border color, color transitions (300ms ease)
- **Hide State:** Opacity fade (300ms ease)
- **Arrow Animation:** Margin-left shift on hover (6px)
- **No JavaScript:** Pure CSS animations

### 2. Accordion.jsx
**Animation Type:** CSS Transitions + Transform
- **Expand/Collapse:** Max-height transition (500ms ease)
  - Closed: `max-height: 0`
  - Open: `max-height: 2000px`
- **Icon Rotation:** Transform rotate (400ms ease)
  - Closed: `rotate(0deg)`
  - Open: `rotate(45deg)` (plus icon becomes X)
- **Hover State:** Opacity change on question button
- **No JavaScript Animation:** State-driven CSS only

### 3. CallToAction.jsx
**Animation Type:** GSAP + CSS Transitions
- **GSAP Smooth Scroll:** Anchor link scrolling
  - Duration: 700ms
  - Offset: 100px from top
  - Easing: GSAP default
  - Auto-kill on user scroll
- **Arrow Hover:** TranslateX animation
  - Right arrow: `translateX(4px)`
  - Left arrow: `translateX(-4px)`
- **Color Transitions:** 150ms ease on hover
- **JavaScript Required:** GSAP for smooth scroll only

### 4. FullWidthBanner.jsx
**Animation Type:** CSS Transitions
- **Button Hover:** Background, border, color transitions (300ms ease)
- **No Complex Animations:** Simple hover states
- **Responsive:** Mobile-first layout shifts

### 5. ModalOverlay.jsx
**Animation Type:** CSS Keyframes + Transitions
- **Backdrop Fade-In:** Keyframe animation (200ms)
  - From: `opacity: 0`
  - To: `opacity: 1`
- **Modal Slide-Up:** Keyframe animation (300ms)
  - From: `translateY(20px)`, `opacity: 0`
  - To: `translateY(0)`, `opacity: 1`
- **Close Button Hover:** Background color transition (200ms ease)
- **Body Scroll Lock:** JavaScript-based
  - Calculates scrollbar width
  - Adds padding-right to prevent layout shift
  - Sets `overflow: hidden` on body

## Animation Libraries Required

### GSAP (gsap@^3.12.0)
**Used in:** CallToAction.jsx only
**Purpose:** Smooth scroll for anchor links
**Can be removed if:** You don't need smooth scroll (use native browser scroll)

### CSS Transitions (Native)
**Used in:** All components
**No installation required**

### Styled-Components (^5.3.0 || ^6.0.0)
**Used in:** All components
**Purpose:** CSS-in-JS styling

## Performance Notes

- **No wobble library:** Original used wobble for spring physics, removed
- **No react-animate-height:** Replaced with CSS max-height transition
- **No react-animate-on-scroll:** Not needed for these components
- **Lightweight:** Total ~1,400 lines of code vs. ~5,500 in originals

## Browser Compatibility

All animations work in:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- iOS Safari 14+
- Chrome Android 90+

## Stripped Animation Dependencies

❌ **Removed:**
- `wobble` - Spring physics (not used in extracted components)
- `react-animate-height` - Replaced with CSS
- `react-animate-on-scroll` - Not needed
- `@studio-freight/lenis` - Smooth scroll (not in these components)
- `@studio-freight/hamo` - Animation frame management (not needed)

✅ **Kept:**
- `gsap` - Only for CallToAction smooth scroll
- CSS transitions/transforms - All components
- CSS keyframes - ModalOverlay only
