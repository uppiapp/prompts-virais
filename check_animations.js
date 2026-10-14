const fs = require('fs');
const path = require('path');

const css = fs.readFileSync(path.join(__dirname, 'site', 'assets', 'styles-CMsMeHHC.css'), 'utf8');

const marqueeMatches = css.match(/marquee[a-zA-Z0-9_\-]*/g);
console.log('Marquee classes in CSS:', Array.from(new Set(marqueeMatches || [])));

const keyframeMatches = css.match(/@keyframes\s+([a-zA-Z0-9_\-]+)/g);
console.log('Keyframes in CSS:', Array.from(new Set(keyframeMatches || [])));
