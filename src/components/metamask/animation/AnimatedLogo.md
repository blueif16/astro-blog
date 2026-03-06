# AnimatedLogo

## Description
Interactive 3D logo animation (MetaMask fox or flask) that follows mouse movement using WebGL rendering.

## Effect
3D rendered logo that rotates and responds to mouse position. Smooth WebGL animation with realistic lighting and shading. Automatically scales down on mobile devices.

## Animation Libraries
- **@metamask/logo** - 3D WebGL logo renderer with mouse tracking and custom mesh support

## Props
- `logoType` (string, default: 'flask') - Logo type: 'flask' or default (fox)
- `width` (number, default: 230) - Logo width in pixels (auto 130 on mobile)
- `height` (number, default: 230) - Logo height in pixels (auto 130 on mobile)
- `followMouse` (boolean, default: true) - Enable mouse tracking

## Preview
3D rendered logo that smoothly rotates following cursor movement. Flask variant uses custom mesh JSON data. Responsive sizing for mobile devices.

## Dependencies
```json
{
  "@metamask/logo": "^3.1.0"
}
```

## Additional Files Required
- `flask.json` - 3D mesh data for flask logo (19KB JSON file)
- Place in same directory as component

## Original Source
`/Users/tk/Desktop/mm-temp/src/components/LogoAnimation/index.js`

## Usage Example
```jsx
import AnimatedLogo from './AnimatedLogo'

<AnimatedLogo
  logoType="flask"
  width={250}
  height={250}
  followMouse
/>
```

## Notes
- Requires WebGL support in browser
- Performance-intensive on lower-end devices
- Consider lazy loading for better initial page load
- The flask.json mesh file must be copied from original source
