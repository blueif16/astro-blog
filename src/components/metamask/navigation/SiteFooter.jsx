import PropTypes from 'prop-types'
import React from 'react'
import styled from 'styled-components'

/**
 * SiteFooter - Footer with link columns
 *
 * Extracted from MetaMask website Footer.js
 * Adapted for Astro routing with prop-driven links
 */
const SiteFooter = props => {
  const { menus = [], copyright, logo, isDarkMode = false } = props

  const footerLogo = isDarkMode && logo?.logoDarkMode ? logo.logoDarkMode : logo?.logo

  return (
    <FooterContainer>
      <FooterInner>
        <LogoContainer>
          <a href="/" aria-label="Go to the home page">
            {footerLogo && (
              <LogoWrapper>
                <Logo src={footerLogo} alt="Logo" />
              </LogoWrapper>
            )}
          </a>
        </LogoContainer>
        <ColumnWrapper columns={menus?.length}>
          {menus?.map((menu, index) => {
            const { title, items } = menu
            return (
              <MenuItem key={index}>
                <MenuItemHeading>{title}</MenuItemHeading>
                <MenuItemContent>
                  {items && items.length > 0
                    ? items.map((item, idx) => (
                        <MenuLink key={idx} href={item.href}>
                          {item.title}
                        </MenuLink>
                      ))
                    : null}
                </MenuItemContent>
              </MenuItem>
            )
          })}
        </ColumnWrapper>

        <SubFooterContainer>
          <PolicyCopy>
            <PolicyCopyText>{copyright}</PolicyCopyText>
          </PolicyCopy>
        </SubFooterContainer>
      </FooterInner>
    </FooterContainer>
  )
}

export default SiteFooter

SiteFooter.propTypes = {
  logo: PropTypes.shape({
    logo: PropTypes.string,
    logoDarkMode: PropTypes.string,
  }),
  menus: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      items: PropTypes.arrayOf(
        PropTypes.shape({
          title: PropTypes.string.isRequired,
          href: PropTypes.string.isRequired,
        })
      ),
    })
  ).isRequired,
  copyright: PropTypes.string,
  isDarkMode: PropTypes.bool,
}

const FooterContainer = styled.div`
  width: 100%;
  background-color: #e9ebee;
  body.dark-mode & {
    background-color: #3c444b;
  }
`

const FooterInner = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 20px;
`

const SubFooterContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  height: auto;
  @media (min-width: 768px) {
    flex-direction: row;
  }
`

const PolicyCopyText = styled.span`
  font-size: 12px;
  line-height: 22px;
  color: #222;

  body.dark-mode & {
    color: #fff;
  }
`

const PolicyCopy = styled.div`
  margin: 20px 0 0 0;
`

const MenuItemHeading = styled.p`
  font-size: 18px;
  color: #f6851b;
  text-transform: uppercase;
  line-height: 40px;
  margin-bottom: 4px;
  margin-top: 0;
`

const MenuItem = styled.div`
  display: block;
  @media (max-width: 767px) {
    padding: 0 10px 20px 10px;
    width: 100%;
  }
`

const MenuItemContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const MenuLink = styled.a`
  font-size: 16px;
  line-height: 22px;
  color: #222;
  text-decoration: none;
  transition: color 0.15s ease;

  body.dark-mode & {
    color: #fff;
  }

  &:hover {
    color: #037dd6;
  }
`

const LogoContainer = styled.div`
  display: block;
  margin-bottom: 40px;
`

const LogoWrapper = styled.div`
  display: flex;
  width: 172px;
  height: auto;
`

const Logo = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`

const ColumnWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 40px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(${({ columns }) => columns || 4}, 1fr);
  }
`
