/**
 * MetaMask Design System Theme
 *
 * Complete theme object with colors, typography, spacing, breakpoints, and shadows.
 * Extracted from MetaMask website for Astro integration.
 *
 * Usage:
 * - Import and pass to styled-components ThemeProvider
 * - Access via props: ${({ theme }) => theme.primaryColor}
 * - Multiple theme variants available: default, dark, purple
 */

const theme = {
  // Brand Colors
  textColor: '#24292E',
  darkerBlue: '#1565c0',
  darkBlue: '#037dd6',
  lightBlue: '#2196f3',
  white: '#FFFFFF',
  black: '#000000',
  darker: '#121212',
  gray: '#F7F9FB',
  darkGray: '#6A737D',
  dark: '#24292E',
  darkLight: '#393E46',
  orange: '#f6851b',
  cookiesBg: '#151C24',
  darkerPurple: '#8A42AD',
  darkPurple: '#9F6FF0',
  lightPurple: '#A495FF',
  disclaimerBg: '#e8f1f9',
  blue: {
    400: '#1098fc',
  },
  danger: '#D73A49',

  // Container Widths
  wrapper: {
    margin: '0 auto',
    maxWidth: '100%',
    padding: 0,
  },
  container: {
    cover: '100%',
    full: '100%',
    wide: '1160px',
    narrow: '58.75em',
  },

  // Typography Scale (rem values)
  font: {
    size: {
      x5: 3.8125,    // 61px
      x4: 3.375,     // 54px
      xxxl: 3,       // 48px
      xxl: 2,        // 32px
      xl: 1.5,       // 24px
      lg: 1.25,      // 20px
      md: 1,         // 16px
      sm: 0.875,     // 14px
      xxs: 0.8125,   // 13px
      xs: 0.75,      // 12px
    },
    weight: {
      thin: '100',
      extraLight: '200',
      light: '300',
      regular: '400',
      medium: '500',
      semiBold: '600',
      bold: '700',
      black: '900',
    },
  },

  // Shadow Tokens
  shadow: {
    extraLight: '0px 0px 20px rgba(0, 0, 0, 0.07)',
    light: '0px 0px 20px rgba(0, 0, 0, 0.1)',
    medium: '0px 4px 10px rgba(0, 0, 0, 0.25)',
  },

  // Hover Transition Mixin
  hoverTransition: `
    &:hover {
      transition: opacity 0.25s ease-in;
      opacity: 0.6;
    }
  `,

  // Hero Section Tokens
  hero: {
    heroHeight: '30rem',
    heroFontSize: '3.8125rem',
    heroLineHeight: '3.8125rem',
    heroPadding: '7.5rem',
  },

  // Responsive Breakpoints
  device: {
    mobile: '480px',
    mobileMediaMax: '479px',
    tablet: '768px',
    tabletMediaMax: '767px',
    miniDesktop: '992px',
    miniDesktopMediaMax: '991px',
    desktop: '1200px',
    desktopMediaMax: '1199px',
    twoKResolutionMax: '2048px',
  },

  // Easing Functions
  easeType: {
    defaultMM1: 'cubic-bezier(0.5,0.14,0,1.01)',
  },

  // Spacing & Shadows
  spacingLRMobile: '16px',
  shadowSubMenu: 'rgba(0, 0, 0, 0.28)',
  shadowCard: 'rgba(0, 0, 0, 0.1)',
  shadowCardGray: 'rgba(15, 15, 15, 0.1)',
  shadowCardFeatureLogo: 'rgba(216, 216, 216, 0.4)',
  shadowActionLink: '0px 8px 26px 0px rgba(0, 0, 0, 0.08);',
  shadowActionLinkHover: '0px 8px 26px 0px rgba(0, 0, 0, 0.2);',
}

// Default Light Theme
export const defaultTheme = {
  ...theme,
  primaryColor: theme.darkBlue,
  button: {
    primary: {
      bg: theme.darkBlue,
      gradient: theme.darkBlue,
      bgHover: theme.darkerBlue,
      gradientHover: theme.darkerBlue,
      text: theme.white,
    },
  },
  linkColor: theme.lightBlue,
  eyebrowHero: theme.darkBlue,
  gradientFAQ: 'linear-gradient(90deg, #f5841f, #2c56dd)',
  background: {
    white: theme.white,
    faqAnswer: '#f4f6f8',
    faqAnswerCustom1: theme.white,
    faqAnswerCustom2: '#4c4c4c',
    downloadCta: theme.white,
    downloadCtaShadow: '#dbdbdb',
    navBtnHover: '#dbdbdb',
    isCustodyOverlayHero: 'linear-gradient(180deg, rgba(247, 249, 251, 0), #f7f9fb 3%)',
    logoBlue: 'rgba(3, 125, 214, 0.03)',
    tabModuleOuter: '#F2F4F6',
    cardFeatureInner: 'rgba(3, 125, 214, 0.03)',
  },
  text: {
    default: theme.textColor,
    title: theme.darker,
    body: theme.textColor,
    menuHover: theme.darkBlue,
    menuBgHover: '#e6eaee',
    menuFooterHover: theme.lightBlue,
    dark: theme.dark,
    darkGray: theme.darkGray,
  },
  theme: 'default',
}

// Default Dark Theme
export const defaultDarkTheme = {
  ...theme,
  primaryColor: theme.darkBlue,
  button: {
    primary: {
      bg: theme.darkBlue,
      gradient: theme.darkBlue,
      bgHover: theme.darkerBlue,
      gradientHover: theme.darkerBlue,
      text: theme.white,
    },
  },
  linkColor: theme.lightBlue,
  eyebrowHero: theme.darkBlue,
  background: {
    white: theme.darker,
    faqAnswer: theme.dark,
    faqAnswerCustom1: theme.darker,
    faqAnswerCustom2: theme.dark,
    downloadCta: theme.dark,
    downloadCtaShadow: theme.dark,
    navBtnHover: theme.dark,
    isCustodyOverlayHero: 'linear-gradient(180deg, rgba(247, 249, 251, 0), #24292e 3%)',
    logoBlue: 'rgb(36, 41, 46)',
    tabModuleOuter: theme.dark,
    cardFeatureInner: '#212a30',
  },
  text: {
    default: theme.white,
    title: theme.white,
    body: 'rgba(255,255,255,0.6)',
    menuHover: theme.darkBlue,
    menuBgHover: theme.dark,
    menuFooterHover: theme.lightBlue,
    dark: theme.white,
    darkGray: theme.white,
  },
  shadowSubMenu: 'rgba(255, 255, 255, 0.15)',
  gradientFAQ: 'linear-gradient(90deg, #f5841f, #2c56dd)',
  shadowCard: 'rgba(0, 0, 0, 0.4)',
  shadowCardGray: 'rgba(255, 255, 255, 0.1)',
  shadowCardFeatureLogo: 'rgba(0, 0, 0, 0.8)',
  shadowActionLink: '0px 8px 26px 0px rgba(255, 255, 255, 0.08);',
  shadowActionLinkHover: '0px 8px 26px 0px rgba(255, 255, 255, 0.2);',
  theme: 'default',
}

// Purple Theme
export const purpleTheme = {
  ...theme,
  primaryColor: theme.darkPurple,
  button: {
    primary: {
      bg: theme.darkPurple,
      gradient: 'linear-gradient(180deg, #8A42AD 0%, #6762EB 100%)',
      bgHover: theme.darkerPurple,
      gradientHover: 'linear-gradient(180deg, #8A42AD 0%, #6762EB 100%)',
      text: theme.white,
    },
  },
  linkColor: theme.darkPurple,
  eyebrowHero: theme.lightPurple,
  background: {
    white: theme.white,
    faqAnswer: '#f4f6f8',
    faqAnswerCustom1: theme.white,
    faqAnswerCustom2: '#4c4c4c',
    downloadCta: theme.white,
    downloadCtaShadow: '#dbdbdb',
    navBtnHover: '#dbdbdb',
    isCustodyOverlayHero: 'linear-gradient(180deg, rgba(247, 249, 251, 0), #f7f9fb 3%)',
    logoBlue: 'rgba(3, 125, 214, 0.03)',
    tabModuleOuter: '#F2F4F6',
    cardFeatureInner: 'rgba(3, 125, 214, 0.03)',
  },
  text: {
    default: theme.textColor,
    title: theme.darker,
    body: theme.textColor,
    menuHover: theme.darkBlue,
    menuBgHover: '#e6eaee',
    menuFooterHover: theme.lightBlue,
    dark: theme.dark,
    darkGray: theme.darkGray,
  },
  gradientFAQ: 'linear-gradient(90deg, #8A42AD 0%, #6762EB 100%)',
  theme: 'purple',
}

// Purple Dark Theme
export const purpleDarkTheme = {
  ...theme,
  primaryColor: theme.darkPurple,
  button: {
    primary: {
      bg: theme.darkPurple,
      gradient: 'linear-gradient(180deg, #8A42AD 0%, #6762EB 100%)',
      bgHover: theme.darkerPurple,
      gradientHover: 'linear-gradient(180deg, #8A42AD 0%, #6762EB 100%)',
      text: theme.white,
    },
  },
  linkColor: theme.darkPurple,
  eyebrowHero: theme.lightPurple,
  background: {
    white: theme.darker,
    faqAnswer: theme.dark,
    faqAnswerCustom1: theme.darker,
    faqAnswerCustom2: theme.dark,
    downloadCta: theme.dark,
    downloadCtaShadow: theme.dark,
    navBtnHover: theme.dark,
    isCustodyOverlayHero: 'linear-gradient(180deg, rgba(247, 249, 251, 0), #24292e 3%)',
    logoBlue: 'rgb(36, 41, 46)',
    tabModuleOuter: theme.dark,
    cardFeatureInner: '#212a30',
  },
  text: {
    default: theme.white,
    title: theme.white,
    body: 'rgba(255,255,255,0.6)',
    menuHover: theme.darkBlue,
    menuBgHover: theme.dark,
    menuFooterHover: theme.lightBlue,
    dark: theme.white,
    darkGray: theme.white,
  },
  shadowSubMenu: 'rgba(255, 255, 255, 0.15)',
  gradientFAQ: 'linear-gradient(90deg, #8A42AD 0%, #6762EB 100%)',
  shadowCard: 'rgba(0, 0, 0, 0.4)',
  shadowCardGray: 'rgba(255, 255, 255, 0.1)',
  shadowCardFeatureLogo: 'rgba(0, 0, 0, 0.8)',
  theme: 'purple',
}

// Dark Theme (Black Primary)
export const darkTheme = {
  ...theme,
  primaryColor: theme.darker,
  button: {
    primary: {
      bg: theme.darker,
      gradient: theme.darker,
      bgHover: theme.dark,
      gradientHover: theme.dark,
      text: theme.white,
    },
  },
  linkColor: theme.darker,
  eyebrowHero: theme.darker,
  gradientFAQ: 'linear-gradient(90deg, #f5841f, #2c56dd)',
  background: {
    white: theme.white,
    faqAnswer: '#f4f6f8',
    faqAnswerCustom1: theme.white,
    faqAnswerCustom2: '#4c4c4c',
    downloadCta: theme.white,
    downloadCtaShadow: '#dbdbdb',
    navBtnHover: '#dbdbdb',
    isCustodyOverlayHero: 'linear-gradient(180deg, rgba(247, 249, 251, 0), #f7f9fb 3%)',
    logoBlue: 'rgba(3, 125, 214, 0.03)',
    tabModuleOuter: '#F2F4F6',
    cardFeatureInner: 'rgba(3, 125, 214, 0.03)',
  },
  text: {
    default: theme.textColor,
    title: theme.darker,
    body: theme.textColor,
    menuHover: theme.darker,
    menuBgHover: '#e6eaee',
    menuFooterHover: theme.lightBlue,
    dark: theme.dark,
    darkGray: theme.darkGray,
  },
  theme: 'dark',
}

// Dark Dark Theme (White on Black)
export const darkDarkTheme = {
  ...theme,
  primaryColor: theme.white,
  button: {
    primary: {
      bg: theme.white,
      gradient: theme.white,
      bgHover: theme.white,
      gradientHover: theme.white,
      text: theme.black,
    },
  },
  linkColor: theme.white,
  eyebrowHero: theme.white,
  background: {
    white: theme.darker,
    faqAnswer: theme.dark,
    faqAnswerCustom1: theme.darker,
    faqAnswerCustom2: theme.dark,
    downloadCta: theme.dark,
    downloadCtaShadow: theme.dark,
    navBtnHover: theme.dark,
    isCustodyOverlayHero: 'linear-gradient(180deg, rgba(247, 249, 251, 0), #24292e 3%)',
    logoBlue: 'rgb(36, 41, 46)',
    tabModuleOuter: theme.dark,
    cardFeatureInner: '#212a30',
  },
  text: {
    default: theme.white,
    title: theme.white,
    body: 'rgba(255,255,255,0.6)',
    menuHover: theme.darkBlue,
    menuBgHover: theme.dark,
    menuFooterHover: theme.lightBlue,
    dark: theme.white,
    darkGray: theme.white,
  },
  shadowSubMenu: 'rgba(255, 255, 255, 0.15)',
  gradientFAQ: 'linear-gradient(90deg, #f5841f, #2c56dd)',
  shadowCard: 'rgba(0, 0, 0, 0.4)',
  shadowCardGray: 'rgba(255, 255, 255, 0.1)',
  shadowCardFeatureLogo: 'rgba(0, 0, 0, 0.8)',
  shadowActionLink: '0px 8px 26px 0px rgba(255, 255, 255, 0.08);',
  shadowActionLinkHover: '0px 8px 26px 0px rgba(255, 255, 255, 0.2);',
  theme: 'dark',
}

export default theme
