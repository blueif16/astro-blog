#!/usr/bin/env node
/**
 * convert-glb.js — Zero-dependency GLB → JSON converter
 * 
 * Parses a GLB (glTF 2.0 binary) file and outputs the JSON format
 * needed by the MetaMask-style SVG renderer.
 * 
 * Handles:
 *   - Vertex positions (POSITION attribute)
 *   - Face indices (SCALAR accessor)
 *   - Vertex colors (COLOR_0 attribute) → averaged per-face → grouped by similar color
 *   - Material base colors (pbrMetallicRoughness.baseColorFactor) as fallback
 *   - Non-indexed meshes (auto-generates indices)
 *   - Multiple mesh primitives
 * 
 * Usage:
 *   node convert-glb.js <input.glb> [output.json]
 *   node convert-glb.js hedgehog.glb                    → prints to stdout
 *   node convert-glb.js hedgehog.glb hedgehog.json      → writes file
 * 
 * Output format:
 * {
 *   "positions": [[x,y,z], ...],
 *   "chunks": [
 *     { "color": [R,G,B], "faces": [[i0,i1,i2], ...] }
 *   ]
 * }
 */

const fs = require('fs');
const path = require('path');

// ─── GLB Binary Parsing ─────────────────────────────────────────────────────

const GLB_MAGIC = 0x46546C67;  // "glTF"
const CHUNK_JSON = 0x4E4F534A; // "JSON"
const CHUNK_BIN  = 0x004E4942; // "BIN\0"

// glTF component types → byte sizes
const COMPONENT_BYTES = {
  5120: 1, // BYTE
  5121: 1, // UNSIGNED_BYTE
  5122: 2, // SHORT
  5123: 2, // UNSIGNED_SHORT
  5125: 4, // UNSIGNED_INT
  5126: 4, // FLOAT
};

// glTF type string → component count
const TYPE_COMPONENTS = {
  'SCALAR': 1,
  'VEC2': 2,
  'VEC3': 3,
  'VEC4': 4,
  'MAT2': 4,
  'MAT3': 9,
  'MAT4': 16,
};

function parseGLB(buffer) {
  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  
  // Header: magic(4) + version(4) + length(4)
  const magic = view.getUint32(0, true);
  if (magic !== GLB_MAGIC) {
    throw new Error(`Not a GLB file (magic: 0x${magic.toString(16)})`);
  }
  const version = view.getUint32(4, true);
  const totalLength = view.getUint32(8, true);
  console.error(`GLB v${version}, ${totalLength} bytes`);

  let jsonData = null;
  let binBuffer = null;
  let offset = 12;

  // Parse chunks
  while (offset < totalLength) {
    const chunkLength = view.getUint32(offset, true);
    const chunkType = view.getUint32(offset + 4, true);
    const chunkData = buffer.slice(offset + 8, offset + 8 + chunkLength);

    if (chunkType === CHUNK_JSON) {
      jsonData = JSON.parse(chunkData.toString('utf8'));
    } else if (chunkType === CHUNK_BIN) {
      binBuffer = chunkData;
    }
    // Align to 4-byte boundary
    offset += 8 + chunkLength;
  }

  if (!jsonData) throw new Error('No JSON chunk found in GLB');
  return { json: jsonData, bin: binBuffer };
}

// ─── Accessor Data Extraction ────────────────────────────────────────────────

function getAccessorData(gltf, bin, accessorIndex) {
  const accessor = gltf.accessors[accessorIndex];
  const bufferView = gltf.bufferViews[accessor.bufferView];
  
  const componentSize = COMPONENT_BYTES[accessor.componentType];
  const numComponents = TYPE_COMPONENTS[accessor.type];
  const count = accessor.count;
  
  const byteOffset = (bufferView.byteOffset || 0) + (accessor.byteOffset || 0);
  const byteStride = bufferView.byteStride || (componentSize * numComponents);
  
  const result = [];
  
  for (let i = 0; i < count; i++) {
    const elementOffset = byteOffset + i * byteStride;
    const components = [];
    
    for (let c = 0; c < numComponents; c++) {
      const cOffset = elementOffset + c * componentSize;
      let value;
      
      switch (accessor.componentType) {
        case 5126: // FLOAT
          value = bin.readFloatLE(cOffset);
          break;
        case 5123: // UNSIGNED_SHORT
          value = bin.readUInt16LE(cOffset);
          break;
        case 5125: // UNSIGNED_INT
          value = bin.readUInt32LE(cOffset);
          break;
        case 5121: // UNSIGNED_BYTE
          value = bin.readUInt8(cOffset);
          break;
        case 5122: // SHORT
          value = bin.readInt16LE(cOffset);
          break;
        case 5120: // BYTE
          value = bin.readInt8(cOffset);
          break;
        default:
          throw new Error(`Unsupported component type: ${accessor.componentType}`);
      }
      components.push(value);
    }
    
    result.push(numComponents === 1 ? components[0] : components);
  }
  
  return { data: result, accessor };
}

// ─── Color Utilities ─────────────────────────────────────────────────────────

function colorDistance(a, b) {
  return Math.sqrt(
    (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2
  );
}

// Quantize vertex colors into buckets to reduce chunk count.
// threshold: max Euclidean distance in 0-255 RGB space to merge colors
function groupFacesByColor(faces, threshold = 20) {
  const buckets = []; // { color: [R,G,B], faces: [[i0,i1,i2], ...] }
  
  for (const { face, color } of faces) {
    let matched = false;
    for (const bucket of buckets) {
      if (colorDistance(bucket.color, color) < threshold) {
        bucket.faces.push(face);
        // Running average of color
        const n = bucket.faces.length;
        bucket.color = [
          Math.round((bucket.color[0] * (n - 1) + color[0]) / n),
          Math.round((bucket.color[1] * (n - 1) + color[1]) / n),
          Math.round((bucket.color[2] * (n - 1) + color[2]) / n),
        ];
        matched = true;
        break;
      }
    }
    if (!matched) {
      buckets.push({ color: [...color], faces: [face] });
    }
  }
  
  return buckets;
}

// ─── Main Conversion ─────────────────────────────────────────────────────────

function convertGLB(inputPath) {
  const raw = fs.readFileSync(inputPath);
  const { json: gltf, bin } = parseGLB(raw);

  console.error(`Meshes: ${gltf.meshes.length}`);
  console.error(`Materials: ${(gltf.materials || []).length}`);
  
  // Collect all positions globally (we'll merge all primitives into one)
  const allPositions = [];
  const allFacesWithColor = [];
  let globalVertexOffset = 0;

  for (const mesh of gltf.meshes) {
    for (const primitive of mesh.primitives) {
      // --- Positions ---
      if (primitive.attributes.POSITION === undefined) {
        console.error('  Skipping primitive without POSITION attribute');
        continue;
      }
      
      const { data: positions } = getAccessorData(gltf, bin, primitive.attributes.POSITION);
      console.error(`  Primitive: ${positions.length} vertices`);
      
      for (const p of positions) {
        allPositions.push(p);
      }
      
      // --- Indices ---
      let indices;
      if (primitive.indices !== undefined) {
        const { data: indexData } = getAccessorData(gltf, bin, primitive.indices);
        indices = indexData;
      } else {
        // Non-indexed: generate sequential indices
        indices = Array.from({ length: positions.length }, (_, i) => i);
      }
      console.error(`  Indices: ${indices.length} (${indices.length / 3} triangles)`);
      
      // --- Vertex Colors (optional) ---
      let vertexColors = null;
      if (primitive.attributes.COLOR_0 !== undefined) {
        const colorResult = getAccessorData(gltf, bin, primitive.attributes.COLOR_0);
        vertexColors = colorResult.data;
        const isNormalized = colorResult.accessor.componentType === 5121; // UNSIGNED_BYTE
        
        // Normalize to 0-1 range if stored as bytes
        if (isNormalized) {
          vertexColors = vertexColors.map(c => 
            Array.isArray(c) ? c.map(v => v / 255) : [c / 255]
          );
        }
        console.error(`  Vertex colors: ${vertexColors.length} (${isNormalized ? 'byte' : 'float'})`);
      }
      
      // --- Material fallback color ---
      let materialColor = [200, 200, 200]; // default grey
      if (primitive.material !== undefined && gltf.materials) {
        const mat = gltf.materials[primitive.material];
        if (mat.pbrMetallicRoughness && mat.pbrMetallicRoughness.baseColorFactor) {
          const [r, g, b] = mat.pbrMetallicRoughness.baseColorFactor;
          materialColor = [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
        }
        console.error(`  Material: "${mat.name || 'unnamed'}" → rgb(${materialColor})`);
      }
      
      // --- Build face list with per-face colors ---
      for (let i = 0; i < indices.length; i += 3) {
        const i0 = indices[i];
        const i1 = indices[i + 1];
        const i2 = indices[i + 2];
        
        let faceColor;
        if (vertexColors) {
          // Average the 3 vertex colors for this face
          const c0 = vertexColors[i0];
          const c1 = vertexColors[i1];
          const c2 = vertexColors[i2];
          faceColor = [
            Math.round(((c0[0] + c1[0] + c2[0]) / 3) * 255),
            Math.round(((c0[1] + c1[1] + c2[1]) / 3) * 255),
            Math.round(((c0[2] + c1[2] + c2[2]) / 3) * 255),
          ];
        } else {
          faceColor = materialColor;
        }
        
        allFacesWithColor.push({
          face: [
            i0 + globalVertexOffset,
            i1 + globalVertexOffset,
            i2 + globalVertexOffset,
          ],
          color: faceColor,
        });
      }
      
      globalVertexOffset += positions.length;
    }
  }
  
  console.error(`\nTotal: ${allPositions.length} vertices, ${allFacesWithColor.length} faces`);
  
  // --- Auto-scale to fit [-50, 50] bounding box ---
  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  
  for (const [x, y, z] of allPositions) {
    minX = Math.min(minX, x); maxX = Math.max(maxX, x);
    minY = Math.min(minY, y); maxY = Math.max(maxY, y);
    minZ = Math.min(minZ, z); maxZ = Math.max(maxZ, z);
  }
  
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const cz = (minZ + maxZ) / 2;
  const maxExtent = Math.max(maxX - minX, maxY - minY, maxZ - minZ);
  const scale = 100 / maxExtent; // fit into [-50, 50]
  
  console.error(`Bounding box: [${minX.toFixed(2)}, ${minY.toFixed(2)}, ${minZ.toFixed(2)}] → [${maxX.toFixed(2)}, ${maxY.toFixed(2)}, ${maxZ.toFixed(2)}]`);
  console.error(`Center: (${cx.toFixed(2)}, ${cy.toFixed(2)}, ${cz.toFixed(2)}), Scale: ${scale.toFixed(4)}`);
  
  // Center and scale positions.
  // glTF is Y-up by spec, which matches our renderer (Y=up).
  // We also flip Z so the model faces +Z (toward camera).
  const scaledPositions = allPositions.map(([x, y, z]) => [
    +((x - cx) * scale).toFixed(3),
    +((y - cy) * scale).toFixed(3),
    +(-(z - cz) * scale).toFixed(3),  // flip Z → faces camera
  ]);
  
  // --- Group faces by similar color ---
  const chunks = groupFacesByColor(allFacesWithColor, 20);
  
  // Sort chunks: largest first (main body), smallest last (details)
  chunks.sort((a, b) => b.faces.length - a.faces.length);
  
  console.error(`\nColor chunks (threshold=20):`);
  for (const chunk of chunks) {
    console.error(`  rgb(${chunk.color.join(',')}) → ${chunk.faces.length} faces`);
  }
  
  return {
    positions: scaledPositions,
    chunks: chunks.map(c => ({
      color: c.color,
      faces: c.faces,
    })),
  };
}

// ─── CLI ─────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: node convert-glb.js <input.glb> [output.json]');
  console.error('');
  console.error('Converts a GLB model to the JSON format needed by the');
  console.error('MetaMask-style SVG renderer. Zero external dependencies.');
  process.exit(1);
}

const inputPath = args[0];
if (!fs.existsSync(inputPath)) {
  console.error(`File not found: ${inputPath}`);
  process.exit(1);
}

const result = convertGLB(inputPath);
const jsonOutput = JSON.stringify(result);

if (args[1]) {
  fs.writeFileSync(args[1], jsonOutput);
  console.error(`\nWritten to ${args[1]} (${(jsonOutput.length / 1024).toFixed(1)} KB)`);
} else {
  process.stdout.write(jsonOutput);
  console.error(`\nOutput: ${(jsonOutput.length / 1024).toFixed(1)} KB (use > file.json to save)`);
}
