const fs = require('fs');
const path = require('path');

const files = fs.readdirSync(path.join(__dirname, 'routes_html'));
const preloads = new Set();

for (const f of files) {
  const content = fs.readFileSync(path.join(__dirname, 'routes_html', f), 'utf8');
  const matches = content.matchAll(/\/assets\/[a-zA-Z0-9_\-\.]+\.(js|css)/g);
  for (const m of matches) {
    preloads.add(m[0]);
  }
}

console.log('All route assets:', Array.from(preloads));
fs.writeFileSync(path.join(__dirname, 'route_bundles.json'), JSON.stringify(Array.from(preloads), null, 2));
