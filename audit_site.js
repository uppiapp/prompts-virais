const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'site', 'index.html'), 'utf8');

const regex = /(?:src|href|poster|data-src)=["']([^"']+)["']/g;
let match;
const missing = new Set();
const found = new Set();
const external = new Set();

while ((match = regex.exec(html)) !== null) {
  let url = match[1];
  if (url.startsWith('#') || url.startsWith('mailto:') || url.startsWith('tel:')) {
    continue;
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    external.add(url);
  } else if (url.startsWith('/')) {
    let cleanUrl = url.split('?')[0].split('#')[0];
    const localPath = path.join(__dirname, 'site', cleanUrl.replace(/\//g, path.sep));
    const localHtml = localPath + '.html';
    const localIndex = path.join(localPath, 'index.html');
    if (fs.existsSync(localPath) || fs.existsSync(localHtml) || fs.existsSync(localIndex)) {
      found.add(url);
    } else {
      missing.add(url);
    }
  }
}

console.log('--- AUDIT OF site/index.html ---');
console.log('Found local assets/routes:', found.size);
console.log('Missing local assets:', Array.from(missing));
console.log('\nExternal URLs count:', external.size);
console.log('External URLs:', Array.from(external));

// Check CSS url() references
const css = fs.readFileSync(path.join(__dirname, 'site', 'assets', 'styles-CMsMeHHC.css'), 'utf8');
const cssUrlRegex = /url\(['"]?([^'"\)]+)['"]?\)/g;
const missingCss = new Set();
const foundCss = new Set();
const extCss = new Set();

while ((match = cssUrlRegex.exec(css)) !== null) {
  let url = match[1];
  if (url.startsWith('data:')) continue;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    extCss.add(url);
  } else if (url.startsWith('/')) {
    const localPath = path.join(__dirname, 'site', url.replace(/\//g, path.sep));
    if (fs.existsSync(localPath)) {
      foundCss.add(url);
    } else {
      missingCss.add(url);
    }
  } else {
    // Relative to assets/styles-CMsMeHHC.css
    const localPath = path.resolve(__dirname, 'site', 'assets', url.replace(/\//g, path.sep));
    if (fs.existsSync(localPath)) {
      foundCss.add(url);
    } else {
      missingCss.add(url);
    }
  }
}

console.log('\n--- AUDIT OF styles-CMsMeHHC.css ---');
console.log('Found CSS assets:', foundCss.size);
console.log('Missing CSS assets:', Array.from(missingCss));
console.log('External CSS URLs:', Array.from(extCss));
