/**
 * AnimatedCarousel - Feature slider with scroll animations and auto-rotation
 *
 * @component
 * @description Interactive feature carousel with clickable titles that reveal descriptions.
 * Includes scroll-triggered fade animations and optional auto-rotation slideshow.
 *
 * @prop {string} [headline] - Main heading text (HTML string)
 * @prop {string} [description] - Description text (HTML string)
 * @prop {Array<Object>} featureSliderItems - Array of slide items with title, description, image, imageMobile, customClass
 * @prop {string} [layoutType] - Layout variant class name
 * @prop {string} [sectionPadding] - Custom section padding value
 * @prop {boolean} [slideShow=false] - Enable auto-rotation every 5 seconds
 * @prop {boolean} [animation=true] - Enable scroll-triggered fade animations
 * @prop {Object} [cta] - Primary CTA button object
 * @prop {Object} [ctaSecond] - Secondary CTA button object
 * @prop {string} [backgroundColor] - Background color variant
 * @prop {string} [customClass] - Additional CSS class names
 *
 * @example
 * <AnimatedCarousel
 *   headline="<h2>Features</h2>"
 *   featureSliderItems={[
 *     { title: 'Feature 1', description: 'Details...', image: {...} },
 *     { title: 'Feature 2', description: 'Details...', image: {...} }
 *   ]}
 *   slideShow
 *   animation
 * />
 *
 * @dependencies react-animate-on-scroll, styled-components
 * @animation ScrollAnimation (fadeInLeftMini, fadeInRightMini), CSS transitions for title/description
 */

import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

const AnimatedCarousel = ({
  headline,
  description,
  featureSliderItems = [],
  layoutType,
  sectionPadding,
  slideShow = false,
  animation = true,
  cta,
  ctaSecond,
  backgroundColor,
  customClass,
  children, // For CTA buttons passed as children
}) => {
  const timeoutRef = useRef(null)
  const [activeItem, setActiveItem] = useState(0)

  function resetTimeout() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }

  useEffect(() => {
    if (slideShow && featureSliderItems.length > 0) {
      resetTimeout()
      timeoutRef.current = setTimeout(() => {
        if (activeItem + 1 === featureSliderItems.length) {
          setActiveItem(0)
        } else {
          setActiveItem(activeItem + 1)
        }
      }, 5000)
      return () => {
        resetTimeout()
      }
    }
  }, [activeItem, slideShow, featureSliderItems.length])

  const imageContent = (image, imageMobile, itemCustomClass) => (
    <ImageSrc className={itemCustomClass}>
      <img
        src={imageMobile && window.innerWidth < 768 ? imageMobile : image}
        alt=""
      />
    </ImageSrc>
  )

  const innerContent = (
    <InnerContent>
      {headline && (
        <Headline>
          <div dangerouslySetInnerHTML={{ __html: headline }} />
        </Headline>
      )}
      {description && (
        <Description sectionPadding={sectionPadding}>
          <div dangerouslySetInnerHTML={{ __html: description }} />
        </Description>
      )}
      <SliderTextWrapper>
        {featureSliderItems.map((item, index) => (
          <SliderText className="dl-checklist fadeIn" key={index}>
            <SliderTitle
              className={activeItem === index ? 'active' : ''}
              onClick={() => setActiveItem(index)}
            >
              {item.title}
            </SliderTitle>
            <SliderDescription>
              <div dangerouslySetInnerHTML={{ __html: item.description }} />
            </SliderDescription>
            <div className="hidden-desktop">
              {imageContent(item.image, item.imageMobile, item.customClass)}
            </div>
          </SliderText>
        ))}
      </SliderTextWrapper>
      {(cta || ctaSecond) && (
        <CTAWrapper className="hidden-mobile">{children}</CTAWrapper>
      )}
    </InnerContent>
  )

  return (
    <Container
      sectionPadding={sectionPadding}
      className={backgroundColor ? `bg-${backgroundColor}` : ''}
    >
      <ContentWrapper className={`${customClass} ${featureSliderItems[activeItem]?.customClass || ''}`}>
        <FeatureSliderWrapper className={layoutType ? `layout-${layoutType}` : ''}>
          <FeatureSliderInner>
            <div className={animation ? 'fadeInLeftMini' : ''}>
              {innerContent}
            </div>
          </FeatureSliderInner>
          <SliderImage className="hidden-mobile">
            <div className={animation ? 'fadeInRightMini' : ''}>
              {featureSliderItems.map((item, index) => (
                <SliderImageItem
                  className={`fadeIn ${activeItem === index ? 'active' : ''}`}
                  key={index}
                >
                  {imageContent(item.image, item.imageMobile)}
                </SliderImageItem>
              ))}
            </div>
          </SliderImage>
        </FeatureSliderWrapper>
        {(cta || ctaSecond) && (
          <CTAWrapper className="hidden-desktop">{children}</CTAWrapper>
        )}
      </ContentWrapper>
    </Container>
  )
}

export default AnimatedCarousel

const Container = styled.section`
  padding: ${({ sectionPadding }) => sectionPadding || '80px 0'};

  &.bg-white { background-color: #fff; }
  &.bg-gray { background-color: #f7f7f7; }
  &.bg-default { background-color: transparent; }
`

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`

const FeatureSliderWrapper = styled.div`
  display: flex;
  align-items: center;
  margin: -10px;
`

const Headline = styled.h2`
  padding-bottom: 20px;
  font-weight: 700;

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

const CTAWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  margin-top: 40px;

  a {
    min-width: 160px;
  }

  @media (max-width: 767px) {
    margin: 24px;
    align-items: center;
  }

  .hidden-mobile {
    @media (max-width: 767px) {
      display: none;
    }
  }

  .hidden-desktop {
    @media (min-width: 768px) {
      display: none;
    }
  }
`

const SliderTitle = styled.dt`
  @media (min-width: 768px) {
    cursor: pointer;
    color: #adadad;
    transition: all 0.3s ease;

    .dl-checklist &:before {
      background-color: #adadad;
      transition: all 0.3s ease;
    }

    &.active {
      color: #24292e;

      & + dd {
        max-height: 100px;
        opacity: 1;
      }

      &::before {
        background-color: #2c56dd;
      }
    }
  }
`

const SliderDescription = styled.dd`
  @media (min-width: 768px) {
    transition: opacity 0.3s ease;
    max-height: 0;
    opacity: 0;
    overflow-y: hidden;
  }

  p:last-child {
    margin-bottom: 0;
  }
`

const SliderText = styled.dl`
  @media (max-width: 767px) {
    img.sideImageOverflowRight {
      margin-right: -20px;
    }
  }
  animation-duration: 0.5s;
`

const SliderImage = styled.div`
  padding: 10px;
  flex: 1 1 0%;

  &.hidden-mobile {
    @media (max-width: 767px) {
      display: none;
    }
  }
`

const SliderImageItem = styled.div`
  display: none;

  &.active {
    display: block;
  }
  animation-duration: 0.5s;

  .imageMaxHeight525 & img {
    max-height: 525px;
  }
`

const ImageSrc = styled.div`
  margin: 0 auto;
  max-width: 100%;
  width: auto;
  height: auto;
  display: flex;

  img {
    margin-left: auto;
    margin-right: auto;
  }
`

const FeatureSliderInner = styled.div`
  width: 50%;
  padding: 10px;

  @media (max-width: 767px) {
    width: 100%;
  }
`

const SliderTextWrapper = styled.div`
  @media (min-width: 768px) {
    margin: 32px 0;
  }
`

const InnerContent = styled.div`
  @media (min-width: 768px) {
    .contentMaxWidth500 & {
      max-width: 500px;
    }
  }

  .hidden-desktop {
    @media (min-width: 768px) {
      display: none;
    }
  }
`
