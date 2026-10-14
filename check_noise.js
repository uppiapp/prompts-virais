const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'site', 'assets', 'styles-CMsMeHHC.css');
let css = fs.readFileSync(cssPath, 'utf8');

const idx = css.indexOf('noise-base.png');
if (idx !== -1) {
  console.log('Snippet:', css.slice(Math.max(0, idx - 100), idx + 100));
} else {
  console.log('Not found in CSS');
}
