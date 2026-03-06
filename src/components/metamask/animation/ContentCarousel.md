# ContentCarousel

## Description
Generic carousel/slider component with custom arrow navigation and responsive breakpoints.

## Effect
Horizontal slide transitions between content items with custom styled navigation arrows. Supports infinite loop, autoplay, and configurable slide counts per breakpoint.

## Animation Libraries
- **react-slick** - Core carousel functionality with slide transitions

## Props
- `children` (ReactNode) - Slide content elements
- `items` (number, default: 1) - Number of slides to show on desktop
- `itemsOnMobile` (number, default: 1) - Number of slides on mobile (<480px)
- `itemsOnTablet` (number, default: 1) - Number of slides on tablet (<768px)
- `speed` (number, default: 500) - Transition speed in milliseconds
- `infinite` (boolean, default: true) - Enable infinite loop
- `dots` (boolean, default: false) - Show dot indicators
- `gap` (string, default: '10px') - Gap between slides
- `autoplay` (boolean, default: false) - Enable autoplay

## Preview
A flexible carousel with custom circular arrow buttons positioned below on mobile and on sides on desktop (>1300px). Arrows disable when reaching start/end in non-infinite mode.

## Dependencies
```json
{
  "react-slick": "^0.29.0",
  "slick-carousel": "^1.8.1",
  "styled-components": "^5.3.9"
}
```

## Original Source
`/Users/tk/Desktop/mm-temp/src/components/Carousel.js`

## Usage Example
```jsx
import ContentCarousel from './ContentCarousel'

<ContentCarousel items={3} itemsOnMobile={1} gap="20px" infinite>
  <div>Slide 1</div>
  <div>Slide 2</div>
  <div>Slide 3</div>
</ContentCarousel>
```
