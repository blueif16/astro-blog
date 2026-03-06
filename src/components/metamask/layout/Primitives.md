# Styled Primitives

Shared styled-components for consistent UI elements.

## Components

### Section
Main section container with responsive padding (48px default).

```jsx
import { Section } from './Primitives'

<Section>
  <h1>Content</h1>
</Section>

// Custom padding
<Section sectionPadding="80px">
  <h1>More padding</h1>
</Section>

// With utility classes
<Section className="noPaddingBottom">
  <h1>No bottom padding</h1>
</Section>
```

**Utility Classes:**
- `noPaddingBottom` / `custom-noPaddingBottom` - Remove bottom padding
- `noPaddingTop` / `custom-noPaddingTop` - Remove top padding
- `sectionPb48` - 48px bottom padding
- `sectionPt48` - 48px top padding
- `removeSectionPaddingBottomOnDesktop` - Remove bottom padding on tablet+

### SectionTitle
H2 heading with responsive sizing.

```jsx
import { SectionTitle } from './Primitives'

<SectionTitle>My Heading</SectionTitle>
```

- Desktop: Inherits parent font-size
- Mobile: 28px font-size, 46px line-height

### FooterTitle
Uppercase footer section titles.

```jsx
import { FooterTitle } from './Primitives'

<FooterTitle>Company</FooterTitle>
```

- Color: White
- Font size: 1rem (16px)
- Font weight: 600 (semiBold)
- Text transform: uppercase

### EyebrowStyle
Small uppercase label text (orange accent).

```jsx
import { EyebrowStyle } from './Primitives'

<EyebrowStyle>New Feature</EyebrowStyle>
```

- Color: Orange (#f6851b)
- Font weight: 700
- Letter spacing: 5px
- Margin bottom: 16px

**Modifier Classes:**
- `eyebrowSize13` - 13px font size
- `eyebrowLetterSpacing3` - 3px letter spacing

### ModalInner
Modal dialog container with scrolling.

```jsx
import { ModalInner } from './Primitives'

<ModalInner width="600px">
  <h2 className="popupTitle">Modal Title</h2>
  <p>Content</p>
</ModalInner>

// Keep light mode in dark theme
<ModalInner $keepLightMode>
  <p>Always light background</p>
</ModalInner>
```

- Border radius: 24px
- Max height: 80vh (85vh on mobile)
- Padding: 30px
- Scrollable overflow

### IconCloseModal
Close button for modals.

```jsx
import { IconCloseModal } from './Primitives'

<IconCloseModal onClick={handleClose}>×</IconCloseModal>
```

- Position: Absolute (top: 30px, right: 30px)
- Size: 24px × 36px
- Font size: 20px
- Cursor: pointer

## Usage Example

```jsx
import { Section, SectionTitle, EyebrowStyle } from './Primitives'

function FeatureSection() {
  return (
    <Section sectionPadding="80px">
      <EyebrowStyle>New</EyebrowStyle>
      <SectionTitle>Amazing Feature</SectionTitle>
      <p>Description here...</p>
    </Section>
  )
}
```
