# theme.js

Complete MetaMask design system with colors, typography, spacing, breakpoints, and shadows.

## Exports

- `theme` (default) - Base theme tokens
- `defaultTheme` - Light theme with blue primary
- `defaultDarkTheme` - Dark theme with blue primary
- `purpleTheme` - Light theme with purple primary
- `purpleDarkTheme` - Dark theme with purple primary
- `darkTheme` - Light theme with black primary
- `darkDarkTheme` - Dark theme with white on black

## Usage

```jsx
import { ThemeProvider } from 'styled-components'
import { defaultTheme } from './theme'

<ThemeProvider theme={defaultTheme}>
  <App />
</ThemeProvider>
```

Access in styled-components:
```jsx
const Button = styled.button`
  background: ${({ theme }) => theme.primaryColor};
  font-size: ${({ theme }) => theme.font.size.lg}rem;

  @media (min-width: ${({ theme }) => theme.device.tablet}) {
    padding: 20px;
  }
`
```

## Key Tokens

### Colors
- **Primary Blues**: `darkBlue` (#037dd6), `darkerBlue` (#1565c0), `lightBlue` (#2196f3)
- **Purple**: `darkPurple` (#9F6FF0), `darkerPurple` (#8A42AD), `lightPurple` (#A495FF)
- **Brand**: `orange` (#f6851b)
- **Grayscale**: `white`, `black`, `darker` (#121212), `dark` (#24292E), `gray` (#F7F9FB)

### Typography (rem-based)
- x5: 3.8125rem (61px)
- xxxl: 3rem (48px)
- xxl: 2rem (32px)
- xl: 1.5rem (24px)
- lg: 1.25rem (20px)
- md: 1rem (16px)
- sm: 0.875rem (14px)

### Font Weights
- thin: 100
- light: 300
- regular: 400
- medium: 500
- semiBold: 600
- bold: 700
- black: 900

### Breakpoints
- mobile: 480px
- tablet: 768px
- miniDesktop: 992px
- desktop: 1200px
- twoKResolutionMax: 2048px

### Shadows
- extraLight: `0px 0px 20px rgba(0, 0, 0, 0.07)`
- light: `0px 0px 20px rgba(0, 0, 0, 0.1)`
- medium: `0px 4px 10px rgba(0, 0, 0, 0.25)`

### Easing
- defaultMM1: `cubic-bezier(0.5,0.14,0,1.01)`
