const fs = require('fs');
const path = require('path');

const siteDir = path.join(__dirname, 'site');
const routesDir = path.join(__dirname, 'routes_html');

// Create dummy ~flock.js to avoid 404
fs.writeFileSync(path.join(siteDir, '~flock.js'), '// flock analytics dummy\nwindow.__flock = { push: function(){} };\n');

// Clean noise reference in CSS to avoid 403
const cssPath = path.join(siteDir, 'assets', 'styles-CMsMeHHC.css');
if (fs.existsSync(cssPath)) {
  let css = fs.readFileSync(cssPath, 'utf8');
  // replace the external codepen noise with a lightweight data uri svg or none
  css = css.replace(/https:\/\/assets\.codepen\.io\/13471\/noise-base\.png/g, "data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E");
  fs.writeFileSync(cssPath, css);
  console.log('Cleaned noise-base.png in styles-CMsMeHHC.css');
}

// Copy routes
const pages = [
  { file: 'index.html', route: 'index.html', folder: '' },
  { file: 'auth.html', route: 'auth.html', folder: 'auth' },
  { file: 'criar-acesso.html', route: 'criar-acesso.html', folder: 'criar-acesso' },
  { file: 'ativar.html', route: 'ativar.html', folder: 'ativar' },
  { file: 'membros.html', route: 'membros.html', folder: 'membros' },
  { file: 'extrair-prompt.html', route: 'extrair-prompt.html', folder: 'extrair-prompt' },
];

for (const p of pages) {
  const src = path.join(routesDir, p.file);
  if (!fs.existsSync(src)) continue;
  let content = fs.readFileSync(src, 'utf8');

  // Write root .html file
  fs.writeFileSync(path.join(siteDir, p.route), content);

  // If subfolder, write folder/index.html
  if (p.folder) {
    const fDir = path.join(siteDir, p.folder);
    if (!fs.existsSync(fDir)) fs.mkdirSync(fDir, { recursive: true });
    fs.writeFileSync(path.join(fDir, 'index.html'), content);
  }
}

console.log('Setup site structure complete!');
