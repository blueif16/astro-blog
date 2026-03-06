import React from 'react';
import { ThemeProvider } from 'styled-components';
import { defaultTheme } from './metamask/layout/theme.js';

/**
 * Wrapper component to provide styled-components theme context
 * This ensures ThemeProvider works correctly with Astro's island architecture
 */
export default function StyledComponentsWrapper({ children }) {
  return (
    <ThemeProvider theme={defaultTheme}>
      {children}
    </ThemeProvider>
  );
}
