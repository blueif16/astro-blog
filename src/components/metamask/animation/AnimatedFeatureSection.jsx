/**
 * AnimatedFeatureSection - Feature section with scroll-triggered animations
 *
 * @component
 * @description Flexible feature section component with side-by-side image and content layout.
 * Supports scroll-triggered fade animations, multiple layout alignments, and background images.
 *
 * @prop {Object} [image] - Main feature image object with src/alt
 * @prop {Object} [imageMobile] - Mobile-specific image
 * @prop {Object} [imageDarkMode] - Dark mode image variant
 * @prop {Object} [imageMobileDarkMode] - Dark mode mobile image
 * @prop {string} [headline] - Heading text (HTML string)
 * @prop {boolean} [hideHeadline=false] - Hide headline visually
 * @prop {string} [description] - Description text (HTML string)
 * @prop {string} [eyebrow] - Small text above headline
 * @prop {Array<Object>} [featureItems] - Array of nested feature components
 * @prop {Object} [cta] - Primary CTA button object
 * @prop {Object} [ctaSecond] - Secondary CTA button object
 * @prop {Object} [embed] - Video embed object
 * @prop {string} [contentAlignment='left'] - Content position: 'left', 'right', 'center', 'vertical'
 * @prop {string} [imageAlignment] - Image alignment within container
 * @prop {string} [imageWidth] - Custom image width
 * @prop {boolean} [animation=true] - Enable scroll-triggered animations
 * @prop {string} [backgroundColor] - Background color variant
 * @prop {Object} [backgroundImage] - Background image object
 * @prop {Object} [backgroundImageDarkMode] - Dark mode background
 * @prop {Object} [backgroundImageMobile] - Mobile background
 * @prop {boolean} [alignItemsCenter=false] - Vertically center content
 * @prop {string} [contentPaddingTop] - Custom content padding-top
 * @prop {boolean} [headlineMarginTop0=false] - Remove headline top margin
 * @prop {string} [sectionPadding] - Custom section padding
 * @prop {boolean} [noPaddingBottom=false] - Remove bottom padding
 * @prop {boolean} [imageShadow=false] - Add drop shadow to image
 * @prop {boolean} [hideImageOnMobile=false] - Hide image on mobile
 * @prop {string} [imageLink] - Make image clickable with URL
 * @prop {string} [customClass] - Additional CSS classes
 * @prop {string} [moduleId] - HTML id attribute
 *
 * @example
 * <AnimatedFeatureSection
 *   headline="<h2>Secure Wallet</h2>"
 *   description="<p>Your keys, your crypto</p>"
 *   image={{ src: '/wallet.png', alt: 'Wallet' }}
 *   contentAlignment="left"
 *   animation
 * />
 *
 * @dependencies react-animate-on-scroll, styled-components
 * @animation ScrollAnimation (fadeInLeftMini, fadeInRightMini) based on content alignment
 */

import React, { useRef } from 'react'
import ScrollAnimation from 'react-animate-on-scroll'
import styled from 'styled-components'

const AnimatedFeatureSection = ({
  image,
  imageMobile,
  imageDarkMode,
  imageMobileDarkMode,
  headline,
  hideHeadline = false,
  description,
  eyebrow,
  featureItems = [],
  cta,
  ctaSecond,
  embed,
  contentAlignment = 'left',
  imageAlignment,
  imageWidth,
  animation = true,
  backgroundColor,
  backgroundImage,
  backgroundImageDarkMode,
  backgroundImageMobile,
  alignItemsCenter = false,
  contentPaddingTop,
  headlineMarginTop0 = false,
  sectionPadding,
  noPaddingBottom = false,
  imageShadow = false,
  hideImageOnMobile = false,
  imageLink,
  customClass = '',
  moduleId,
  children, // For CTA buttons and feature items passed as children
}) => {
  const elementRef = useRef()

  const contentAlignLR = ['left', 'right'].includes(contentAlignment)
    ? contentAlignment
    : ''

  const isContentAlignVertical = contentAlignment === 'vertical'

  const innerContent = (
    <>
      {eyebrow && (
        <EyebrowStyle dangerouslySetInnerHTML={{ __html: eyebrow }} />
      )}
      {headline && (
        <Headline
          hasEyebrow={!!eyebrow}
          hasCta={!!cta}
          hideHeadline={hideHeadline}
          headlineMarginTop0={headlineMarginTop0}
        >
          <div dangerouslySetInnerHTML={{ __html: headline }} />
        </Headline>
      )}
      {description && (
        <Description sectionPadding={sectionPadding}>
          <div dangerouslySetInnerHTML={{ __html: description }} />
        </Description>
      )}
      {featureItems.length > 0 && (
        <FeatureItems>
          {featureItems.map((item, index) => (
            <FeatureItem key={index}>{item}</FeatureItem>
          ))}
        </FeatureItems>
      )}
      {cta && !isContentAlignVertical && (
        <CTAWrapper className="hidden-mobile">{children}</CTAWrapper>
      )}
    </>
  )

  const imageContent = (
    <ImageSrc
      widthImg={imageWidth}
      imageAlignment={imageAlignment}
      href={imageLink}
      as={imageLink ? 'a' : 'div'}
    >
      <img
        src={
          (imageMobile && window.innerWidth < 768 ? imageMobile : image) ||
          image
        }
        alt=""
      />
    </ImageSrc>
  )

  return (
    <Container
      ref={elementRef}
      sectionPadding={sectionPadding}
      className={`
        ${noPaddingBottom ? 'noPaddingBottom' : ''}
        ${backgroundColor ? `bg-${backgroundColor}` : ''}
        ${customClass}
      `.trim()}
      id={moduleId}
    >
      <BackgroundImageWrapper
        $backgroundImage={backgroundImage}
        $backgroundImageMobile={backgroundImageMobile}
      >
        <ContentWrapper className={customClass}>
          <FeatureWrapper
            contentAlignLR={contentAlignLR}
            isContentAlignVertical={isContentAlignVertical}
            alignItemsCenter={alignItemsCenter}
            imageWidth={imageWidth}
            backgroundColor={backgroundColor}
            imageShadow={imageShadow}
            hideImageOnMobile={hideImageOnMobile}
            sectionPadding={sectionPadding}
          >
            {(image || imageMobile) && (
              <SideImage>
                <Image>
                  {animation ? (
                    <ScrollAnimation
                      animateIn={
                        contentAlignLR === 'right'
                          ? 'fadeInLeftMini'
                          : 'fadeInRightMini'
                      }
                      initiallyVisible
                      animateOnce
                      delay={0}
                      offset={0}
                    >
                      {imageContent}
                    </ScrollAnimation>
                  ) : (
                    imageContent
                  )}
                </Image>
              </SideImage>
            )}
            {embed && (
              <SideEmbed>
                <div dangerouslySetInnerHTML={{ __html: embed.html }} />
              </SideEmbed>
            )}
            <FeatureInner
              withContent={imageWidth}
              contentPaddingTop={contentPaddingTop}
            >
              {animation ? (
                <ScrollAnimation
                  animateIn={
                    contentAlignLR === 'left'
                      ? 'fadeInLeftMini'
                      : 'fadeInRightMini'
                  }
                  animateOnce
                  delay={0}
                  offset={0}
                >
                  {innerContent}
                </ScrollAnimation>
              ) : (
                <div>{innerContent}</div>
              )}
            </FeatureInner>
            {cta && isContentAlignVertical && (
              <CTAWrapper>{children}</CTAWrapper>
            )}
          </FeatureWrapper>
          {cta && !isContentAlignVertical && (
            <CTAWrapper className="hidden-desktop">{children}</CTAWrapper>
          )}
        </ContentWrapper>
      </BackgroundImageWrapper>
    </Container>
  )
}

export default AnimatedFeatureSection

const Container = styled.section`
  padding: ${({ sectionPadding }) => sectionPadding || '80px 0'};

  &.noPaddingBottom {
    padding-bottom: 0;
  }

  &.bg-white { background-color: #fff; }
  &.bg-gray { background-color: #f7f7f7; }
  &.bg-default { background-color: transparent; }
`

const BackgroundImageWrapper = styled.div`
  ${({ $backgroundImage }) =>
    $backgroundImage &&
    `
    background-image: url(${$backgroundImage});
    background-size: cover;
    background-position: center;
  `}

  @media (max-width: 767px) {
    ${({ $backgroundImageMobile }) =>
      $backgroundImageMobile &&
      `
      background-image: url(${$backgroundImageMobile});
    `}
  }
`

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`

const Image = styled.div`
  display: block;
  width: 100%;
`

const SideImage = styled.div`
  display: block;
  flex: 1;
  min-width: 0;

  @media (max-width: 767px) {
    .noPaddingBottom & {
      margin-bottom: 0 !important;
    }
  }
`

const SideEmbed = styled.div`
  display: block;
  flex: 1;
  min-width: 0;

  @media (max-width: 767px) {
    width: 100%;

    .noPaddingBottom & {
      margin-bottom: 0 !important;
    }
  }
`

const ImageSrc = styled.div`
  margin: 0 auto;
  max-width: 100%;
  width: auto;
  height: auto;
  display: block;

  img {
    display: block;
    width: 100%;
    height: auto;
  }

  ${({ widthImg }) =>
    widthImg &&
    `
    width: ${widthImg};
    @media (max-width: 767px) {
      width: 100%;
    }
  `}

  ${({ imageAlignment }) =>
    imageAlignment === 'left' &&
    `
    margin: 0 auto 0 0;
  `}

  ${({ imageAlignment }) =>
    imageAlignment === 'right' &&
    `
    margin: 0 0 0 auto;
  `}
`

const Headline = styled.h2`
  padding-bottom: 20px;
  font-weight: 700;

  ${({ hideHeadline }) =>
    hideHeadline &&
    `
    display: none;
  `}

  ${({ headlineMarginTop0 }) =>
    headlineMarginTop0 ? 'margin-top: 0;' : 'margin-top: 40px;'}

  ${({ hasEyebrow }) =>
    hasEyebrow &&
    `
    @media (max-width: 767px) {
      margin-top: 0;
      padding-top: 0;
    }
  `}

  @media (max-width: 767px) {
    font-size: 28px;
    line-height: 32px;
    margin-bottom: 15px;
    margin-top: 16px;
    padding-bottom: 0;
    padding-top: 0;
    text-align: center;
  }
`

const Description = styled.div`
  display: block;

  @media (max-width: 767px) {
    text-align: center;

    * {
      max-width: initial !important;
    }
  }
`

const FeatureWrapper = styled.div`
  display: flex;
  margin: -10px;

  @media (max-width: 767px) {
    flex-direction: column-reverse;
    margin: 0;
    align-items: center;
    text-align: center;
    row-gap: 32px;
  }

  ${({ hideImageOnMobile }) =>
    hideImageOnMobile &&
    `
    @media (max-width: 767px) {
      ${SideImage} {
        display: none;
      }
      ${SideEmbed} {
        display: none;
      }
    }
  `}

  ${({ imageShadow }) =>
    imageShadow &&
    `
    img {
      filter: drop-shadow(0px 0px 30px rgba(0, 0, 0, 0.1));
    }
  `}

  ${({ contentAlignLR }) =>
    contentAlignLR === 'left' &&
    `
    @media (min-width: 768px) {
      flex-direction: row-reverse;
    }
  `}

  ${({ isContentAlignVertical }) =>
    isContentAlignVertical &&
    `
    flex-direction: column !important;
    row-gap: 0;
    ${CTAWrapper} {
      order: 4;
      margin-top: 20px;
    }
    ${SideImage} {
      order: 3;
    }
    ${SideEmbed} {
      order: 3;
    }
    ${FeatureInner} {
      order: 2;
    }
  `}

  ${({ alignItemsCenter }) =>
    alignItemsCenter &&
    `
    align-items: center;
    justify-content: center;
  `}

  ${({ alignItemsCenter, isContentAlignVertical }) =>
    alignItemsCenter &&
    isContentAlignVertical &&
    `
    text-align: center;
  `}

  & > * {
    padding: 10px;
    @media (max-width: 767px) {
      padding: 0 10px;
    }
  }

  ${({ sectionPadding }) =>
    sectionPadding === '0px' &&
    `
    & > * {
      padding-bottom: 0px;
    }
  `}
`

const FeatureInner = styled.div`
  display: block;

  ${({ contentPaddingTop }) =>
    contentPaddingTop &&
    `
    padding-top: ${contentPaddingTop};
  `}

  ${({ withContent }) =>
    withContent ? `width: ${withContent};` : 'width: 50%'}

  @media (max-width: 767px) {
    width: 100%;
    padding-top: 0;
  }
`

const CTAWrapper = styled.div`
  display: flex;
  row-gap: 8px;
  column-gap: 16px;
  margin-top: 40px;

  a {
    min-width: 160px;
  }

  @media (max-width: 767px) {
    justify-content: center;
  }

  &.hidden-mobile {
    @media (max-width: 767px) {
      display: none;
    }
  }

  &.hidden-desktop {
    @media (min-width: 768px) {
      display: none;
    }
  }
`

const FeatureItems = styled.div`
  display: block;
  margin-top: 32px;
  margin-right: 32px;

  @media (max-width: 767px) {
    margin: 32px 0 auto auto;
  }
`

const FeatureItem = styled.div`
  &:not(:last-child) {
    margin-bottom: 48px;
  }
`

const EyebrowStyle = styled.div`
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 16px;
  color: #037dd6;
`
