const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'routes_html');
for (const file of fs.readdirSync(dir)) {
  const content = fs.readFileSync(path.join(dir, file), 'utf8');
  console.log(`=== ${file} ===`);
  const title = (content.match(/<title>([^<]+)<\/title>/) || [])[1];
  console.log('Title:', title);
  // Extract text within body
  const bodyText = content.replace(/<script[\s\S]*?<\/script>/gi, '')
                          .replace(/<style[\s\S]*?<\/style>/gi, '')
                          .replace(/<[^>]+>/g, ' ')
                          .replace(/\s+/g, ' ')
                          .trim();
  console.log('Text preview:', bodyText.slice(0, 300));
}
