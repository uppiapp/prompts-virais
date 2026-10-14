const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'routes_html', 'index.html'), 'utf8');

// Look for video elements
const videos = [...html.matchAll(/<video[^>]*>([\s\S]*?)<\/video>/gi)].map(m => m[0]);
console.log('Total videos in index.html:', videos.length);
console.log('First video (VSL):', videos[0]);

// Look for FAQ section
const faqIdx = html.indexOf('Perguntas frequentes');
if (faqIdx !== -1) {
  console.log('FAQ section snippet:', html.slice(faqIdx - 50, faqIdx + 1500));
}

// Look for countdown
const countdownIdx = html.indexOf('15 : 00');
if (countdownIdx !== -1) {
  console.log('Countdown snippet:', html.slice(countdownIdx - 100, countdownIdx + 300));
}
