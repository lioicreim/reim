
const fs = require('fs');
const path = require('path');

const currencyTiersPath = path.join(__dirname, '../data/currency-tiers.json');
const definitionsPath = path.join(__dirname, '../data/item-definitions-ko.json');

const currencyTiers = JSON.parse(fs.readFileSync(currencyTiersPath, 'utf8'));
const definitions = JSON.parse(fs.readFileSync(definitionsPath, 'utf8'));

const allItems = new Set();

function traverse(obj) {
  for (const key in obj) {
    if (Array.isArray(obj[key])) {
      obj[key].forEach(item => allItems.add(item));
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      traverse(obj[key]);
    }
  }
}

traverse(currencyTiers);

const missing = [];
const present = [];

allItems.forEach(item => {
  if (!definitions[item]) {
    missing.push(item);
  } else {
    present.push(item);
  }
});

console.log(`Total items in tier list: ${allItems.size}`);
console.log(`Items with definitions: ${present.length}`);
console.log(`Missing items: ${missing.length}`);
console.log('--- Missing Items Sample (First 50) ---');
console.log(missing.slice(0, 50).join('\n'));

// Check specific requested items
const checks = ["Superior Spirit Rune", "Puhuarte's Soul Core", "Transmutation Shard"];
console.log('--- Specific Checks ---');
checks.forEach(c => {
    console.log(`'${c}' in tier list? ${allItems.has(c)}`);
    console.log(`'${c}' in definitions? ${!!definitions[c]}`);
});
