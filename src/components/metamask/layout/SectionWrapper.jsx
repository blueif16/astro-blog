/**
 * SectionWrapper Component
 *
 * Responsive section container with configurable padding and max-width.
 *
 * Usage:
 * <SectionWrapper size="wide" customClass="my-section">
 *   <h1>Content here</h1>
 * </SectionWrapper>
 *
 * Props:
 * - size: 'wide' for 1200px max-width, default is 992px
 * - customClass: Additional CSS classes
 * - styleOverride: Custom CSS string to inject
 */

import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'

const SectionWrapper = props => {
  const { children, styleOverride, customClass, size, ...rest } = props
  return (
    <Container className={customClass} styleOverride={styleOverride} {...rest}>
      <ContainerInner size={size}>{children}</ContainerInner>
    </Container>
  )
}

export default SectionWrapper

SectionWrapper.propTypes = {
  styleOverride: PropTypes.string,
  customClass: PropTypes.string,
  size: PropTypes.oneOf(['wide', 'normal']),
}

const Container = styled.div`
  padding-right: 20px;
  padding-left: 20px;

  &.overlap-bg-32 {
    transform: translateY(32px);
    margin-bottom: 64px;
    @media (min-width: ${({ theme }) => theme.device.miniDesktop}) {
      margin-top: -32px;
    }
  }

  &.overflowHidden {
    overflow: hidden;
  }

  &.addMoreDesktopPb56 {
    @media (min-width: ${({ theme }) => theme.device.tablet}) {
      padding-bottom: 56px;
    }
  }

  ${({ styleOverride }) => styleOverride}
`

const ContainerInner = styled.div`
  margin-left: auto;
  margin-right: auto;
  max-width: var(--container-width, 992px);
  width: 100%;

  .normalContainer & {
    max-width: 992px;
  }

  ${({ size }) => size === 'wide' && 'max-width: 1200px;'}

  @media (max-width: ${({ theme }) => theme.device.miniDesktopMediaMax}) {
    max-width: var(--container-width-miniDesktop, 784px);
  }
`
