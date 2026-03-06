# MetaMask Component Library Catalog

Extracted from MetaMask website - production-ready React components with animations and interactions.

## Component Inventory

| Component | Category | Effect Type | Animation Libraries | Key Props | Use Case |
|-----------|----------|-------------|-------------------|-----------|----------|
| **AnimatedLogo** | animation | Mouse-tracking 3D | @metamask/logo (WebGL) | logoType, width, height, followMouse | Interactive 3D logo (fox/flask) with mouse tracking |
| **Interactive3DModel** | animation | 3D WebGL rendering | @metamask/logo, Three.js | phi, theta, distance, followMouse, enableZoom | Responsive 3D MetaMask fox with camera controls |
| **AnimatedFeatureSection** | animation | Scroll-triggered reveal | react-animate-on-scroll, styled-components | image, headline, description, contentAlignment, animation | Side-by-side feature sections with fade-in animations |
| **AnimatedCarousel** | animation | Auto-rotation slider | react-animate-on-scroll, styled-components | featureSliderItems, slideShow, animation | Feature carousel with clickable titles and auto-rotation |
| **ContentCarousel** | animation | Slide transitions | react-slick, styled-components | items, speed, infinite, autoplay, gap | Generic carousel with custom navigation arrows |
| **SectionWrapper** | layout | Container | styled-components | size, customClass, styleOverride | Responsive section container (992px/1200px max-width) |
| **PageShell** | layout | Page wrapper | styled-components | children | Full page layout wrapper with theme support |
| **Primitives** | layout | Base elements | styled-components | variant, size | Reusable styled primitives (buttons, containers, text) |
| **CallToAction** | interactive | Hover animation | GSAP, styled-components | href, text, typeLayout, showRightArrow, color | CTA links with smooth scroll and hover effects |
| **AnimatedButton** | interactive | Hover/click states | styled-components | href, text, variant, gradient, iconUrl | Button with color transitions and icon support |
| **Accordion** | interactive | Expand/collapse | styled-components | question, answer, backgroundColor, defaultOpen | FAQ accordion with smooth height transitions |
| **ModalOverlay** | interactive | Fade in/out | styled-components | isOpen, onClose, children | Modal dialog with backdrop and close handlers |
| **FullWidthBanner** | interactive | Background effects | styled-components | backgroundImage, headline, cta | Full-width hero banner with background image |
| **SiteHeader** | navigation | Sticky header | styled-components, react-responsive | logo, menus, downloadButton, isSticky, isDarkMode | Responsive header with mobile menu and dark mode |
| **SiteFooter** | navigation | Footer layout | styled-components | links, socialLinks, copyright | Site footer with link columns and social icons |

## Animation Libraries Used

- **@metamask/logo**: WebGL-based 3D logo rendering with Three.js
- **GSAP**: Smooth scroll animations and timeline controls
- **react-animate-on-scroll**: Scroll-triggered CSS animations
- **react-slick**: Carousel/slider functionality
- **styled-components**: CSS-in-JS with theme support

## Installation Requirements

```bash
npm install @metamask/logo gsap react-animate-on-scroll react-slick styled-components react-responsive classnames prop-types
```

## Usage Notes

1. **3D Components** (AnimatedLogo, Interactive3DModel): Heavy WebGL usage - consider lazy loading
2. **Scroll Animations**: Use `animation={true}` prop to enable/disable scroll effects
3. **Responsive**: All components include mobile breakpoints (768px, 1200px)
4. **Dark Mode**: SiteHeader supports dark mode toggle
5. **Styled Components**: Requires ThemeProvider for full theme support

## Directory Structure

```
src/components/metamask/
├── animation/          # Scroll & 3D animations
├── layout/            # Page structure & containers
├── interactive/       # Buttons, CTAs, modals, accordions
├── navigation/        # Header & footer
├── CATALOG.md         # This file
└── index.js           # Barrel exports
```

## Component Dependencies

- All components use **styled-components** for styling
- Animation components require **react-animate-on-scroll** CSS (import in your global styles)
- 3D components require **@metamask/logo** package and mesh JSON files
- Header requires **react-responsive** for media queries
