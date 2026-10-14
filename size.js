const fs = require('fs');
const path = require('path');

function getDirSize(dir) {
  let size = 0;
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      size += getDirSize(full);
    } else {
      size += stat.size;
    }
  }
  return size;
}

const total = getDirSize(path.join(__dirname, 'site'));
console.log('Total site folder size:', (total / 1024 / 1024).toFixed(2), 'MB');
