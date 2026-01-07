const fs = require('fs');
const path = require('path');
const https = require('https');

/**
 * RePoE 데이터를 다운로드하는 함수
 */
function downloadFile(url, filePath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath);
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`Downloaded: ${path.basename(filePath)}`);
          resolve();
        });
      } else {
        reject(new Error(`Failed to download: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      fs.unlink(filePath, () => {});
      reject(err);
    });
  });
}

/**
 * 번역 데이터를 업데이트하는 메인 함수
 */
async function updateTranslations() {
  const dataDir = path.join(__dirname, '../data');
  const repoeKoPath = path.join(dataDir, 'repoe_base_items.json');
  const repoeEnPath = path.join(dataDir, 'repoe_base_items_en.json');
  const basesPath = path.join(dataDir, 'bases.json');
  const dictPath = path.join(dataDir, 'dict.json');

  console.log('Updating translations from RePoE...\n');

  try {
    // 1. RePoE 데이터 다운로드
    console.log('Step 1: Downloading RePoE data...');
    await downloadFile(
      'https://repoe-fork.github.io/poe2/Korean/base_items.json',
      repoeKoPath
    );
    await downloadFile(
      'https://repoe-fork.github.io/poe2/base_items.json',
      repoeEnPath
    );
    console.log('✓ RePoE data downloaded\n');

    // 2. 데이터 로드
    console.log('Step 2: Loading data...');
    const repoeKo = JSON.parse(fs.readFileSync(repoeKoPath, 'utf8'));
    const repoeEn = JSON.parse(fs.readFileSync(repoeEnPath, 'utf8'));
    const bases = JSON.parse(fs.readFileSync(basesPath, 'utf8'));
    const existingDict = fs.existsSync(dictPath)
      ? JSON.parse(fs.readFileSync(dictPath, 'utf8'))
      : {};

    const ourItems = Object.keys(bases);
    console.log(`✓ Loaded ${ourItems.length} items from bases.json\n`);

    // 3. RePoE에서 영어-한국어 매핑 생성
    console.log('Step 3: Creating translation mappings...');
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
    console.log(`✓ Created ${Object.keys(repoeMapping).length} translation mappings\n`);

    // 4. 우리 아이템과 매칭
    console.log('Step 4: Matching items...');
    const matched = {};
    const unmatched = [];

    ourItems.forEach(itemName => {
      if (repoeMapping[itemName]) {
        matched[itemName] = repoeMapping[itemName];
      } else {
        unmatched.push(itemName);
      }
    });

    console.log(`✓ Matched: ${Object.keys(matched).length} items`);
    console.log(`  Unmatched: ${unmatched.length} items\n`);

    // 5. dict.json 업데이트 (기존 번역 유지하면서 새 번역 추가)
    console.log('Step 5: Updating dict.json...');
    const updatedDict = { ...existingDict, ...matched };
    fs.writeFileSync(dictPath, JSON.stringify(updatedDict, null, 2));
    console.log(`✓ Updated dict.json with ${Object.keys(matched).length} translations\n`);

    // 6. 매칭되지 않은 항목 저장
    if (unmatched.length > 0) {
      const unmatchedPath = path.join(dataDir, 'unmatched-items.json');
      fs.writeFileSync(unmatchedPath, JSON.stringify(unmatched, null, 2));
      console.log(`⚠ ${unmatched.length} items without translations saved to unmatched-items.json\n`);
    }

    // 7. 결과 요약
    console.log('=== Update Summary ===');
    console.log(`Total items: ${ourItems.length}`);
    console.log(`Translated: ${Object.keys(matched).length}`);
    console.log(`Translation coverage: ${((Object.keys(matched).length / ourItems.length) * 100).toFixed(1)}%`);
    console.log('\n✓ Translation update completed!');

    if (Object.keys(matched).length > 0) {
      console.log('\nSample new translations:');
      Object.entries(matched).slice(0, 5).forEach(([en, ko]) => {
        console.log(`  ${en} -> ${ko}`);
      });
    }

  } catch (error) {
    console.error('Error updating translations:', error);
    process.exit(1);
  }
}

// 스크립트 실행
if (require.main === module) {
  updateTranslations();
}

module.exports = { updateTranslations };
