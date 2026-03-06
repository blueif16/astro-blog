/**
 * AnimatedLogo - Interactive 3D logo animation using @metamask/logo
 *
 * @component
 * @description Renders an interactive 3D logo (fox or flask) that follows mouse movement.
 * Uses WebGL rendering via @metamask/logo library with custom mesh JSON data.
 *
 * @prop {string} logoType - Type of logo to render: 'flask' or default (fox)
 * @prop {number} [width=230] - Logo width in pixels (130 on mobile)
 * @prop {number} [height=230] - Logo height in pixels (130 on mobile)
 * @prop {boolean} [followMouse=true] - Enable mouse tracking
 *
 * @example
 * <AnimatedLogo logoType="flask" width={250} height={250} />
 *
 * @dependencies @metamask/logo (3D rendering library)
 * @animation 3D WebGL animation with mouse tracking, requires flask.json mesh data
 *
 * @note This component requires the @metamask/logo package and mesh JSON files.
 * The flask.json file should be placed in the same directory as this component.
 * This is a complex 3D animation - consider performance impact on lower-end devices.
 */

import React, { useEffect, useState } from 'react'

const AnimatedLogo = ({
  logoType = 'flask',
  width = 230,
  height = 230,
  followMouse = true
}) => {
  const [isSmallScreen, setIsSmallScreen] = useState(false)

  const handleWindowSizeChange = () => {
    if (window.innerWidth < 768) {
      setIsSmallScreen(true)
    } else {
      setIsSmallScreen(false)
    }
  }

  useEffect(() => {
    let viewer

    window.addEventListener('resize', handleWindowSizeChange)
    handleWindowSizeChange()

    if (typeof window !== 'undefined' && window.document) {
      // Dynamic import to avoid SSR issues
      import('@metamask/logo').then((ModelViewer) => {
        let meshJson

        // Load mesh data based on logo type
        switch (logoType) {
          case 'flask':
            // Import flask.json from same directory
            meshJson = require('./flask.json')
            break
          default:
            // Default fox logo (uses built-in mesh)
            meshJson = undefined
        }

        const logoWidth = isSmallScreen ? 130 : width
        const logoHeight = isSmallScreen ? 130 : height

        viewer = ModelViewer.default({
          pxNotRatio: true,
          width: logoWidth,
          height: logoHeight,
          followMouse: followMouse,
          meshJson,
        })

        const container = document.getElementById('logo-container')
        if (container) {
          container.replaceChildren('')
          container.appendChild(viewer.container)
        }
      }).catch(err => {
        console.error('Failed to load @metamask/logo:', err)
      })
    }

    return () => {
      window.removeEventListener('resize', handleWindowSizeChange)
      if (viewer && viewer.container) {
        viewer.container.remove()
      }
    }
  }, [logoType, isSmallScreen, width, height, followMouse])

  return <div id="logo-container" style={{ width: '100%', height: '100%' }} />
}

export default AnimatedLogo
