const fs = require('fs');
const path = require('path');

const siteDir = path.join(__dirname, 'site');
function walk(dir) {
  let res = [];
  fs.readdirSync(dir).forEach(f => {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) res = res.concat(walk(full));
    else if (f.endsWith('.html')) res.push(full);
  });
  return res;
}

walk(siteDir).forEach(file => {
  const text = fs.readFileSync(file, 'utf8');
  const count = (text.match(/\uFFFD/g) || []).length;
  if (count > 0) {
    console.log(`Corrupted \\uFFFD in ${path.relative(__dirname, file)}: ${count} occurrences`);
    let idx = 0;
    while ((idx = text.indexOf('\uFFFD', idx)) !== -1) {
      console.log('  Context:', text.substring(Math.max(0, idx - 30), Math.min(text.length, idx + 30)));
      idx += 1;
    }
  }
});

