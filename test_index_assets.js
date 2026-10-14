const http = require('http');
const fs = require('fs');

const html = fs.readFileSync('site/index.html', 'utf8');

// Extract all src and href from site/index.html
const regex = /(?:src|href)=["']([^"']+)["']/g;
let m;
const urls = new Set();
while ((m = regex.exec(html)) !== null) {
  const u = m[1];
  if (u.startsWith('/') && !u.startsWith('//')) {
    urls.add(u);
  }
}

console.log(`Testing ${urls.size} local assets referenced by index.html...`);

function checkUrl(url) {
  return new Promise((resolve) => {
    http.get(`http://localhost:3030${url}`, (res) => {
      resolve({ url, status: res.statusCode });
    }).on('error', (err) => {
      resolve({ url, status: 'ERROR: ' + err.message });
    });
  });
}

(async () => {
  let failed = 0;
  for (const u of urls) {
    const res = await checkUrl(u);
    if (res.status !== 200 && res.status !== 206) {
      console.log(`[FAIL] ${res.url} -> Status ${res.status}`);
      failed++;
    }
  }
  if (failed === 0) {
    console.log(`[SUCCESS] All ${urls.size} index.html assets returned 200/206!`);
  } else {
    console.log(`[WARNING] ${failed} assets failed!`);
  }
})();
