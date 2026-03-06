/**
 * Interactive3DModel - 3D logo with responsive sizing
 *
 * @component
 * @description Renders an interactive 3D logo using WebGL.
 * Automatically adjusts size and camera distance based on viewport width.
 *
 * @prop {number} [left] - Left position offset (auto-calculated based on viewport)
 * @prop {number} [phi=0] - Rotation angle phi
 * @prop {number} [theta=Math.PI/2] - Rotation angle theta
 * @prop {number} [distance] - Camera distance (auto-calculated based on viewport)
 * @prop {Array<number>} [hemisphereAxis=[0.1, 0.5, 0.2]] - Hemisphere light axis
 * @prop {Array<number>} [hemisphereColor1=[1, 1, 1]] - Top hemisphere color RGB (0-1)
 * @prop {Array<number>} [hemisphereColor0=[1, 1, 1]] - Bottom hemisphere color RGB (0-1)
 * @prop {Array<number>} [fogColor=[0.5, 0.5, 0.5]] - Fog color RGB (0-1)
 * @prop {Array<number>} [interiorColor0=[1, 0.5, 0]] - Interior gradient start (orange)
 * @prop {Array<number>} [interiorColor1=[0.5, 0.2, 0]] - Interior gradient end (dark orange)
 * @prop {boolean} [enableZoom=false] - Enable zoom interaction
 * @prop {boolean} [followMouse=false] - Enable mouse tracking
 *
 * @example
 * <Interactive3DModel
 *   followMouse={true}
 *   enableZoom={false}
 * />
 *
 * @dependencies @metamask/logo (includes Three.js), styled-components
 * @animation 3D WebGL rendering with responsive camera distance
 *
 * @note This is a COMPLEX component with deep Three.js dependencies.
 * The MetamaskBoxAnimation component comes from @metamask/logo package.
 * Consider performance impact and lazy loading for production use.
 * Requires the Logo/MetamaskBoxAnimation subcomponent from @metamask/logo.
 */

import React, { useState, useEffect } from 'react'
import styled from 'styled-components'

// NOTE: This import requires the @metamask/logo package
// The MetamaskBoxAnimation component is part of that package
// You may need to adjust this import based on your setup
const MetamaskBoxAnimation = React.lazy(() =>
  import('@metamask/logo').then(module => ({
    default: module.MetamaskBoxAnimation || module.default
  }))
)

const Interactive3DModel = ({
  phi = 0,
  theta = Math.PI / 2,
  hemisphereAxis = [0.1, 0.5, 0.2],
  hemisphereColor1 = [1, 1, 1],
  hemisphereColor0 = [1, 1, 1],
  fogColor = [0.5, 0.5, 0.5],
  interiorColor0 = [1, 0.5, 0],
  interiorColor1 = [0.5, 0.2, 0],
  enableZoom = false,
  followMouse = false,
}) => {
  const [shouldMount, setShouldMount] = useState(false)
  const [left, setLeft] = useState(24)
  const [distance, setDistance] = useState(1200)

  const handleWindowSizeChange = () => {
    if (window.innerWidth < 480) {
      setLeft(0)
      setDistance(window.innerWidth * 1.5)
    } else if (window.innerWidth < 992) {
      setLeft(0)
      setDistance(window.innerWidth)
    } else if (window.innerWidth < 1400) {
      setDistance(window.innerWidth - 200)
    } else {
      setDistance(1200)
    }
  }

  useEffect(() => {
    handleWindowSizeChange()
    window.addEventListener('resize', handleWindowSizeChange)
    setShouldMount(true)
    return () => {
      window.removeEventListener('resize', handleWindowSizeChange)
    }
  }, [])

  return (
    <Wrapper id="fox-logo-container">
      {shouldMount && (
        <React.Suspense fallback={<div>Loading 3D model...</div>}>
          <MetamaskBoxAnimation
            left={left}
            phi={phi}
            theta={theta}
            distance={distance}
            hemisphereAxis={hemisphereAxis}
            hemisphereColor1={hemisphereColor1}
            hemisphereColor0={hemisphereColor0}
            fogColor={fogColor}
            interiorColor0={interiorColor0}
            interiorColor1={interiorColor1}
            noGLFallback={<div>WebGL not supported :(</div>}
            enableZoom={enableZoom}
            followMouse={followMouse}
          />
        </React.Suspense>
      )}
    </Wrapper>
  )
}

export default Interactive3DModel

const Wrapper = styled.div`
  position: absolute;
  width: 100%;
  max-width: 1800px;

  @media (max-width: 480px) {
    width: 150%;
  }

  &:before {
    content: '';
    display: block;
    padding-bottom: 100%;
  }
`
