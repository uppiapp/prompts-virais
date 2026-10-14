const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'site', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// 1. Add id="demo" to the vitrine section
if (!html.includes('id="demo"')) {
  html = html.replace(
    '<section class="max-w-7xl mx-auto px-5 py-24">',
    '<section id="demo" class="max-w-7xl mx-auto px-5 py-24">'
  );
  console.log('Added id="demo"');
}

// 2. Add id="capacidades" to the biblioteca section
if (!html.includes('id="capacidades"')) {
  html = html.replace(
    '<section class="relative py-24 sm:py-32 bg-[var(--ink-2)] border-y border-white/5 overflow-hidden">',
    '<section id="capacidades" class="relative py-24 sm:py-32 bg-[var(--ink-2)] border-y border-white/5 overflow-hidden">'
  );
  console.log('Added id="capacidades"');
}

// 3. Add id="faq" to the FAQ section
if (!html.includes('id="faq"')) {
  html = html.replace(
    '<section class="light-band relative border-b border-white/5 bg-[var(--ink-2)]">',
    '<section id="faq" class="light-band relative border-b border-white/5 bg-[var(--ink-2)]">'
  );
  console.log('Added id="faq"');
}

// 4. Ensure VSL container has relative
html = html.replace(
  'class="mt-8 mx-auto max-w-3xl rounded-2xl overflow-hidden shadow-[0_20px_80px_-20px_rgba(31,109,255,0.5)] aspect-video bg-black"',
  'class="relative mt-8 mx-auto max-w-3xl rounded-2xl overflow-hidden shadow-[0_20px_80px_-20px_rgba(31,109,255,0.5)] aspect-video bg-black"'
);

// 5. Replace external R2 preview image with local cached asset
html = html.replaceAll(
  'https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/91f41bb0-7d74-4396-9234-8ef7cc5000b0/id-preview-e8b51571--4cc687db-5ec2-472f-8bd2-9235598d8194.lovable.app-1780190619524.png',
  '/91f41bb0-7d74-4396-9234-8ef7cc5000b0/id-preview-e8b51571--4cc687db-5ec2-472f-8bd2-9235598d8194.lovable.app-1780190619524.png'
);

// 6. Insert all FAQ answers
const faqAnswers = [
  {
    q: "Preciso ter seguidores pra começar?",
    a: "Não. O TikTok Shop não depende de seguidor, depende de vídeo certo. Você pode ter zero seguidores hoje e fazer a primeira venda essa semana."
  },
  {
    q: "Preciso investir em tráfego pago?",
    a: "Não. É 100% orgânico. O próprio algoritmo entrega o vídeo pra quem está pronto pra comprar."
  },
  {
    q: "Nunca vendi nada online. Consigo aplicar?",
    a: "Sim. É copiar, colar e preencher. Os prompts já vêm com a estrutura pronta de gancho, sustentação e CTA."
  },
  {
    q: "Os prompts são atualizados?",
    a: "Sim. Todo dia entra prompt novo na área de membros. O que satura sai, o que está performando entra — você nunca fica com material queimado."
  },
  {
    q: "Em quanto tempo vejo resultado?",
    a: "Quem posta com consistência costuma relatar as primeiras vendas em poucos dias. O resultado escala com execução, não com tempo de curso."
  },
  {
    q: "Como recebo o acesso?",
    a: "Assim que o pagamento é confirmado, o login da área de membros cai no seu e-mail e no WhatsApp. Acesso imediato."
  }
];

for (const item of faqAnswers) {
  const targetPattern = `<span class="text-[15px] sm:text-[17px] font-bold text-white">${item.q}</span><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down w-5 h-5 shrink-0 text-[#4f6bf5] transition-transform duration-300" aria-hidden="true" style="transform:none"><path d="m6 9 6 6 6-6"></path></svg></button></div>`;
  const replacement = `<span class="text-[15px] sm:text-[17px] font-bold text-white">${item.q}</span><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down w-5 h-5 shrink-0 text-[#4f6bf5] transition-transform duration-300" aria-hidden="true" style="transform:none"><path d="m6 9 6 6 6-6"></path></svg></button><div class="px-5 sm:px-6 pb-5 -mt-1 text-[15px] text-white/70 leading-relaxed" style="display:none">${item.a}</div></div>`;
  
  if (html.includes(targetPattern)) {
    html = html.replace(targetPattern, replacement);
    console.log(`Injected answer for: "${item.q}"`);
  } else {
    console.log(`Could not find exact button pattern for: "${item.q}"`);
  }
}

fs.writeFileSync(indexPath, html, 'utf8');
console.log('Successfully patched site/index.html');
