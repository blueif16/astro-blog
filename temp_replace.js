const fs = require('fs');

const html = fs.readFileSync('hedgehog-landing.html', 'utf8');
const hedgehogData = fs.readFileSync('files-2/hedgehog.json', 'utf8');

// Find and replace the MODEL_DATA line
const updated = html.replace(
  /const MODEL_DATA = generateDemoModel\(\);/,
  `const MODEL_DATA = ${hedgehogData};`
);

// Remove the generateDemoModel function (lines 78-192)
const final = updated.replace(
  /\/\/ ═+\n\/\/ PROCEDURAL DEMO MODEL[\s\S]*?return \{\s*positions,\s*chunks: Array\.from\(chunkMap\.values\(\)\),\s*\};\s*\}\s*\n/,
  ''
);

fs.writeFileSync('hedgehog-landing.html', final);
console.log('Updated hedgehog-landing.html with real model data');
