# AnimatedCarousel

## Description
Feature slider with clickable titles that reveal descriptions and switch images. Includes scroll-triggered animations and optional auto-rotation.

## Effect
Horizontal content slider with interactive title tabs. Clicking a title activates it (color change, description reveal) and switches the displayed image. Optional 5-second auto-rotation. Scroll-triggered fade-in animations on initial view.

## Animation Libraries
- **react-animate-on-scroll** - Scroll-triggered fade animations (fadeInLeftMini, fadeInRightMini)
- **CSS transitions** - Title color changes (0.3s), description reveal (opacity/max-height)

## Props
- `headline` (string) - Main heading HTML
- `description` (string) - Description HTML
- `featureSliderItems` (array) - Slide items: `{ title, description, image, imageMobile, customClass }`
- `layoutType` (string) - Layout variant class
- `sectionPadding` (string) - Custom padding
- `slideShow` (boolean, default: false) - Enable 5s auto-rotation
- `animation` (boolean, default: true) - Enable scroll animations
- `cta` (object) - Primary CTA button
- `ctaSecond` (object) - Secondary CTA button
- `backgroundColor` (string) - Background color variant
- `customClass` (string) - Additional classes
- `children` (ReactNode) - CTA button components

## Preview
Split-screen layout: left side shows clickable title list with expanding descriptions, right side displays corresponding images. Titles are gray by default, active title turns dark with blue indicator. Mobile view stacks vertically with images below each description.

## Dependencies
```json
{
  "react-animate-on-scroll": "^2.1.7",
  "styled-components": "^5.3.9"
}
```

## Original Source
`/Users/tk/Desktop/mm-temp/src/components/FeatureSlider.js`

## Usage Example
```jsx
import AnimatedCarousel from './AnimatedCarousel'

<AnimatedCarousel
  headline="<h2>Key Features</h2>"
  featureSliderItems={[
    {
      title: 'Security',
      description: '<p>Bank-level encryption</p>',
      image: '/security.png'
    },
    {
      title: 'Speed',
      description: '<p>Lightning fast</p>',
      image: '/speed.png'
    }
  ]}
  slideShow
  animation
/>
```
