const fs = require('fs');
const path = require('path');

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  // Look for /__l5e/assets-v1/... and /assets/... and /91f41...
  const regex = /((?:\/__l5e\/assets-v1\/[a-zA-Z0-9-]+\/[a-zA-Z0-9._-]+)|\/assets\/[a-zA-Z0-9._-]+|\/91f41bb0[a-zA-Z0-9._\/-]+)/g;
  let match;
  const missing = [];
  const found = [];
  while ((match = regex.exec(content)) !== null) {
    const assetPath = match[1];
    // Normalize path
    const cleanPath = assetPath.split('?')[0].split('#')[0];
    const diskPath = path.join(__dirname, 'site', cleanPath.replace(/\//g, path.sep));
    if (!fs.existsSync(diskPath)) {
      missing.push({ file: path.relative(__dirname, filePath), asset: cleanPath, diskPath });
    } else {
      found.push(cleanPath);
    }
  }
  return { missing, found };
}

const siteDir = path.join(__dirname, 'site');
function walk(dir) {
  let results = [];
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (/\.(html|js|css)$/.test(file)) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = walk(siteDir);
let allMissing = [];
const seen = new Set();
files.forEach(f => {
  const { missing } = checkFile(f);
  missing.forEach(m => {
    const key = `${m.asset}`;
    if (!seen.has(key)) {
      seen.add(key);
      allMissing.push(m);
    }
  });
});

console.log('Total files checked:', files.length);
console.log('Unique missing assets count:', allMissing.length);
allMissing.forEach((m, idx) => {
  console.log(`${idx + 1}. [${m.file}] -> ${m.asset}`);
});

