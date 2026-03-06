# MetaMask-Style 3D SVG Mascot — Quick Start

## What You Have

| File | Purpose |
|---|---|
| `polar_bear.html` | Complete self-contained renderer with demo icosphere model |
| `convert-glb.js` | Zero-dependency GLB → JSON converter (Node.js) |

## Step 1: Test the Demo (right now)

Open `polar_bear.html` in your browser. You should see a colored icosphere that follows your mouse with smooth interpolation. This proves the renderer works.

## Step 2: Get the Hedgehog Model

1. Go to https://poly.pizza/m/8UNni5IvK_c
2. Click **Download**
3. Choose **GLTF** format (you'll get a `.glb` file)
4. Save it somewhere accessible, e.g. `~/Downloads/hedgehog.glb`

## Step 3: Convert GLB → JSON

```bash
# No npm install needed — zero dependencies!
node convert-glb.js ~/Downloads/hedgehog.glb hedgehog.json
```

This will print diagnostics to stderr and write the JSON to `hedgehog.json`. You'll see output like:
```
GLB v2, 48320 bytes
Meshes: 1
Materials: 1
  Primitive: 243 vertices
  Indices: 1128 (376 triangles)
  Vertex colors: 243 (float)
Total: 243 vertices, 376 faces
Color chunks (threshold=20):
  rgb(200,180,140) → 120 faces
  rgb(90,70,50) → 80 faces
  ...
```

## Step 4: Swap in Real Model Data

1. Open `hedgehog.json` — copy its entire contents
2. Open `polar_bear.html` in your editor
3. Find this line near the top of the `<script>`:
   ```js
   const MODEL_DATA = generateDemoModel();
   ```
4. Replace it with:
   ```js
   const MODEL_DATA = <paste your hedgehog.json here>;
   ```
5. Delete the `generateDemoModel()` function (it's no longer needed)
6. Save and refresh the browser

## Troubleshooting

| Problem | Fix |
|---|---|
| Model invisible | Backface cull direction is flipped. In `createFaceUpdater`, change `if (det < 0) continue;` to `if (det > 0) continue;` |
| Model inside-out (can see interior) | Same fix as above |
| Model sideways/upside-down | In `convert-glb.js`, the Z-flip line: `+(-(z - cz) * scale)` — try removing the negative, or swap Y and Z |
| Colors all grey | The model might not have vertex colors. Check the converter output for "Vertex colors" line. If missing, colors fall back to material base color |
| Model too big/small | Change `CAMERA_DISTANCE` constant (default 400). Larger = smaller model. Or adjust scale in converter |
| Jerky movement | Already using `requestAnimationFrame` loop. If still jerky, reduce polygon count or increase `LOOK_RATE` |
| Hairline gaps between faces | Stroke is already set to same color as fill. Try increasing `stroke-width` to `1` |

## Tuning Parameters

In `polar_bear.html`:
- `CAMERA_DISTANCE` (default 400) — how far the camera is from the model
- `LOOK_RATE` (default 0.3) — lerp speed. Higher = snappier, lower = smoother/laggier  
- `0.085` in `updateLookCurrent()` — vertical offset, makes model gaze slightly upward at rest
- `FOVY` (default π/4) — field of view in radians
- SVG `viewBox` and CSS dimensions — change 480 to whatever size you want

In `convert-glb.js`:
- Color grouping threshold (default 20) — lower = more color chunks (more detail), higher = fewer chunks (faster render)
- Scale factor (default: auto-fit to [-50, 50]) — adjust if model is too big/small

## Architecture Notes

This is a direct port of [MetaMask/logo](https://github.com/MetaMask/logo/blob/main/src/util.js). The rendering pipeline:

1. **Mouse input** → normalized to [-1, 1] relative to SVG bounds
2. **Lerp smoothing** → `lookCurrent = 0.7 * lookCurrent + 0.3 * mouseTarget`
3. **Matrix computation** → unproject mouse to 3D, build lookAt model matrix
4. **Position transform** → inline 4×4 × vec3 multiply with perspective divide (÷ w)
5. **Face update** → backface cull via cross-product det, clip→screen coord mapping
6. **Depth sort** → `zIndex = zmax + 0.25 * zmin`, sort descending
7. **DOM reorder** → `replaceChildren()` for painter's algorithm ordering

No Three.js, no WebGL, no Canvas — pure SVG `<polygon>` elements with software rasterization.
