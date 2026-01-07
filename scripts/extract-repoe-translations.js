const fs = require('fs');
const path = require('path');

const repoePath = path.join(__dirname, '../data/repoe_base_items.json');
const basesPath = path.join(__dirname, '../data/bases.json');
const dictPath = path.join(__dirname, '../data/dict.json');

const repoe = JSON.parse(fs.readFileSync(repoePath, 'utf8'));
const bases = JSON.parse(fs.readFileSync(basesPath, 'utf8'));
const dict = JSON.parse(fs.readFileSync(dictPath, 'utf8'));

// 우리가 사용하는 아이템 클래스 목록
const gearClasses = [
  'Bows', 'Quivers', 'Crossbows', 'Wands', 'Staves', 'Sceptres',
  'Spears', 'Quarterstaves', 'Talismans', 'One Hand Maces', 'Two Hand Maces',
  'Armours', 'Helmets', 'Gloves', 'Boots', 'Shields', 'Bucklers',
  'Amulets', 'Rings', 'Belts'
];

// RePoE 데이터에서 아이템 추출
const repoeItems = {};
Object.entries(repoe).forEach(([key, value]) => {
  if (!value.name || !value.item_class) return;
  if (!gearClasses.includes(value.item_class)) return;
  
  // 키에서 아이템 이름 추출 (마지막 부분)
  const itemKey = key.split('/').pop();
  
  // 영어 이름 찾기 (description이나 다른 필드에서)
  // RePoE의 경우 name이 한국어이므로, 영어 이름을 찾아야 함
  // 일단 키의 마지막 부분을 영어 이름으로 가정
  repoeItems[itemKey] = {
    ko: value.name,
    class: value.item_class
  };
});

console.log('RePoE items found:', Object.keys(repoeItems).length);

// bases.json의 아이템 이름과 매칭
const ourItemNames = Object.keys(bases);
const matched = {};
const unmatched = [];

ourItemNames.forEach(itemName => {
  // 직접 매칭
  if (repoeItems[itemName]) {
    matched[itemName] = repoeItems[itemName].ko;
    return;
  }
  
  // 부분 매칭 시도 (대소문자 무시)
  const lowerItemName = itemName.toLowerCase();
  const found = Object.entries(repoeItems).find(([key, value]) => {
    const lowerKey = key.toLowerCase();
    return lowerKey === lowerItemName || 
           lowerKey.replace(/\s/g, '') === lowerItemName.replace(/\s/g, '') ||
           lowerKey.includes(lowerItemName) ||
           lowerItemName.includes(lowerKey);
  });
  
  if (found) {
    matched[itemName] = found[1].ko;
  } else {
    unmatched.push(itemName);
  }
});

console.log('\nMatched:', Object.keys(matched).length);
console.log('Unmatched:', unmatched.length);
console.log('\nSample matches:');
Object.entries(matched).slice(0, 10).forEach(([en, ko]) => {
  console.log(`  ${en} -> ${ko}`);
});

// dict.json에 추가
const updatedDict = { ...dict };
Object.entries(matched).forEach(([en, ko]) => {
  updatedDict[en] = ko;
  updatedDict[en.replace(/\s/g, '_')] = ko;
  updatedDict[encodeURIComponent(en)] = ko;
});

// 업데이트된 dict.json 저장
fs.writeFileSync(dictPath, JSON.stringify(updatedDict, null, 2));
console.log(`\nUpdated dict.json with ${Object.keys(matched).length} new translations`);

// 매칭되지 않은 항목 저장
const unmatchedPath = path.join(__dirname, '../data/unmatched-items.json');
fs.writeFileSync(unmatchedPath, JSON.stringify(unmatched, null, 2));
console.log(`Unmatched items saved to: ${unmatchedPath}`);
