# AnimatedFeatureSection

## Description
Flexible feature section with side-by-side image and content layout. Supports multiple alignment options, background images, and scroll-triggered animations.

## Effect
Split-screen layout with image on one side and content (eyebrow, headline, description, CTAs) on the other. Scroll-triggered fade-in animations from left or right based on content alignment. Responsive mobile view stacks vertically.

## Animation Libraries
- **react-animate-on-scroll** - Scroll-triggered fade animations (fadeInLeftMini, fadeInRightMini)

## Props
- `image` (object) - Main feature image `{ src, alt }`
- `imageMobile` (object) - Mobile-specific image
- `imageDarkMode` (object) - Dark mode image variant
- `imageMobileDarkMode` (object) - Dark mode mobile image
- `headline` (string) - Heading HTML
- `hideHeadline` (boolean, default: false) - Hide headline visually
- `description` (string) - Description HTML
- `eyebrow` (string) - Small text above headline
- `featureItems` (array) - Nested feature components
- `cta` (object) - Primary CTA button
- `ctaSecond` (object) - Secondary CTA button
- `embed` (object) - Video embed object
- `contentAlignment` (string, default: 'left') - 'left', 'right', 'center', 'vertical'
- `imageAlignment` (string) - Image alignment within container
- `imageWidth` (string) - Custom image width
- `animation` (boolean, default: true) - Enable scroll animations
- `backgroundColor` (string) - Background color variant
- `backgroundImage` (object) - Background image
- `backgroundImageDarkMode` (object) - Dark mode background
- `backgroundImageMobile` (object) - Mobile background
- `alignItemsCenter` (boolean, default: false) - Vertically center content
- `contentPaddingTop` (string) - Custom content padding-top
- `headlineMarginTop0` (boolean, default: false) - Remove headline top margin
- `sectionPadding` (string) - Custom section padding
- `noPaddingBottom` (boolean, default: false) - Remove bottom padding
- `imageShadow` (boolean, default: false) - Add drop shadow to image
- `hideImageOnMobile` (boolean, default: false) - Hide image on mobile
- `imageLink` (string) - Make image clickable with URL
- `customClass` (string) - Additional CSS classes
- `moduleId` (string) - HTML id attribute
- `children` (ReactNode) - CTA buttons and feature items

## Preview
Classic feature section with 50/50 split on desktop. Content alignment controls which side shows image vs text. Scroll animations fade content in from appropriate direction. Mobile view stacks image above content with centered text.

## Dependencies
```json
{
  "react-animate-on-scroll": "^2.1.7",
  "styled-components": "^5.3.9"
}
```

## Original Source
`/Users/tk/Desktop/mm-temp/src/components/Feature.js`

## Usage Example
```jsx
import AnimatedFeatureSection from './AnimatedFeatureSection'

<AnimatedFeatureSection
  headline="<h2>Secure Your Assets</h2>"
  description="<p>Bank-level encryption protects your crypto</p>"
  image={{ src: '/security.png', alt: 'Security' }}
  contentAlignment="left"
  animation
  imageShadow
>
  <a href="/learn-more">Learn More</a>
</AnimatedFeatureSection>
```
