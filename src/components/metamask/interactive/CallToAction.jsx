import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import { gsap } from 'gsap'

/**
 * CallToAction - CTA block with layout variants and hover animations
 *
 * Extracted from MetaMask website CTA.js component.
 * Features GSAP-based smooth scroll animations and multiple layout variants.
 *
 * @param {Object} props
 * @param {string} props.href - Link URL
 * @param {string} props.text - CTA text content
 * @param {string} [props.align='left'] - Text alignment (left, center, right)
 * @param {boolean} [props.newTab=false] - Open link in new tab
 * @param {string} [props.color] - Text color
 * @param {boolean} [props.showRightArrow=false] - Show right arrow icon
 * @param {boolean} [props.showLeftArrow=false] - Show left arrow icon
 * @param {string} [props.typeLayout=''] - Layout type (header, headerSingle, footer, link-card)
 * @param {Function} [props.onClick] - Custom click handler
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} [props.socialIcon] - Social icon name
 */
const CallToAction = ({
  href,
  text,
  align = 'left',
  newTab = false,
  color,
  showRightArrow = false,
  showLeftArrow = false,
  typeLayout = '',
  onClick,
  className = '',
  socialIcon,
}) => {
  const handleClick = (e) => {
    // Handle anchor link smooth scroll with GSAP
    if (href?.startsWith('#') && href.length > 1) {
      e.preventDefault()
      const targetId = href.substring(1)
      const targetElement = document.getElementById(targetId)

      if (targetElement) {
        gsap.to(window, {
          duration: 0.7,
          scrollTo: { y: targetElement, offsetY: 100, autoKill: true },
          onComplete: () => {
            window.history.replaceState(null, null, href)
          },
        })
      }
    }

    if (onClick) {
      onClick(e)
    }
  }

  const linkProps = {
    href,
    ...(newTab && { target: '_blank', rel: 'noopener noreferrer' }),
    onClick: handleClick,
  }

  return (
    <CTAContainer align={align} className={`cta-module-container ${className}`}>
      <ContentWrapper
        {...linkProps}
        $color={color}
        $typeLayout={typeLayout}
      >
        {socialIcon && <SocialIconPlaceholder>{socialIcon}</SocialIconPlaceholder>}
        <LinkTitle
          className={`${showLeftArrow ? 'left-arrow' : ''} ${showRightArrow || socialIcon ? 'right-arrow' : ''}`}
        >
          {showLeftArrow && <ArrowIcon $rotate={180} />}
          <span dangerouslySetInnerHTML={{ __html: text }} />
          {(showRightArrow || socialIcon) && <ArrowIcon />}
        </LinkTitle>
      </ContentWrapper>
    </CTAContainer>
  )
}

CallToAction.propTypes = {
  href: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  align: PropTypes.oneOf(['left', 'center', 'right']),
  newTab: PropTypes.bool,
  color: PropTypes.string,
  showRightArrow: PropTypes.bool,
  showLeftArrow: PropTypes.bool,
  typeLayout: PropTypes.string,
  onClick: PropTypes.func,
  className: PropTypes.string,
  socialIcon: PropTypes.string,
}

export default CallToAction

// Styled Components
const CTAContainer = styled.div`
  ${({ align }) =>
    align
      ? `
    display: flex;
    justify-content: ${alignMapping(align)};
  `
      : ''}

  &.link-card {
    a {
      display: flex;
      width: 623px;
      height: 100px;
      padding: 12px 30px;
      align-items: center;
      justify-content: space-between;
      border-radius: 10px;
      background: #fff;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      transition: box-shadow 200ms ease;

      > span {
        max-width: 435px;
        font-size: 1.25rem;
        font-weight: 600;
        line-height: 1.3;
        color: #24292e;
      }

      &::after {
        content: '';
        display: block;
        width: 43px;
        height: 35px;
        background-color: #24292e;
      }

      &:hover,
      &:focus {
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
      }

      @media (max-width: 768px) {
        > span {
          max-width: 75%;
          font-size: 1rem;
          text-align: left;
        }

        &::after {
          transform: scale(0.5);
        }
      }
    }
  }
`

const LinkTitle = styled.span`
  display: flex;
  align-items: center;

  svg {
    width: 20px;
    margin-left: 8px;
    overflow: initial;
    transition: transform 200ms ease;
  }

  &.left-arrow {
    svg {
      margin: 2px 12px 0 0;
    }
  }

  &:hover {
    svg {
      transform: translateX(4px);
    }

    &.left-arrow svg {
      transform: translateX(-4px);
    }
  }
`

const ContentWrapper = styled.a`
  transition: color 0.15s ease, background-color 0.15s ease;
  text-decoration: none;
  position: relative;
  display: inline-flex;
  align-items: center;

  ${({ $typeLayout, $color }) =>
    $typeLayout === ''
      ? `
      color: ${$color || '#037dd6'};
      &:hover {
        color: #1565c0;
      }
  `
      : ''}

  ${({ $typeLayout }) =>
    ['header', 'headerSingle'].includes($typeLayout)
      ? `
    font-size: 16px;
    line-height: 22px;
    height: 56px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin: 4px;
    padding: 8px;
    border-radius: 4px;
    background-color: transparent;
    font-weight: 400;
    color: #222;

    &:hover {
      background-color: rgba(0, 0, 0, 0.05);
      color: #037dd6;
    }
  `
      : ''}

  ${({ $typeLayout }) =>
    $typeLayout === 'headerSingle'
      ? `
    padding: 0;
    margin: 0;
    &:hover {
      background-color: unset;
    }
  `
      : ''}

  ${({ $typeLayout }) =>
    $typeLayout === 'footer'
      ? `
    color: rgba(0, 0, 0, 0.74);
    font-size: 12px;
    line-height: 30px;
    font-weight: 400;
    &:hover {
      color: #037dd6;
    }
    @media (max-width: 480px) {
      font-size: 16px;
      line-height: 44px;
    }
  `
      : ''}
`

const alignMapping = (align) => {
  if (align === 'right') return 'flex-end'
  if (align === 'middle' || align === 'center') return 'center'
  return 'flex-start'
}

const SocialIconPlaceholder = styled.span`
  margin-right: 8px;
  display: inline-flex;
  align-items: center;
`

// Arrow Icon Component
const ArrowIcon = ({ $rotate = 0 }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ transform: `rotate(${$rotate}deg)` }}
  >
    <path
      d="M7.5 15L12.5 10L7.5 5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)
