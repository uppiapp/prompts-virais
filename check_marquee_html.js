const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'site', 'index.html'), 'utf8');

const marqueeMatches = [...html.matchAll(/class="[^"]*marquee[^"]*"/gi)].map(m => m[0]);
console.log('Marquee elements in index.html:', marqueeMatches);
