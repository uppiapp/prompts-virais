const fs = require('fs');
const orig = fs.readFileSync('original.html', 'utf8');
const regex = /<a\s+[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gis;
let m;
const links = [];
while ((m = regex.exec(orig)) !== null) {
  links.push({ href: m[1], text: m[2].replace(/<[^>]+>/g, '').trim() });
}
console.log('Original Links:', JSON.stringify(links, null, 2));
