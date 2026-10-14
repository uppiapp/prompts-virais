const http = require('http');
const fs = require('fs');
const path = require('path');

const siteDir = path.join(__dirname, 'site');

function getHtmlFiles(dir) {
  let files = [];
  fs.readdirSync(dir).forEach(f => {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) files = files.concat(getHtmlFiles(full));
    else if (f.endsWith('.html')) files.push(full);
  });
  return files;
}

const htmlFiles = getHtmlFiles(siteDir);
const urls = new Set();
const regex = /(?:src|href|poster|data-src)=["']([^"']+)["']/g;

htmlFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  let m;
  while ((m = regex.exec(content)) !== null) {
    const u = m[1];
    if (u.startsWith('/') && !u.startsWith('//') && !u.includes('${')) {
      urls.add(u);
    }
  }
});

console.log(`Checking ${urls.size} unique URLs across all HTML pages against http://localhost:3030...`);

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
    console.log(`[SUCCESS] All ${urls.size} URLs returned 200/206!`);
  } else {
    console.log(`[FAILED] ${failed} URLs failed!`);
  }
})();
