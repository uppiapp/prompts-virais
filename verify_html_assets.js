const fs = require('fs');
const path = require('path');

const siteDir = path.join(__dirname, 'site');

function getHtmlFiles(dir) {
  let files = [];
  fs.readdirSync(dir).forEach(f => {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      files = files.concat(getHtmlFiles(full));
    } else if (f.endsWith('.html')) {
      files.push(full);
    }
  });
  return files;
}

const htmlFiles = getHtmlFiles(siteDir);
console.log('Found HTML files:', htmlFiles.map(f => path.relative(siteDir, f)));

const srcAttrRegex = /(?:src|href|poster|data-src)=["']([^"']+)["']/g;

let totalChecked = 0;
let errors = [];

htmlFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = srcAttrRegex.exec(content)) !== null) {
    const url = match[1];
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('#') || url.startsWith('mailto:') || url.startsWith('tel:')) {
      continue;
    }
    totalChecked++;
    const cleanUrl = url.split('?')[0].split('#')[0];
    if (!cleanUrl) continue;
    
    // Check local disk path
    let localDisk = path.join(siteDir, cleanUrl.replace(/\//g, path.sep));
    
    // If it's a route like /auth, /membros, etc., check if /auth/index.html or auth.html exists
    let exists = fs.existsSync(localDisk);
    if (!exists) {
      if (fs.existsSync(localDisk + '.html')) exists = true;
      if (fs.existsSync(path.join(localDisk, 'index.html'))) exists = true;
    }

    if (!exists) {
      errors.push({
        htmlFile: path.relative(siteDir, file),
        url: url,
        expectedDiskPath: localDisk
      });
    }
  }
});

console.log(`Total URLs checked across all HTML files: ${totalChecked}`);
console.log(`Errors found: ${errors.length}`);
if (errors.length > 0) {
  console.log('Errors:', JSON.stringify(errors, null, 2));
} else {
  console.log('ALL HTML references resolve to real files on disk!');
}
