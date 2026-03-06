# PageShell Component

Root layout component with ThemeProvider and global styles.

## Props

- `children`: React nodes (required)
- `theme`: Theme object override (optional)
- `h2FontSize`: Custom H2 font size (optional)
- `themeColor`: 'dark' or 'light' (optional)
- `widerContainer`: Boolean for wider max-width (optional)

## Usage

```jsx
import PageShell from './PageShell'
import { defaultTheme } from './theme'

function App() {
  return (
    <PageShell theme={defaultTheme} themeColor="dark">
      <Header />
      <main>
        <Content />
      </main>
      <Footer />
    </PageShell>
  )
}
```

## Usage in Astro

```astro
---
import PageShell from './layout/PageShell.jsx'
import { defaultTheme } from './layout/theme.js'
---

<PageShell theme={defaultTheme} client:load>
  <slot />
</PageShell>
```

## Features

- Wraps content with styled-components ThemeProvider
- Applies global theme object to all styled-components
- Handles overflow-x clipping
- Supports theme color variants (dark/light)
- Custom H2 font size override
- Wider container option

## Theme Color Variants

### theme-dark
Applies dark theme styling:
- Font size: 18px
- Line height: 25px
- Background: #f2f4f6 (light mode) or #121212 (dark mode)
- Link color: Uses theme.linkColor
- Link hover: 0.9 opacity

## Custom H2 Font Size

```jsx
<PageShell h2FontSize="48px">
  <h2>Custom sized heading</h2>
</PageShell>
```

Applies custom font size to all H2 elements on tablet+ screens.

## Wider Container

```jsx
<PageShell widerContainer>
  <div>Wider max-width content</div>
</PageShell>
```

Adds `wider-container` class to wrapper for custom styling.

## Removed Dependencies

Original component used:
- Gatsby's `useStaticQuery` and `graphql` - Removed
- React Helmet for meta tags - Removed (use Astro's `<head>`)
- Contentful data fetching - Removed

Replace with Astro's built-in features:
```astro
---
const title = "My Site"
const description = "Site description"
---

<head>
  <title>{title}</title>
  <meta name="description" content={description} />
</head>
```
