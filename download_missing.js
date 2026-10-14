const fs = require('fs');
const path = require('path');
const https = require('https');

const assetsToDownload = [
  {
    src: 'https://promptsviraisbr.lovable.app/__l5e/assets-v1/db6e7d88-4769-424b-868b-d38df9b3197f/rv-logo-glass.png',
    dest: 'site/__l5e/assets-v1/db6e7d88-4769-424b-868b-d38df9b3197f/rv-logo-glass.png'
  },
  {
    src: 'https://promptsviraisbr.lovable.app/__l5e/assets-v1/f2d74083-eb53-4418-a00c-b1473d5ba21a/capa-vip.png',
    dest: 'site/__l5e/assets-v1/f2d74083-eb53-4418-a00c-b1473d5ba21a/capa-vip.png'
  },
  {
    src: 'https://promptsviraisbr.lovable.app/__l5e/assets-v1/9659af86-a3ab-47f0-8b1e-b51458e47b6b/capa-estilos-prompts.png',
    dest: 'site/__l5e/assets-v1/9659af86-a3ab-47f0-8b1e-b51458e47b6b/capa-estilos-prompts.png'
  },
  {
    src: 'https://promptsviraisbr.lovable.app/__l5e/assets-v1/228e5a13-c442-4eb9-9efc-8967f0916d21/capa-prompts-vendem.png',
    dest: 'site/__l5e/assets-v1/228e5a13-c442-4eb9-9efc-8967f0916d21/capa-prompts-vendem.png'
  },
  {
    src: 'https://promptsviraisbr.lovable.app/__l5e/assets-v1/2c6e0ef2-a05c-437f-9943-91044d256bc0/capa-prompts-virais-duo.png',
    dest: 'site/__l5e/assets-v1/2c6e0ef2-a05c-437f-9943-91044d256bc0/capa-prompts-virais-duo.png'
  },
  {
    src: 'https://promptsviraisbr.lovable.app/__l5e/assets-v1/e969fe4c-d549-4d55-a077-97a317d72f2b/kael-santyns.jpg',
    dest: 'site/__l5e/assets-v1/e969fe4c-d549-4d55-a077-97a317d72f2b/kael-santyns.jpg'
  },
  {
    src: 'https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/91f41bb0-7d74-4396-9234-8ef7cc5000b0/id-preview-e8b51571--4cc687db-5ec2-472f-8bd2-9235598d8194.lovable.app-1780190619524.png',
    dest: 'site/91f41bb0-7d74-4396-9234-8ef7cc5000b0/id-preview-e8b51571--4cc687db-5ec2-472f-8bd2-9235598d8194.lovable.app-1780190619524.png'
  }
];

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const fullDest = path.join(__dirname, dest);
    fs.mkdirSync(path.dirname(fullDest), { recursive: true });

    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        console.error(`Failed ${url}: ${res.statusCode}`);
        return resolve(false);
      }
      const stream = fs.createWriteStream(fullDest);
      res.pipe(stream);
      stream.on('finish', () => {
        stream.close();
        console.log(`Saved: ${dest} (${fs.statSync(fullDest).size} bytes)`);
        resolve(true);
      });
      stream.on('error', (err) => {
        console.error(`Error saving ${dest}:`, err);
        resolve(false);
      });
    }).on('error', (err) => {
      console.error(`Network error ${url}:`, err);
      resolve(false);
    });
  });
}

async function main() {
  console.log('Starting download of missing assets...');
  for (const item of assetsToDownload) {
    await downloadFile(item.src, item.dest);
  }
  console.log('Finished downloading missing assets.');
}

main();
