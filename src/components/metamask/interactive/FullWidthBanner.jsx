import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'

/**
 * FullWidthBanner - Edge-to-edge CTA banner with background image support
 *
 * Features full-width backgrounds, centered content, and flexible CTA layouts.
 *
 * @param {Object} props
 * @param {string} [props.headline] - Main headline text (HTML supported)
 * @param {string} [props.description] - Description text (HTML supported)
 * @param {Array} [props.ctas] - Array of CTA button configurations
 * @param {string} [props.backgroundColor] - Background color variant (dark, gray, white)
 * @param {string} [props.backgroundImage] - Background image URL
 * @param {boolean} [props.bordered=false] - Show border around banner
 * @param {boolean} [props.fullWidthBackground=false] - Apply background to full container width
 * @param {string} [props.sectionPadding] - Custom section padding
 * @param {boolean} [props.noPaddingTop=false] - Remove top padding
 * @param {boolean} [props.noPaddingBottom=false] - Remove bottom padding
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.ReactNode} [props.children] - Additional content to render
 */
const FullWidthBanner = ({
  headline,
  description,
  ctas = [],
  backgroundColor,
  backgroundImage,
  bordered = false,
  fullWidthBackground = false,
  sectionPadding,
  noPaddingTop = false,
  noPaddingBottom = false,
  className = '',
  children,
}) => {
  return (
    <Container
      $sectionPadding={sectionPadding}
      $noPaddingTop={noPaddingTop}
      $noPaddingBottom={noPaddingBottom}
      $backgroundColor={backgroundColor}
      $backgroundImage={fullWidthBackground ? backgroundImage : null}
      className={className}
    >
      <ContentWrapper>
        <BannerWrapper
          $bordered={bordered}
          $backgroundImage={!fullWidthBackground ? backgroundImage : null}
        >
          <BannerInner
            $noPaddingTop={noPaddingTop}
            $noPaddingBottom={noPaddingBottom}
            $backgroundColor={backgroundColor}
          >
            {headline && (
              <Headline
                $backgroundColor={backgroundColor}
                dangerouslySetInnerHTML={{ __html: headline }}
              />
            )}
            {description && (
              <Description dangerouslySetInnerHTML={{ __html: description }} />
            )}
            {children}
            {ctas.length > 0 && (
              <CTAWrapper>
                {ctas.map((cta, index) => (
                  <CTAButton
                    key={index}
                    href={cta.href}
                    target={cta.newTab ? '_blank' : undefined}
                    rel={cta.newTab ? 'noopener noreferrer' : undefined}
                    $variant={cta.variant || 'primary'}
                  >
                    {cta.text}
                  </CTAButton>
                ))}
              </CTAWrapper>
            )}
          </BannerInner>
        </BannerWrapper>
      </ContentWrapper>
    </Container>
  )
}

FullWidthBanner.propTypes = {
  headline: PropTypes.string,
  description: PropTypes.string,
  ctas: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string.isRequired,
      href: PropTypes.string.isRequired,
      newTab: PropTypes.bool,
      variant: PropTypes.string,
    })
  ),
  backgroundColor: PropTypes.string,
  backgroundImage: PropTypes.string,
  bordered: PropTypes.bool,
  fullWidthBackground: PropTypes.bool,
  sectionPadding: PropTypes.string,
  noPaddingTop: PropTypes.bool,
  noPaddingBottom: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.node,
}

export default FullWidthBanner

// Styled Components
const Container = styled.section`
  display: block;
  padding: ${({ $sectionPadding }) => $sectionPadding || '80px 0'};

  ${({ $noPaddingTop }) => $noPaddingTop && 'padding-top: 0;'}
  ${({ $noPaddingBottom }) => $noPaddingBottom && 'padding-bottom: 0;'}

  ${({ $backgroundColor }) =>
    $backgroundColor === 'dark' &&
    `
    background-color: #24292e;
    color: #fff;
  `}

  ${({ $backgroundColor }) =>
    $backgroundColor === 'gray' &&
    `
    background-color: #f2f4f6;
  `}

  ${({ $backgroundImage }) =>
    $backgroundImage &&
    `
    background-image: url(${$backgroundImage});
    background-size: cover;
    background-position: center;
  `}

  @media (max-width: 768px) {
    padding: 40px 0;
  }
`

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;

  @media (max-width: 768px) {
    padding: 0 16px;
  }
`

const BannerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;

  ${({ $bordered }) =>
    $bordered &&
    `
    border-radius: 16px;
    border: 1px solid #BBC0C5;
    padding: 32px 0;
  `}

  ${({ $backgroundImage }) =>
    $backgroundImage &&
    `
    background-image: url(${$backgroundImage});
    background-size: cover;
    background-position: center;
    border-radius: 16px;
  `}
`

const BannerInner = styled.div`
  display: block;
  width: 100%;

  ${({ $backgroundColor }) =>
    $backgroundColor === 'dark' &&
    `
    color: #fff;
  `}
`

const Headline = styled.h2`
  font-size: 48px;
  line-height: 1.2;
  font-weight: 700;
  margin: 0 0 16px 0;

  ${({ $backgroundColor }) =>
    $backgroundColor === 'dark' &&
    `
    color: #fff;
  `}

  @media (max-width: 768px) {
    font-size: 32px;
  }
`

const Description = styled.div`
  display: block;
  margin-top: 8px;
  font-size: 18px;
  line-height: 1.5;

  p {
    margin: 0 0 16px 0;
  }

  p:last-child {
    margin-bottom: 0;
  }

  a {
    color: #037dd6;
    text-decoration: underline;
  }

  @media (max-width: 768px) {
    font-size: 16px;
  }
`

const CTAWrapper = styled.div`
  display: flex;
  flex-flow: wrap;
  margin-top: 32px;
  justify-content: center;
  gap: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`

const CTAButton = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 140px;
  min-height: 52px;
  padding: 8px 20px;
  border-radius: 999px;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.3;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 300ms ease, border 300ms ease, color 300ms ease;

  ${({ $variant }) =>
    $variant === 'primary'
      ? `
    background: #037dd6;
    color: #fff;
    border: none;

    &:hover {
      background: #1565c0;
    }
  `
      : ''}

  ${({ $variant }) =>
    $variant === 'secondary'
      ? `
    background: transparent;
    color: #037dd6;
    border: 1px solid #037dd6;

    &:hover {
      border-color: #1565c0;
      color: #1565c0;
    }
  `
      : ''}

  @media (max-width: 768px) {
    width: 100%;
    max-width: 300px;
  }
`
