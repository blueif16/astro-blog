# Interactive3DModel

## Description
Interactive 3D MetaMask fox logo animation with responsive sizing and mouse tracking. Uses WebGL rendering for smooth 3D effects.

## Effect
3D rendered fox logo that rotates and follows mouse movement. Responsive sizing based on viewport width with smooth transitions. Positioned absolutely within container.

## Animation Libraries
- **@metamask/logo** - 3D WebGL fox logo renderer via MetamaskBoxAnimation component
- **Three.js** (internal dependency) - WebGL 3D rendering engine

## Props
- `left` (number, auto-calculated) - Left position offset
- `phi` (number, default: 0) - Rotation angle phi
- `theta` (number, default: Math.PI/2) - Rotation angle theta
- `distance` (number, auto-calculated) - Camera distance based on viewport
- `hemisphereAxis` (array, default: [0.1, 0.5, 0.2]) - Hemisphere light axis
- `hemisphereColor1` (array, default: [1, 1, 1]) - Top hemisphere color (RGB 0-1)
- `hemisphereColor0` (array, default: [1, 1, 1]) - Bottom hemisphere color (RGB 0-1)
- `fogColor` (array, default: [0.5, 0.5, 0.5]) - Fog color (RGB 0-1)
- `interiorColor0` (array, default: [1, 0.5, 0]) - Interior gradient start (orange)
- `interiorColor1` (array, default: [0.5, 0.2, 0]) - Interior gradient end (dark orange)
- `enableZoom` (boolean, default: false) - Enable zoom interaction
- `followMouse` (boolean, default: false) - Enable mouse tracking

## Preview
3D MetaMask fox logo with orange interior gradient and white lighting. Automatically scales based on viewport: mobile (1.5x width), tablet (1x width), desktop (1200px or width-200px). Positioned absolutely with aspect ratio maintained.

## Dependencies
```json
{
  "@metamask/logo": "^3.1.0",
  "styled-components": "^5.3.9"
}
```

## Original Source
`/Users/tk/Desktop/mm-temp/src/components/FoxAnimation/index.js`

## Usage Example
```jsx
import Interactive3DModel from './Interactive3DModel'

<div style={{ position: 'relative', height: '400px' }}>
  <Interactive3DModel />
</div>
```

## Notes
- Requires WebGL support
- Performance-intensive - consider lazy loading
- The MetamaskBoxAnimation component is from @metamask/logo package
- Component mounts only on client-side (checks window object)
- Automatically adjusts distance/position on window resize
- **COMPLEX**: This component has deep dependencies on Three.js and custom shaders. Consider skipping if not essential.
