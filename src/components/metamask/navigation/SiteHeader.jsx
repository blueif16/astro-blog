import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { useMediaQuery } from 'react-responsive'
import classnames from 'classnames'
import PropTypes from 'prop-types'

/**
 * SiteHeader - Responsive header with mobile menu and scroll-aware visibility
 *
 * Extracted from MetaMask website Header.js
 * Adapted for Astro routing with prop-driven links
 */
const SiteHeader = props => {
  const {
    logo,
    logoMobile,
    menus = [],
    downloadButton,
    announcement,
    hideDownloadBtn = false,
    isSticky = true,
    isDarkMode = false,
    onToggleDarkMode,
    showDarkModeToggle = true,
  } = props

  const isDesktop = useMediaQuery({
    query: '(min-width: 1200px)',
  })
  const [menuActive, setMenuActive] = useState('')
  const [hamburgerActive, setHamburgerActive] = useState(false)
  const menuRef = useRef()
  const buttonRef = useRef()
  const headerRef = useRef()
  const [topMenuMobile, setTopMenuMobile] = useState('88px')

  useEffect(() => {
    const handleOuterClick = e => {
      const ref = menuRef?.current
      const btnRef = buttonRef?.current

      if (hamburgerActive && ref && btnRef) {
        if (!ref.contains(e.target) && !btnRef.contains(e.target)) {
          setHamburgerActive(false)
        }
      }
    }

    document.addEventListener('click', handleOuterClick)

    return () => document.removeEventListener('click', handleOuterClick)
  }, [hamburgerActive])

  const handleMenuClick = id => {
    if (menuActive === id) {
      setMenuActive('')
    } else {
      setMenuActive(id)
    }
  }

  const handleMenuMouseEnter = id => {
    if (isDesktop) {
      setMenuActive(id)
    }
  }

  const handleMenuMouseLeave = () => {
    if (isDesktop) {
      setMenuActive('')
    }
  }

  const handleHamburgerButton = () => {
    if (headerRef && announcement) {
      const h = headerRef?.current.getBoundingClientRect().height
      setTopMenuMobile(`${h}px`)
    }

    setHamburgerActive(!hamburgerActive)
  }

  const desktopLogo = isDarkMode && logo?.logoDarkMode ? logo.logoDarkMode : logo?.logo
  const mobileLogo = isDarkMode && logoMobile?.logoDarkMode ? logoMobile.logoDarkMode : logoMobile?.logo

  return (
    <HeaderElement ref={headerRef} className={classnames({ sticky: isSticky })}>
      {announcement && (
        <Announcement>
          {announcement}
        </Announcement>
      )}
      <HeaderContainer>
        <LogoContainer>
          <a href="/" aria-label="Go to home page">
            {desktopLogo && (
              <LogoWrapper
                className={classnames({
                  'hidden-mobile': logoMobile,
                })}
              >
                <Logo
                  src={desktopLogo}
                  alt="Logo"
                />
              </LogoWrapper>
            )}
            {mobileLogo && (
              <LogoWrapper className={classnames('hidden-desktop')}>
                <Logo
                  src={mobileLogo}
                  alt="Logo"
                />
              </LogoWrapper>
            )}
          </a>
        </LogoContainer>
        {menus.length > 0 && (
          <>
            <HamburgerButton
              onClick={handleHamburgerButton}
              active={hamburgerActive}
              ref={buttonRef}
              className="w-icon w-icon-nav-menu"
            />
            <NavMain
              hamburgerActive={hamburgerActive}
              ref={menuRef}
              topMenuMobile={topMenuMobile}
            >
              <NavMainInner>
                {menus.map((menu, index) => {
                  const { title, items, href } = menu
                  const active = menuActive === index

                  return (
                    <NavMenu
                      key={index}
                      active={active}
                      onMouseEnter={() => handleMenuMouseEnter(index)}
                      onMouseLeave={() => handleMenuMouseLeave(index)}
                    >
                      <NavMenuMain
                        hasChild={href ? false : true}
                        onClick={() => handleMenuClick(index)}
                      >
                        {href ? (
                          <a href={href}>{title}</a>
                        ) : (
                          <>
                            {title}
                            <Icon className="w-icon w-icon-dropdown-toggle" />
                          </>
                        )}
                      </NavMenuMain>
                      {items && items.length > 0 && (
                        <NavMenuChild active={active}>
                          {items.map((item, idx) => (
                            <a key={idx} href={item.href}>
                              {item.title}
                            </a>
                          ))}
                        </NavMenuChild>
                      )}
                    </NavMenu>
                  )
                })}

                {downloadButton && (
                  <ButtonWrapper
                    className="download-btn-desktop"
                    hideDownloadBtn={hideDownloadBtn}
                  >
                    {downloadButton}
                  </ButtonWrapper>
                )}

                {showDarkModeToggle && (
                  <ToggleWrapper>
                    <DarkModeWrapper>
                      <label>
                        <input
                          type="checkbox"
                          onChange={onToggleDarkMode}
                          checked={isDarkMode}
                          name="darkMode"
                        />
                        <span>Dark Mode</span>
                      </label>
                    </DarkModeWrapper>
                  </ToggleWrapper>
                )}

                {downloadButton && (
                  <ButtonWrapper
                    className="download-btn-mobile"
                    hideDownloadBtn={hideDownloadBtn}
                  >
                    {downloadButton}
                  </ButtonWrapper>
                )}
              </NavMainInner>
            </NavMain>
          </>
        )}
      </HeaderContainer>
    </HeaderElement>
  )
}

export default SiteHeader

SiteHeader.propTypes = {
  logo: PropTypes.shape({
    logo: PropTypes.string,
    logoDarkMode: PropTypes.string,
  }),
  logoMobile: PropTypes.shape({
    logo: PropTypes.string,
    logoDarkMode: PropTypes.string,
  }),
  menus: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      href: PropTypes.string,
      items: PropTypes.arrayOf(
        PropTypes.shape({
          title: PropTypes.string.isRequired,
          href: PropTypes.string.isRequired,
        })
      ),
    })
  ),
  downloadButton: PropTypes.node,
  announcement: PropTypes.node,
  hideDownloadBtn: PropTypes.bool,
  isSticky: PropTypes.bool,
  isDarkMode: PropTypes.bool,
  onToggleDarkMode: PropTypes.func,
  showDarkModeToggle: PropTypes.bool,
}

const HeaderElement = styled.header`
  background-color: #fff;
  bottom: 20px;
  display: block;
  left: 0;
  margin-left: auto;
  margin-right: auto;
  margin-top: 0;
  overflow: visible;
  padding: 24px 20px;
  right: 0;
  top: 0;
  z-index: 999;
  transition: background 300ms ease;

  body.dark-mode & {
    background-color: #121212;
  }

  &.sticky {
    position: sticky;
  }
`

const Announcement = styled.div`
  margin: -24px -20px 16px -20px;

  &:empty {
    display: none;
  }
`

const HeaderContainer = styled.div`
  display: flex;
  margin: 0 auto;
  max-width: 1200px;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  @media (max-width: 991px) {
    max-width: 100%;
  }
`

const LogoContainer = styled.div`
  display: block;
`

const NavMain = styled.nav`
  display: block;
  font-size: 16px;
  line-height: 22px;

  @media (max-width: 1199px) {
    opacity: 0;
    visibility: hidden;
    left: 0;
    right: 0;
    background: #fff;
    padding: 12px;
    position: fixed;
    top: 0;
    bottom: auto;
    margin-top: ${({ topMenuMobile }) => topMenuMobile};
    max-height: ${({ topMenuMobile }) => `calc(100% - ${topMenuMobile})`};
    overflow-x: hidden;
    overflow-y: auto;
    box-shadow: 0px 6px 6px 0px rgba(0, 0, 0, 0.1);

    .dark-mode & {
      background: #121212;
      box-shadow: 0px 6px 6px 0px rgba(255, 255, 255, 0.1);
    }

    ${({ hamburgerActive }) =>
      hamburgerActive
        ? `
      opacity: 1;
      visibility: visible;
    `
        : ''}
  }
`

const NavMainInner = styled.div`
  display: flex;
  @media (max-width: 1199px) {
    flex-direction: column;
    max-width: 100%;
    margin: 0 auto;
  }
`

const LogoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  width: 210px;
  height: auto;

  &.hidden-mobile {
    @media (max-width: 1199px) {
      display: none;
    }
  }

  &.hidden-desktop {
    @media (min-width: 1200px) {
      display: none;
    }
  }
`

const Logo = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`

const NavMenu = styled.div`
  display: inline-flex;
  position: relative;
  align-items: center;
  justify-content: center;
  @media (max-width: 1199px) {
    flex-direction: column;
  }
`

const NavMenuChild = styled.div`
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 0 13px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  left: 0;
  min-width: 100%;
  position: absolute;
  top: 100%;
  user-select: none;

  .dark-mode & {
    background-color: #24292e;
  }

  a {
    white-space: nowrap;
    width: 100%;
    justify-content: flex-start;
    padding: 8px 16px;
    color: #222;
    text-decoration: none;
    transition: color 0.15s ease, background-color 0.15s ease;

    .dark-mode & {
      color: #fff;
    }

    &:hover {
      background-color: #e6eaee;
      color: #037dd6;

      .dark-mode & {
        background-color: #24292e;
        color: #fff;
      }
    }
  }

  @media (min-width: 1200px) {
    opacity: 0;
    visibility: hidden;
    ${({ active }) =>
      active
        ? `
    opacity: 1;
    visibility: visible;
    z-index: 999;
    `
        : ''}
  }

  @media (max-width: 1199px) {
    width: 100%;
    position: static;
    box-shadow: none;
    max-height: 0;
    overflow: hidden;
    margin-left: 40px;
    ${({ active }) =>
      active
        ? `
        max-height: none;
    `
        : ''}
  }
`

const NavMenuMain = styled.div`
  display: flex;
  align-items: center;
  height: 40px;
  padding: 0 16px;
  color: #222;
  line-height: 1.1;

  body.dark-mode & {
    color: #FFF;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  &:hover {
    color: #037dd6;
  }

  ${({ hasChild }) =>
    hasChild
      ? `
      cursor: pointer;
    `
      : ``}

  @media (max-width: 1199px) {
    width: 100%;
    justify-content: space-between;
  }
`

const Icon = styled.span`
  display: inline-block;
  margin-left: 4px;

  &.w-icon-dropdown-toggle::before {
    content: '▼';
    font-size: 10px;
  }
`

const HamburgerButton = styled.div`
  display: none;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  cursor: pointer;
  border-radius: 10px;
  color: #222;

  body.dark-mode & {
    color: #fff;
  }

  @media (max-width: 1199px) {
    display: inline-flex;
  }

  &.w-icon-nav-menu::before {
    content: '☰';
  }

  ${({ active }) =>
    active
      ? `
    background: #e6eaee;

    body.dark-mode & {
      background: #24292e;
    }
  `
      : ''}
`

const ButtonWrapper = styled.div`
  display: block;

  &.download-btn-desktop {
    display: none;

    @media (min-width: 1200px) {
      display: block;
    }
  }

  &.download-btn-mobile {
    display: block;
    @media (min-width: 1200px) {
      display: none;
    }
  }

  @media (max-width: 1199px) {
    margin-top: 12px;
  }

  ${({ hideDownloadBtn }) =>
    hideDownloadBtn
      ? `
    opacity: 0;
    visibility: hidden;
  `
      : ``}
`

const DarkModeWrapper = styled.div`
  display: inline-flex;
  align-items: center;
  margin-left: 16px;

  @media (max-width: 1199px) {
    margin-top: 16px;
    margin-left: 0;
    justify-content: center;
  }
`

const ToggleWrapper = styled.div`
  display: flex;
  flex-direction: column-reverse;

  @media (min-width: 1200px) {
    flex-direction: row;
  }
`
