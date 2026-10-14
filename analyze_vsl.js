const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'routes_html', 'index.html'), 'utf8');
const vslIdx = html.indexOf('prompts-virais-vsl-compatible.mp4');
console.log('VSL container:', html.slice(vslIdx - 500, vslIdx + 1500));
