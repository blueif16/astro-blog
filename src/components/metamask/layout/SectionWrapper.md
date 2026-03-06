# SectionWrapper Component

Responsive section container with configurable padding and max-width.

## Props

- `size`: 'wide' (1200px) or 'normal' (992px, default)
- `customClass`: Additional CSS classes
- `styleOverride`: Custom CSS string to inject
- `...rest`: Any other props passed to container

## Usage

```jsx
import SectionWrapper from './SectionWrapper'

// Normal width (992px)
<SectionWrapper>
  <h1>Content</h1>
</SectionWrapper>

// Wide width (1200px)
<SectionWrapper size="wide">
  <h1>Wide content</h1>
</SectionWrapper>

// With custom class
<SectionWrapper customClass="overlap-bg-32">
  <h1>Overlapping section</h1>
</SectionWrapper>

// With style override
<SectionWrapper styleOverride="background: red;">
  <h1>Custom styles</h1>
</SectionWrapper>
```

## Built-in Classes

Apply via `customClass` prop:

- `overlap-bg-32` - Translates section up 32px with margin
- `overflowHidden` - Hides overflow
- `addMoreDesktopPb56` - Adds 56px bottom padding on tablet+

## CSS Variables

Set in your global CSS:
```css
:root {
  --container-width: 992px;
  --container-width-miniDesktop: 784px;
}
```

## Responsive Behavior

- Mobile: 20px horizontal padding
- Tablet+: Max-width 992px (or 1200px if `size="wide"`)
- Mini Desktop: Max-width 784px
