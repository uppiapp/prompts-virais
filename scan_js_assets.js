const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, 'site', 'assets');
const jsFiles = fs.readdirSync(assetsDir).filter(f => f.endsWith('.js'));

const assetRegex = /["'](\/__l5e\/assets-v1\/[^"']+)["']|["'](\/assets\/[^"']+\.(?:png|jpg|jpeg|webp|svg|mp4|webm))["']/g;
const allReferenced = new Set();
const missing = new Set();
const found = new Set();

for (const file of jsFiles) {
  const content = fs.readFileSync(path.join(assetsDir, file), 'utf8');
  let match;
  while ((match = assetRegex.exec(content)) !== null) {
    const url = match[1] || match[2];
    allReferenced.add(url);
    const localPath = path.join(__dirname, 'site', url.replace(/\//g, path.sep));
    if (fs.existsSync(localPath)) {
      found.add(url);
    } else {
      missing.add(url);
    }
  }
}

console.log('Total referenced assets across all JS bundles:', allReferenced.size);
console.log('Found on disk:', found.size);
console.log('Missing on disk:', Array.from(missing));
