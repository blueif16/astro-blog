/**
 * PageShell Component
 *
 * Root layout component with ThemeProvider and global styles.
 *
 * Usage in Astro:
 * 1. Import in your layout component
 * 2. Wrap page content with PageShell
 * 3. Pass theme variant: 'default', 'dark', 'purple'
 * 4. Optional props: h2FontSize, themeColor, widerContainer
 *
 * Example:
 * <PageShell theme="default" themeColor="dark">
 *   <slot />
 * </PageShell>
 *
 * Note: Gatsby/Contentful dependencies removed. Add your own meta tags.
 */

import React from 'react'
import PropTypes from 'prop-types'
import styled, { ThemeProvider } from 'styled-components'
import classnames from 'classnames'
import globalTheme from './theme'

const PageShell = props => {
  const {
    children,
    theme = {},
    h2FontSize,
    themeColor,
    widerContainer,
  } = props

  return (
    <ThemeProvider theme={{ ...globalTheme, ...theme }}>
      <Wrapper
        h2FontSize={h2FontSize}
        className={classnames({
          [`theme-${themeColor}`]: themeColor,
          'wider-container': widerContainer,
        })}
      >
        {children}
      </Wrapper>
    </ThemeProvider>
  )
}

PageShell.propTypes = {
  children: PropTypes.node.isRequired,
  theme: PropTypes.object,
  h2FontSize: PropTypes.string,
  themeColor: PropTypes.oneOf(['dark', 'light']),
  widerContainer: PropTypes.bool,
}

export default PageShell

const Wrapper = styled.div`
  overflow-x: clip;
  ${({ h2FontSize, theme }) =>
    h2FontSize
      ? `
  h2 {
    @media (min-width: ${theme.device.tablet}){
      font-size: ${h2FontSize};
      line-height: 1.2;
    }
  }
  `
      : ''}

  &.theme-dark {
    font-size: 18px;
    line-height: 25px;
    background: #f2f4f6;
    color: #222;

    .dark-mode & {
      background: #121212;
      color: #fff;
    }

    a:not(.button) {
      color: ${({ theme }) => theme.linkColor};
    }
    a:not(.cardLink):hover {
      opacity: 0.9;
    }
  }
`
