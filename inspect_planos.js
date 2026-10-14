const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'site', 'index.html'), 'utf8');
const pIdx = html.indexOf('id="planos"');
console.log(html.substring(pIdx + 2000, pIdx + 7000));
