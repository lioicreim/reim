const fs = require('fs');
const path = require('path');

const repoePath = path.join(__dirname, '../data/repoe_base_items.json');
const basesPath = path.join(__dirname, '../data/bases.json');

const repoe = JSON.parse(fs.readFileSync(repoePath, 'utf8'));
const bases = JSON.parse(fs.readFileSync(basesPath, 'utf8'));

// 우리의 아이템 이름 목록
const ourItems = Object.keys(bases);
console.log('Our items count:', ourItems.length);

// RePoE에서 Rings 클래스 아이템 찾기
const repoeRings = Object.entries(repoe).filter(([k, v]) => 
  v.item_class === 'Rings' && v.name
);

console.log('\nRePoE Ring items (first 20):');
repoeRings.slice(0, 20).forEach(([k, v]) => {
  const keyName = k.split('/').pop();
  console.log(`Key: ${keyName.padEnd(40)} | KO: ${v.name}`);
});

// 우리의 Ring 아이템
const ourRings = ourItems.filter(name => bases[name].class === 'Rings');
console.log('\nOur Ring items:');
ourRings.forEach(name => console.log(`  ${name}`));

// 매칭 시도: RePoE 키의 마지막 부분과 우리 아이템 이름 비교
console.log('\n\nTrying to match...');
const matches = [];
ourRings.forEach(ourName => {
  const found = repoeRings.find(([k, v]) => {
    const keyName = k.split('/').pop();
    // 다양한 매칭 시도
    const keyLower = keyName.toLowerCase();
    const ourLower = ourName.toLowerCase();
    
    return keyLower === ourLower ||
           keyLower.replace(/\s/g, '') === ourLower.replace(/\s/g, '') ||
           keyLower.includes(ourLower) ||
           ourLower.includes(keyLower) ||
           keyName.replace(/([A-Z])/g, ' $1').trim().toLowerCase() === ourLower;
  });
  
  if (found) {
    matches.push({
      our: ourName,
      repoeKey: found[0].split('/').pop(),
      ko: found[1].name
    });
  }
});

console.log('\nMatches found:', matches.length);
matches.forEach(m => {
  console.log(`  ${m.our} -> ${m.ko} (key: ${m.repoeKey})`);
});
