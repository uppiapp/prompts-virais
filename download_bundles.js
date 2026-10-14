const fs = require('fs');
const path = require('path');
const https = require('https');

const baseUrl = 'https://promptsviraisbr.lovable.app';

function downloadFile(urlPath) {
  return new Promise((resolve, reject) => {
    const fullUrl = urlPath.startsWith('http') ? urlPath : baseUrl + urlPath;
    console.log('Downloading:', fullUrl);
    https.get(fullUrl, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(downloadFile(res.headers.location));
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to download ${fullUrl}, status: ${res.statusCode}`));
      }
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

async function run() {
  const assetsDir = path.join(__dirname, 'downloaded_assets');
  if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

  // Download CSS
  try {
    const css = await downloadFile('/assets/styles-CMsMeHHC.css');
    fs.writeFileSync(path.join(assetsDir, 'styles-CMsMeHHC.css'), css);
    console.log('Saved styles-CMsMeHHC.css, size:', css.length);
  } catch (e) {
    console.error('CSS error:', e.message);
  }

  // Download main JS bundles
  const jsBundles = [
    '/assets/index-BpEXh5S0.js',
    '/assets/index-BLyICGUZ.js',
    '/assets/x-vWCyyCJH.js',
    '/assets/InstallAppButton-esPNcr0p.js',
    '/assets/rv-logo-3d.png.asset-B-OImVaM.js',
    '/assets/arrow-right-Qk1TJn57.js',
    '/assets/sparkles-XB95iyUY.js',
    '/assets/zap-CFsWQ_Zz.js',
    '/favicon.png',
    '/app-icon-180.png',
    '/manifest.webmanifest'
  ];

  for (const bundle of jsBundles) {
    try {
      const data = await downloadFile(bundle);
      const filename = path.basename(bundle);
      fs.writeFileSync(path.join(assetsDir, filename), data);
      console.log(`Saved ${filename}, size: ${data.length}`);
    } catch (e) {
      console.error(`Error downloading ${bundle}:`, e.message);
    }
  }

  console.log('Finished initial bundle download');
}

run();
