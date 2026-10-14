const fs = require('fs');
const path = require('path');
const https = require('https');

const baseUrl = 'https://promptsviraisbr.lovable.app';
const routes = [
  '/',
  '/auth',
  '/criar-acesso',
  '/ativar',
  '/membros',
  '/extrair-prompt'
];

function fetchRoute(route) {
  return new Promise((resolve) => {
    https.get(baseUrl + route, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ route, status: res.statusCode, data });
      });
    }).on('error', (err) => resolve({ route, error: err.message }));
  });
}

async function main() {
  const routesDir = path.join(__dirname, 'routes_html');
  if (!fs.existsSync(routesDir)) fs.mkdirSync(routesDir, { recursive: true });

  for (const r of routes) {
    const res = await fetchRoute(r);
    console.log(`Route ${r}: status ${res.status}, length ${res.data?.length}`);
    const fname = (r === '/' ? 'index' : r.replace('/', '')) + '.html';
    if (res.data) {
      fs.writeFileSync(path.join(routesDir, fname), res.data);
    }
  }
}

main();
