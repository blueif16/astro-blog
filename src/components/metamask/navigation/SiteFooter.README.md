# SiteFooter Component

Footer with link columns, extracted from MetaMask website.

## Features

- Multi-column link layout
- Responsive grid (stacks on mobile)
- Dark mode support
- Logo display
- Copyright text
- Styled link columns with headings

## Props Structure

```javascript
{
  // Logo configuration
  logo: {
    logo: '/path/to/logo.svg',           // Light mode logo
    logoDarkMode: '/path/to/logo-dark.svg' // Dark mode logo (optional)
  },

  // Footer menu columns
  menus: [
    {
      title: 'Products',                 // Column heading
      items: [
        { title: 'Wallet', href: '/wallet' },
        { title: 'Extension', href: '/extension' },
        { title: 'Mobile App', href: '/mobile' }
      ]
    },
    {
      title: 'Developers',
      items: [
        { title: 'Documentation', href: '/docs' },
        { title: 'API Reference', href: '/api' }
      ]
    },
    {
      title: 'Company',
      items: [
        { title: 'About', href: '/about' },
        { title: 'Careers', href: '/careers' },
        { title: 'Blog', href: '/blog' }
      ]
    },
    {
      title: 'Support',
      items: [
        { title: 'Help Center', href: '/help' },
        { title: 'Contact', href: '/contact' }
      ]
    }
  ],

  // Copyright text
  copyright: '© 2026 Your Company. All rights reserved.',

  // Dark mode state
  isDarkMode: false
}
```

## Layout Behavior

### Desktop Layout
- Grid layout with equal-width columns
- Number of columns determined by `menus.length`
- Max width: 1200px (centered)
- Gap: 20px between columns

### Mobile Layout
- Stacks vertically
- Full width columns
- Maintains visual hierarchy

## Integration with Astro

### Basic Usage

```astro
---
import SiteFooter from './SiteFooter.jsx'

const footerProps = {
  logo: {
    logo: '/logo.svg',
    logoDarkMode: '/logo-dark.svg'
  },
  menus: [
    {
      title: 'Products',
      items: [
        { title: 'Wallet', href: '/wallet' },
        { title: 'Extension', href: '/extension' }
      ]
    },
    {
      title: 'Resources',
      items: [
        { title: 'Docs', href: '/docs' },
        { title: 'Blog', href: '/blog' }
      ]
    }
  ],
  copyright: '© 2026 Your Company',
  isDarkMode: false
}
---

<SiteFooter {...footerProps} client:load />
```

### With Dark Mode

```astro
---
// Sync with header dark mode state
const isDarkMode = Astro.cookies.get('darkMode')?.boolean() || false
---

<SiteFooter
  {...footerProps}
  isDarkMode={isDarkMode}
  client:load
/>
```

### Static Rendering (No Interactivity)

Since the footer has no interactive elements, you can use `client:only` or even render it server-side:

```astro
<SiteFooter {...footerProps} client:only="react" />
```

Or for pure SSR (requires converting to Astro component):

```astro
<!-- Convert to native Astro component for best performance -->
```

## Dependencies

- `react` - Core React library
- `styled-components` - CSS-in-JS styling
- `prop-types` - Runtime prop validation

## Styling Notes

- Background: `#e9ebee` (light) / `#3c444b` (dark)
- Column headings: Orange (`#f6851b`), uppercase
- Links: Default text color with blue hover (`#037dd6`)
- Dark mode via `.dark-mode` class on `<body>`
- Breakpoint: 768px (tablet)

## Customization

### Change Column Count
The grid automatically adjusts based on `menus.length`. For fixed columns:

```javascript
// In ColumnWrapper styled component
grid-template-columns: repeat(4, 1fr); // Always 4 columns
```

### Change Colors

```javascript
// Column headings
color: #f6851b; // Orange

// Link hover
&:hover {
  color: #037dd6; // Blue
}

// Background
background-color: #e9ebee; // Light gray
```

### Add Social Icons

```javascript
// Add to props
socialLinks: [
  { icon: 'twitter', href: 'https://twitter.com/...' },
  { icon: 'github', href: 'https://github.com/...' }
]

// Render in SubFooterContainer
<SocialLinks>
  {socialLinks.map(link => (
    <a key={link.icon} href={link.href}>
      <Icon name={link.icon} />
    </a>
  ))}
</SocialLinks>
```

## Performance Notes

- No animations or JavaScript interactions
- Can be server-side rendered
- Minimal bundle size
- Consider converting to native Astro component for zero JS

## Browser Support

- Modern browsers (ES6+)
- Mobile responsive
- No JavaScript required for functionality
