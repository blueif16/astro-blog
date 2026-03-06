import React, { useEffect, useRef } from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'

/**
 * ModalOverlay - Modal popup with body scroll lock and backdrop
 *
 * Extracted from MetaMask website Popup.js and PopupAnnouncement.js components.
 * Features body scroll lock, backdrop click to close, and customizable content.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Control modal visibility
 * @param {Function} props.onClose - Close handler callback
 * @param {React.ReactNode} props.children - Modal content
 * @param {string} [props.width='600px'] - Modal width
 * @param {boolean} [props.hideCloseIcon=false] - Hide close button
 * @param {boolean} [props.closeOnBackdrop=true] - Close on backdrop click
 * @param {boolean} [props.closeOnEscape=true] - Close on ESC key
 */
const ModalOverlay = ({
  isOpen,
  onClose,
  children,
  width = '600px',
  hideCloseIcon = false,
  closeOnBackdrop = true,
  closeOnEscape = true,
}) => {
  const modalRef = useRef(null)

  // Body scroll lock effect
  useEffect(() => {
    if (isOpen) {
      // Lock body scroll
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      document.body.style.overflow = 'hidden'
      document.body.style.paddingRight = `${scrollbarWidth}px`
    } else {
      // Unlock body scroll
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }

    return () => {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }
  }, [isOpen])

  // ESC key handler
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, closeOnEscape, onClose])

  // Backdrop click handler
  const handleBackdropClick = (e) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <Backdrop onClick={handleBackdropClick}>
      <ModalContainer $width={width} ref={modalRef}>
        {!hideCloseIcon && (
          <CloseButton onClick={onClose} aria-label="Close modal">
            <CloseIcon />
          </CloseButton>
        )}
        {children}
      </ModalContainer>
    </Backdrop>
  )
}

ModalOverlay.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  width: PropTypes.string,
  hideCloseIcon: PropTypes.bool,
  closeOnBackdrop: PropTypes.bool,
  closeOnEscape: PropTypes.bool,
}

export default ModalOverlay

// Styled Components
const Backdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
  overflow-x: hidden;
  overflow-y: auto;
  animation: fadeIn 200ms ease;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`

const ModalContainer = styled.div`
  position: relative;
  background: #fff;
  border-radius: 12px;
  padding: 40px;
  width: 100%;
  max-width: ${({ $width }) => $width};
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  animation: slideUp 300ms ease;

  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @media (max-width: 768px) {
    padding: 24px;
    max-width: 95%;
  }
`

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 200ms ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  &:focus {
    outline: 2px solid #037dd6;
    outline-offset: 2px;
  }
`

// Close Icon Component
const CloseIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M18 6L6 18M6 6L18 18"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

/**
 * AnnouncementBanner - Dismissible announcement banner component
 *
 * Extracted from MetaMask website PopupAnnouncement.js component.
 * Features dismissible banner with CTA and close button.
 *
 * @param {Object} props
 * @param {string} [props.title] - Announcement title
 * @param {string} [props.ctaText] - CTA button text
 * @param {string} [props.ctaLink] - CTA link URL
 * @param {string} [props.backgroundColor='#037dd6'] - Background color
 * @param {Function} [props.onDismiss] - Dismiss callback
 */
export const AnnouncementBanner = ({
  title,
  ctaText,
  ctaLink,
  backgroundColor = '#037dd6',
  onDismiss,
}) => {
  const [isHidden, setIsHidden] = React.useState(false)

  const handleClose = () => {
    setIsHidden(true)
    if (onDismiss) onDismiss()
  }

  if (isHidden) return null

  const isInternalLink = ctaLink?.startsWith('/')

  return (
    <BannerWrapper $backgroundColor={backgroundColor}>
      <BannerInner>
        <BannerContent>
          {ctaLink && (
            <ClickArea
              href={ctaLink}
              target={isInternalLink ? undefined : '_blank'}
              rel={isInternalLink ? undefined : 'noopener noreferrer'}
              aria-label={title || ctaText}
            />
          )}
          <Content>
            {title && <Title>{title}</Title>}
            {ctaText && (
              <CTA>
                <CTATitle>{ctaText}</CTATitle>
                <ArrowIcon />
              </CTA>
            )}
          </Content>
        </BannerContent>
        <CloseBtn onClick={handleClose} aria-label="Close announcement">
          ×
        </CloseBtn>
      </BannerInner>
    </BannerWrapper>
  )
}

AnnouncementBanner.propTypes = {
  title: PropTypes.string,
  ctaText: PropTypes.string,
  ctaLink: PropTypes.string,
  backgroundColor: PropTypes.string,
  onDismiss: PropTypes.func,
}

// AnnouncementBanner Styled Components
const BannerWrapper = styled.div`
  display: block;
  background: ${({ $backgroundColor }) => $backgroundColor};
`

const BannerInner = styled.div`
  display: flex;
  position: relative;
  width: 100%;
`

const BannerContent = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  justify-content: center;
  min-height: 40px;
  min-width: 0;
  padding: 8px;
  position: relative;
`

const Content = styled.div`
  align-items: center;
  display: flex;
  flex-flow: wrap;
  justify-content: center;
  color: #ffffff;
  text-align: center;
`

const ClickArea = styled.a`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
  color: transparent;
`

const Title = styled.div`
  font-size: 14px;
  line-height: 150%;
  margin-right: 4px;
`

const CTA = styled.div`
  display: inline-flex;
  align-items: center;
  font-size: 14px;
  line-height: 120%;
  color: #ffffff;
  font-weight: 700;

  svg {
    width: 12px;
    height: auto;
    margin-left: 4px;
    flex-shrink: 0;
  }
`

const CTATitle = styled.span`
  border-bottom: 1px solid #fff;

  @media (max-width: 767px) {
    border-bottom: none;
    text-decoration: underline;
  }
`

const CloseBtn = styled.button`
  display: inline-flex;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  color: #fff;
  padding: 8px 16px;
  font-size: 24px;
  position: relative;
  background: transparent;
  border: none;
  transition: opacity 200ms ease;

  &:hover {
    opacity: 0.7;
  }
`

const ArrowIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 9L7 6L4 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
