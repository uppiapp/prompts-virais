const fs = require('fs');
const content = fs.readFileSync('site/assets/index-BpEXh5S0.js', 'utf8');
const regex = /.{0,50}\/assets\/CRIA[^\"'\s\)\>]+.{0,50}/g;
let m;
while ((m = regex.exec(content)) !== null) {
  console.log('MATCH:', m[0]);
}
