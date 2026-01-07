const fs = require('fs');
const path = require('path');

const dictPath = path.join(__dirname, '../data/dict.json');
const basesPath = path.join(__dirname, '../data/bases.json');

const dict = JSON.parse(fs.readFileSync(dictPath, 'utf8'));
const bases = JSON.parse(fs.readFileSync(basesPath, 'utf8'));

const itemNames = Object.keys(bases);
const missing = [];

itemNames.forEach(name => {
  const direct = dict[name];
  const underscore = dict[name.replace(/\s/g, '_')];
  const encoded = dict[encodeURIComponent(name)];
  
  if (!direct && !underscore && !encoded) {
    missing.push(name);
  }
});

console.log('Total items:', itemNames.length);
console.log('Missing translations:', missing.length);
console.log('\nMissing items:');
missing.forEach(name => console.log('  -', name));

// 결과를 파일로 저장
const outputPath = path.join(__dirname, '../data/missing-translations.json');
fs.writeFileSync(outputPath, JSON.stringify(missing, null, 2));
console.log(`\nMissing items saved to: ${outputPath}`);
