const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const siteDir = path.join(__dirname, 'site');

// Find all text files in siteDir
function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(fullPath));
    } else {
      if (/\.(html|js|css|json|webmanifest)$/.test(file)) {
        results.push(fullPath);
      }
    }
  });
  return results;
}

const files = getFiles(siteDir);
const assetPatterns = [
  /\/__l5e\/assets-v1\/[a-zA-Z0-9\-_./]+/g,
  /\/assets\/[a-zA-Z0-9\-_.]+\.(?:png|jpg|jpeg|webp|svg|gif|mp4|webm|mov|woff2?|ttf|css|js)/g,
  /https:\/\/pub-[a-zA-Z0-9]+\.r2\.dev\/[a-zA-Z0-9\-_./]+/g
];

const allUrls = new Set();

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  for (const pattern of assetPatterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      allUrls.add(match[0]);
    }
  }
}

console.log('Total unique asset URLs discovered:', allUrls.size);

const missingUrls = [];
for (const url of allUrls) {
  if (url.startsWith('https://')) {
    missingUrls.push({ url, type: 'r2' });
  } else {
    const local = path.join(siteDir, url.replace(/\//g, path.sep));
    if (!fs.existsSync(local)) {
      missingUrls.push({ url, type: 'local', fullLocal: local });
    }
  }
}

console.log('Missing/Uncached count:', missingUrls.length);
console.log(JSON.stringify(missingUrls, null, 2));
