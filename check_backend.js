const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'site', 'assets');
for (const file of fs.readdirSync(dir)) {
  if (file.endsWith('.js')) {
    const content = fs.readFileSync(path.join(dir, file), 'utf8');
    const supabaseMatches = content.match(/https:\/\/[a-z0-9]+\.supabase\.co/g);
    if (supabaseMatches) {
      console.log(`Supabase URL in ${file}:`, supabaseMatches);
    }
  }
}
