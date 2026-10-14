const fs = require('fs');
const path = require('path');
const https = require('https');

const baseUrl = 'https://promptsviraisbr.lovable.app';
const siteDir = path.join(__dirname, 'site');

// Read all discovered assets
const discovered = JSON.parse(fs.readFileSync(path.join(__dirname, 'all_discovered_assets.json'), 'utf8'));
const routeBundles = JSON.parse(fs.readFileSync(path.join(__dirname, 'route_bundles.json'), 'utf8'));

const allUrls = new Set([
  ...discovered.all,
  ...routeBundles,
  '/favicon.png',
  '/app-icon-180.png',
  '/manifest.webmanifest'
]);

function downloadFile(urlPath) {
  return new Promise((resolve) => {
    let fullUrl = urlPath;
    let localPath = urlPath;

    if (urlPath.startsWith('http://') || urlPath.startsWith('https://')) {
      const u = new URL(urlPath);
      localPath = u.pathname;
    } else {
      fullUrl = baseUrl + urlPath;
    }

    // Sanitize local path
    const dest = path.join(siteDir, localPath.replace(/^\//, ''));
    const dir = path.dirname(dest);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    if (fs.existsSync(dest) && fs.statSync(dest).size > 0) {
      console.log(`[SKIP - Already exists] ${urlPath}`);
      return resolve({ urlPath, success: true, cached: true });
    }

    console.log(`[DOWNLOADING] ${fullUrl} -> ${dest}`);
    const req = https.get(fullUrl, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let redirectUrl = res.headers.location;
        if (!redirectUrl.startsWith('http')) {
          redirectUrl = baseUrl + redirectUrl;
        }
        https.get(redirectUrl, (rRes) => {
          if (rRes.statusCode !== 200) {
            console.error(`[FAIL redirect ${rRes.statusCode}] ${urlPath}`);
            return resolve({ urlPath, success: false, status: rRes.statusCode });
          }
          const fileStream = fs.createWriteStream(dest);
          rRes.pipe(fileStream);
          fileStream.on('finish', () => {
            fileStream.close();
            console.log(`[DONE redirect] ${urlPath} (${fs.statSync(dest).size} bytes)`);
            resolve({ urlPath, success: true });
          });
        }).on('error', (e) => {
          console.error(`[ERROR redirect] ${urlPath}: ${e.message}`);
          resolve({ urlPath, success: false, error: e.message });
        });
        return;
      }

      if (res.statusCode !== 200) {
        console.error(`[FAIL ${res.statusCode}] ${urlPath}`);
        return resolve({ urlPath, success: false, status: res.statusCode });
      }

      const fileStream = fs.createWriteStream(dest);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`[DONE] ${urlPath} (${fs.statSync(dest).size} bytes)`);
        resolve({ urlPath, success: true });
      });
    });

    req.on('error', (e) => {
      console.error(`[ERROR] ${urlPath}: ${e.message}`);
      resolve({ urlPath, success: false, error: e.message });
    });
  });
}

async function runQueue(urls, concurrency = 4) {
  const queue = [...urls];
  const results = [];

  async function worker() {
    while (queue.length > 0) {
      const url = queue.shift();
      const res = await downloadFile(url);
      results.push(res);
    }
  }

  const workers = [];
  for (let i = 0; i < concurrency; i++) {
    workers.push(worker());
  }

  await Promise.all(workers);
  return results;
}

async function main() {
  const list = Array.from(allUrls).filter(u => !u.endsWith('.asset.js')); // filter out hypothetical .asset.js if not real
  console.log(`Starting download of ${list.length} assets with concurrency 4...`);
  const results = await runQueue(list, 4);

  const failed = results.filter(r => !r.success);
  console.log(`\nDownload finished! Total: ${results.length}, Success: ${results.length - failed.length}, Failed: ${failed.length}`);
  if (failed.length > 0) {
    console.log('Failed assets:', failed);
  }
}

main();
