const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'site', 'index.html'), 'utf8');

const faqQuestions = [
  { q: "Preciso aparecer nos vídeos?", a: "Não. Boa parte dos prompts foi feita justamente para perfil dark — sem mostrar rosto. Os dois caminhos vendem." },
  { q: "Preciso ter seguidores pra começar?", a: "Não. O TikTok Shop não depende de seguidor, depende de vídeo certo. Você pode ter zero seguidores hoje e fazer a primeira venda essa semana." },
  { q: "Preciso investir em tráfego pago?", a: "Não. É 100% orgânico. O próprio algoritmo entrega o vídeo pra quem está pronto pra comprar." },
  { q: "Nunca vendi nada online. Consigo aplicar?", a: "Sim. É copiar, colar e preencher. Os prompts já vêm com a estrutura pronta de gancho, sustentação e CTA." },
  { q: "Os prompts são atualizados?", a: "Sim. Todo dia entra prompt novo na área de membros. O que satura sai, o que está performando entra — você nunca fica com material queimado." },
  { q: "Em quanto tempo vejo resultado?", a: "Quem posta com consistência costuma relatar as primeiras vendas em poucos dias. O resultado escala com execução, não com tempo de curso." },
  { q: "Como recebo o acesso?", a: "Assim que o pagamento é confirmado, o login da área de membros cai no seu e-mail e no WhatsApp. Acesso imediato." }
];

console.log('Checking FAQ answers in index.html...');
faqQuestions.forEach(item => {
  const hasQ = html.includes(item.q);
  const hasA = html.includes(item.a);
  console.log(`Q: "${item.q}" -> Present: ${hasQ}, Answer Present: ${hasA}`);
});
