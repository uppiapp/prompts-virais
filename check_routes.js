const fs = require('fs');
const path = require('path');

const js1 = fs.readFileSync(path.join(__dirname, 'downloaded_assets', 'index-BpEXh5S0.js'), 'utf8');
const js2 = fs.readFileSync(path.join(__dirname, 'downloaded_assets', 'index-BLyICGUZ.js'), 'utf8');

const routeMatches = [...(js1 + js2).matchAll(/path\s*:\s*["']([^"']+)["']/g)].map(m => m[1]);
console.log('Routes found:', Array.from(new Set(routeMatches)));

// Search for links or hrefs
const hrefMatches = [...(js1 + js2).matchAll(/href\s*:\s*["']([^"']+)["']/g)].map(m => m[1]);
console.log('Hrefs found:', Array.from(new Set(hrefMatches)).filter(h => h.startsWith('/') || h.includes('sharkcash') || h.includes('lovable')));
