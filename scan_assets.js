const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'downloaded_assets');
const files = fs.readdirSync(dir);
const allAssets = new Set();
const allVideos = new Set();
const allImages = new Set();

const html = fs.readFileSync(path.join(__dirname, 'original.html'), 'utf8');

function findMatches(content) {
  // Find /__l5e/assets-v1/...
  const l5eMatches = content.matchAll(/\/__l5e\/assets-v1\/[a-zA-Z0-9_\-\.\/]+/g);
  for (const m of l5eMatches) {
    allAssets.add(m[0]);
    if (m[0].match(/\.(mp4|webm|mov|m3u8)$/i)) allVideos.add(m[0]);
    if (m[0].match(/\.(png|jpe?g|webp|gif|svg)$/i)) allImages.add(m[0]);
  }
  // Find /assets/...
  const assetMatches = content.matchAll(/\/assets\/[a-zA-Z0-9_\-\.]+\.(js|css|png|jpg|jpeg|webp|svg|woff2?|ttf|mp4|webm)/g);
  for (const m of assetMatches) {
    allAssets.add(m[0]);
  }
  // Find external assets or cdn urls
  const externalMatches = content.matchAll(/https?:\/\/[a-zA-Z0-9_\-\.\/]+\.(mp4|webm|png|jpg|jpeg|webp|svg)/g);
  for (const m of externalMatches) {
    allAssets.add(m[0]);
    if (m[0].match(/\.(mp4|webm)$/i)) allVideos.add(m[0]);
    if (m[0].match(/\.(png|jpe?g|webp|svg)$/i)) allImages.add(m[0]);
  }
}

findMatches(html);

for (const f of files) {
  if (f.endsWith('.js') || f.endsWith('.css')) {
    const c = fs.readFileSync(path.join(dir, f), 'utf8');
    findMatches(c);
  }
}

console.log('Total Assets Found:', allAssets.size);
console.log('Videos (' + allVideos.size + '):', Array.from(allVideos));
console.log('Images (' + allImages.size + '):', Array.from(allImages));

fs.writeFileSync(path.join(__dirname, 'all_discovered_assets.json'), JSON.stringify({
  all: Array.from(allAssets),
  videos: Array.from(allVideos),
  images: Array.from(allImages)
}, null, 2));
