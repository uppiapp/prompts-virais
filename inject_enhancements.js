const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'site', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// Inject css into <head>
if (!html.includes('/enhancements.css')) {
  html = html.replace('</head>', '<link rel="stylesheet" href="/enhancements.css"/></head>');
}

// Inject js before </body>
if (!html.includes('/enhancements.js')) {
  html = html.replace('</body>', '<script src="/enhancements.js"></script></body>');
}

fs.writeFileSync(indexPath, html);
console.log('Injected enhancements into site/index.html');
