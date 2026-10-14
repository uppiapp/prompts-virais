const fs = require('fs');
const path = require('path');

const files = [
  'site/auth/index.html',
  'site/ativar/index.html',
  'site/membros/index.html',
  'site/extrair-prompt/index.html',
  'site/criar-acesso/index.html'
];

for (const file of files) {
  const full = path.join(__dirname, file);
  if (fs.existsSync(full)) {
    const html = fs.readFileSync(full, 'utf8');
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/);
    const bodyContent = bodyMatch ? bodyMatch[1] : '';
    // Strip scripts
    const textContent = bodyContent.replace(/<script[\s\S]*?<\/script>/gi, '').trim();
    console.log(`=== ${file} ===`);
    console.log('Total length:', html.length);
    console.log('Non-script body HTML length:', textContent.length);
    console.log('Preview:', textContent.substring(0, 200));
  } else {
    console.log(`=== ${file} DOES NOT EXIST ===`);
  }
}
