const fs = require('fs');
const path = require('path');

const repoeKoPath = path.join(__dirname, '../data/repoe_base_items.json');
const repoeEnPath = path.join(__dirname, '../data/repoe_base_items_en.json');
const basesPath = path.join(__dirname, '../data/bases.json');
const dictPath = path.join(__dirname, '../data/dict.json');

const repoeKo = JSON.parse(fs.readFileSync(repoeKoPath, 'utf8'));
const repoeEn = JSON.parse(fs.readFileSync(repoeEnPath, 'utf8'));
const bases = JSON.parse(fs.readFileSync(basesPath, 'utf8'));
const dict = JSON.parse(fs.readFileSync(dictPath, 'utf8'));

// 우리 아이템 이름 목록
const ourItems = Object.keys(bases);
console.log('Our items:', ourItems.length);

// RePoE에서 영어-한국어 매핑 생성
const repoeMapping = {};
Object.keys(repoeEn).forEach(key => {
  const enItem = repoeEn[key];
  const koItem = repoeKo[key];
  
  if (enItem && enItem.name && koItem && koItem.name) {
    const enName = enItem.name;
    const koName = koItem.name;
    
    // 직접 매핑
    repoeMapping[enName] = koName;
    
    // 공백을 언더스코어로 변환한 버전도 추가
    repoeMapping[enName.replace(/\s/g, '_')] = koName;
    repoeMapping[encodeURIComponent(enName)] = koName;
  }
});

console.log('RePoE mappings created:', Object.keys(repoeMapping).length);

// 우리 아이템과 매칭
const matched = {};
const unmatched = [];

ourItems.forEach(itemName => {
  if (repoeMapping[itemName]) {
    matched[itemName] = repoeMapping[itemName];
  } else {
    unmatched.push(itemName);
  }
});

console.log('\nMatched:', Object.keys(matched).length);
console.log('Unmatched:', unmatched.length);

if (Object.keys(matched).length > 0) {
  console.log('\nSample matches:');
  Object.entries(matched).slice(0, 10).forEach(([en, ko]) => {
    console.log(`  ${en} -> ${ko}`);
  });
}

// dict.json 업데이트
const updatedDict = { ...dict, ...matched };
fs.writeFileSync(dictPath, JSON.stringify(updatedDict, null, 2));
console.log(`\nUpdated dict.json with ${Object.keys(matched).length} new translations`);

// 매칭되지 않은 항목 저장
const unmatchedPath = path.join(__dirname, '../data/unmatched-items.json');
fs.writeFileSync(unmatchedPath, JSON.stringify(unmatched, null, 2));
console.log(`Unmatched items saved to: ${unmatchedPath}`);
