const https = require('https');
const fs = require('fs');

const assets = JSON.parse(fs.readFileSync('all_discovered_assets.json', 'utf8'));
const baseUrl = 'https://promptsviraisbr.lovable.app';

function checkSize(urlPath) {
  return new Promise((resolve) => {
    const fullUrl = urlPath.startsWith('http') ? urlPath : baseUrl + urlPath;
    const req = https.request(fullUrl, { method: 'HEAD' }, (res) => {
      resolve({
        url: urlPath,
        status: res.statusCode,
        size: parseInt(res.headers['content-length'] || '0', 10),
        type: res.headers['content-type']
      });
    });
    req.on('error', (e) => resolve({ url: urlPath, error: e.message }));
    req.end();
  });
}

async function main() {
  console.log('Checking video sizes...');
  let totalVideoSize = 0;
  for (const v of assets.videos) {
    const info = await checkSize(v);
    totalVideoSize += info.size || 0;
    console.log(`${info.status} - ${(info.size / 1024 / 1024).toFixed(2)} MB - ${v}`);
  }
  console.log(`Total video size: ${(totalVideoSize / 1024 / 1024).toFixed(2)} MB`);

  console.log('\nChecking image sizes...');
  let totalImgSize = 0;
  for (const img of assets.images) {
    const info = await checkSize(img);
    totalImgSize += info.size || 0;
    console.log(`${info.status} - ${(info.size / 1024).toFixed(1)} KB - ${img}`);
  }
  console.log(`Total image size: ${(totalImgSize / 1024 / 1024).toFixed(2)} MB`);
}

main();
