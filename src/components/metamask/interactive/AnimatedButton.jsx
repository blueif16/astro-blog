import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'

/**
 * AnimatedButton - Interactive button with hover/click animation states
 *
 * Extracted from MetaMask website Button.js component.
 * Features smooth color transitions and optional icon support.
 *
 * @param {Object} props
 * @param {string} props.href - Link URL
 * @param {string} props.text - Button text content
 * @param {boolean} [props.newTab=false] - Open link in new tab
 * @param {string} [props.variant='primary'] - Button style variant (primary, secondary, white-outline)
 * @param {string} [props.size='medium'] - Button size
 * @param {Function} [props.onClick] - Custom click handler
 * @param {string} [props.fontSize] - Custom font size
 * @param {string} [props.className] - Additional CSS classes
 * @param {boolean} [props.gradient=false] - Use gradient background
 * @param {string} [props.iconUrl] - Icon image URL
 * @param {string} [props.iconPosition='end'] - Icon position (start or end)
 * @param {boolean} [props.hide=false] - Hide button with opacity
 * @param {boolean} [props.hasCaretDown=false] - Show caret down icon
 */
const AnimatedButton = ({
  href,
  text,
  newTab = false,
  variant = 'primary',
  size = 'medium',
  onClick,
  fontSize,
  className = '',
  gradient = false,
  iconUrl,
  iconPosition = 'end',
  hide = false,
  hasCaretDown = false,
  ...rest
}) => {
  const handleClick = (e) => {
    if (onClick) {
      e.preventDefault()
      onClick(e)
    }
  }

  const linkProps = {
    href,
    ...(newTab && { target: '_blank', rel: 'noopener noreferrer' }),
    onClick: handleClick,
  }

  return (
    <ButtonWrapper
      {...linkProps}
      $variant={variant}
      $size={size}
      $gradient={gradient}
      $fontSize={fontSize}
      $hide={hide}
      className={`button ${className}`}
      {...rest}
    >
      {iconPosition === 'start' && iconUrl && (
        <Icon>
          <img src={iconUrl} alt="" />
        </Icon>
      )}
      <span>{text}</span>
      {iconPosition === 'end' && iconUrl && (
        <Icon $hasBg>
          <img src={iconUrl} alt={text} />
        </Icon>
      )}
      {hasCaretDown && <Icon className="caret-down">▼</Icon>}
    </ButtonWrapper>
  )
}

AnimatedButton.propTypes = {
  href: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  newTab: PropTypes.bool,
  variant: PropTypes.oneOf(['primary', 'secondary', 'white-outline']),
  size: PropTypes.string,
  onClick: PropTypes.func,
  fontSize: PropTypes.string,
  className: PropTypes.string,
  gradient: PropTypes.bool,
  iconUrl: PropTypes.string,
  iconPosition: PropTypes.oneOf(['start', 'end']),
  hide: PropTypes.bool,
  hasCaretDown: PropTypes.bool,
}

export default AnimatedButton

// Styled Components
const Icon = styled.span`
  display: inline-flex;

  &:first-child {
    margin-right: 8px;
  }
  &:last-child {
    margin-left: 8px;
  }

  ${({ $hasBg }) =>
    $hasBg
      ? `
      background: #FFFFFF;
      border-radius: 50%;
      height: 32px;
      width: 32px;
      img {
        width: 28px;
        height: 28px;
        margin: auto !important;
      }
    `
      : `
      img {
        width: 32px;
        height: 32px;
      }
    `}
`

const ButtonWrapper = styled.a`
  /* Base styles */
  cursor: pointer;
  text-align: center;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  font-weight: 500;

  /* Transitions for smooth animations */
  transition: background-color 300ms ease, border 300ms ease, color 300ms ease, opacity 300ms ease;

  /* Size */
  min-height: 52px;
  padding: 8px 20px;
  font-size: 16px;
  line-height: 1.3;

  ${({ $fontSize }) =>
    $fontSize &&
    `
    font-size: ${$fontSize};
  `}

  /* Hide state */
  opacity: ${({ $hide }) => ($hide ? 0 : 1)};

  /* Hover arrow animation */
  &:hover {
    .arrow-animation:after {
      margin-left: 6px;
    }
  }

  /* Primary variant */
  ${({ $variant, $gradient }) =>
    $variant === 'primary'
      ? `
    background: ${$gradient ? 'linear-gradient(90deg, #037dd6 0%, #1565c0 100%)' : '#037dd6'};
    color: #fff;
    border: none;

    &:hover {
      background: ${$gradient ? 'linear-gradient(90deg, #1565c0 0%, #0d47a1 100%)' : '#1565c0'};
    }
  `
      : ''}

  /* Secondary variant (outline) */
  ${({ $variant }) =>
    $variant === 'secondary'
      ? `
    background: transparent !important;
    color: #037dd6;
    border: 1px solid #037dd6;

    &:hover {
      border-color: #1565c0;
      color: #1565c0;
    }
  `
      : ''}

  /* White outline variant */
  ${({ $variant }) =>
    $variant === 'white-outline'
      ? `
    background: transparent !important;
    color: #fff;
    border: 1px solid #fff;

    &:hover {
      border-color: #1565c0;
      color: #1565c0;
    }
  `
      : ''}
`
