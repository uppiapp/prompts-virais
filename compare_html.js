const fs = require('fs');
const orig = fs.readFileSync('original.html', 'utf8');
const curr = fs.readFileSync('site/index.html', 'utf8');

console.log('Original length:', orig.length);
console.log('Current length:', curr.length);

// Let's find sections or differences
const findIds = (html) => {
  const ids = [];
  const regex = /id=["']([^"']+)["']/g;
  let m;
  while ((m = regex.exec(html)) !== null) ids.push(m[1]);
  return ids;
};

console.log('Original IDs:', findIds(orig));
console.log('Current IDs:', findIds(curr));
