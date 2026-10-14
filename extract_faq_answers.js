const fs = require('fs');
const path = require('path');

const js = fs.readFileSync(path.join(__dirname, 'site', 'assets', 'index-BLyICGUZ.js'), 'utf8');

// Search for FAQ questions in the JS file
const q1 = "Preciso aparecer nos vídeos?";
const q2 = "Preciso ter seguidores pra começar?";
const q3 = "Preciso investir em tráfego pago?";
const q4 = "Nunca vendi nada online. Consigo aplicar?";
const q5 = "Os prompts são atualizados?";
const q6 = "Em quanto tempo vejo resultado?";
const q7 = "Como recebo o acesso?";

[q1, q2, q3, q4, q5, q6, q7].forEach(q => {
  const idx = js.indexOf(q);
  if (idx !== -1) {
    console.log(`=== FAQ: ${q} ===`);
    console.log(js.slice(idx, idx + 400));
  } else {
    console.log(`NOT FOUND: ${q}`);
  }
});
