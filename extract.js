const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'original.html'), 'utf8');

// Regex extractions
const links = [...html.matchAll(/<link\s+[^>]*>/gi)].map(m => m[0]);
const scripts = [...html.matchAll(/<script\s*[^>]*>([\s\S]*?)<\/script>/gi)].map(m => ({ tag: m[0], src: (m[0].match(/src=["']([^"']+)["']/) || [])[1], inline: m[1] }));
const images = [...html.matchAll(/<img\s+[^>]*>/gi)].map(m => {
  const src = (m[0].match(/src=["']([^"']+)["']/) || [])[1];
  return { tag: m[0], src };
});
const videos = [...html.matchAll(/<video\s+[^>]*>([\s\S]*?)<\/video>/gi)].map(m => m[0]);
const iframes = [...html.matchAll(/<iframe\s+[^>]*>([\s\S]*?)<\/iframe>/gi)].map(m => m[0]);

// Also look for video/mp4, webm, m3u8, vturb, vsl, wistia, panda, youtube in the whole html
const urlsInHtml = [...html.matchAll(/(https?:\/\/[^\s"'<>\\]+)/gi)].map(m => m[1]);
const videoUrls = urlsInHtml.filter(u => /\.(mp4|webm|m3u8|mov)($|\?)/i.test(u) || /vturb|wistia|panda|youtube|vimeo|bunny/i.test(u));
const imageUrls = urlsInHtml.filter(u => /\.(png|jpe?g|webp|svg|gif)($|\?)/i.test(u) || /images\.unsplash\.com/i.test(u));

console.log('--- LINKS ---');
console.log(links.slice(0, 20));
console.log('--- SCRIPTS WITH SRC ---');
console.log(scripts.filter(s => s.src).map(s => s.src));
console.log('--- IMAGES COUNT ---', images.length);
console.log('Sample images:', images.slice(0, 15).map(i => i.src));
console.log('--- VIDEOS TAGS COUNT ---', videos.length);
console.log(videos);
console.log('--- IFRAMES COUNT ---', iframes.length);
console.log(iframes);
console.log('--- VIDEO URLS FOUND ---', videoUrls);
console.log('--- IMAGE URLS FOUND COUNT ---', imageUrls.length);
console.log('Sample image URLs:', imageUrls.slice(0, 20));

fs.writeFileSync('extracted_summary.json', JSON.stringify({
  links,
  scripts: scripts.map(s => ({ src: s.src, hasInline: !!s.inline })),
  images: images.map(i => i.src),
  videos,
  iframes,
  videoUrls,
  imageUrls: Array.from(new Set(imageUrls))
}, null, 2));
