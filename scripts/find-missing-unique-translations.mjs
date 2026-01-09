import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UNIQUES_TIERS_PATH = path.join(__dirname, "../data/uniques-tiers.json");
const QUICK_FILTER_DEFAULTS_PATH = path.join(__dirname, "../data/quick-filter-defaults.json");
const DICT_PATH = path.join(__dirname, "../data/dict.json");
const REPOE_EN_PATH = path.join(__dirname, "../data/repoe_base_items_en.json");
const REPOE_KO_PATH = path.join(__dirname, "../data/repoe_base_items.json");

// 1. 모든 유니크 BaseType 수집
const uniquesTiers = JSON.parse(fs.readFileSync(UNIQUES_TIERS_PATH, "utf-8"));
const quickFilterDefaults = JSON.parse(fs.readFileSync(QUICK_FILTER_DEFAULTS_PATH, "utf-8"));
const dict = JSON.parse(fs.readFileSync(DICT_PATH, "utf-8"));

const allUniquesBaseTypes = new Set();

// S, A, B, C 티어에서 수집
Object.values(uniquesTiers).forEach((tierItems) => {
  tierItems.forEach((baseType) => {
    allUniquesBaseTypes.add(baseType);
  });
});

// D 티어 기타 유니크에서 수집
const dTierRule = quickFilterDefaults.uniques?.rules?.find(r => r.id === "uniques_d_other");
const dTierBaseTypes = dTierRule?.conditions?.baseType?.value || [];
dTierBaseTypes.forEach((baseType) => {
  allUniquesBaseTypes.add(baseType);
});

console.log(`Found ${allUniquesBaseTypes.size} unique BaseTypes total`);

// 2. RePoE 데이터 로드
const repoeEn = JSON.parse(fs.readFileSync(REPOE_EN_PATH, "utf-8"));
const repoeKo = JSON.parse(fs.readFileSync(REPOE_KO_PATH, "utf-8"));

// 3. RePoE에서 영어-한국어 매핑 생성
const repoeMapping = {};
Object.keys(repoeEn).forEach((key) => {
  const enItem = repoeEn[key];
  const koItem = repoeKo[key];

  if (enItem && enItem.name && koItem && koItem.name) {
    const enName = enItem.name;
    const koName = koItem.name;

    // 키의 마지막 부분도 영어 이름으로 사용 가능
    const keyName = key.split("/").pop();
    if (keyName && keyName !== enName) {
      repoeMapping[keyName] = koName;
    }

    // 직접 매핑
    repoeMapping[enName] = koName;

    // 공백을 언더스코어로 변환한 버전도 추가
    repoeMapping[enName.replace(/\s/g, "_")] = koName;
    repoeMapping[encodeURIComponent(enName)] = koName;
  }
});

console.log(`Created ${Object.keys(repoeMapping).length} RePoE mappings`);

// 4. 번역되지 않은 항목 찾기
const missingTranslations = [];
const matchedTranslations = {};

allUniquesBaseTypes.forEach((baseType) => {
  // 이미 dict.json에 있는지 확인
  if (dict[baseType]) {
    matchedTranslations[baseType] = dict[baseType];
    return;
  }

  // RePoE 매핑에서 찾기
  if (repoeMapping[baseType]) {
    matchedTranslations[baseType] = repoeMapping[baseType];
    return;
  }

  // 부분 매칭 시도 (대소문자 무시)
  const lowerBaseType = baseType.toLowerCase();
  const found = Object.entries(repoeMapping).find(([key, value]) => {
    const lowerKey = key.toLowerCase();
    return (
      lowerKey === lowerBaseType ||
      lowerKey.replace(/\s/g, "") === lowerBaseType.replace(/\s/g, "") ||
      lowerKey.includes(lowerBaseType) ||
      lowerBaseType.includes(lowerKey)
    );
  });

  if (found) {
    matchedTranslations[baseType] = found[1];
  } else {
    missingTranslations.push(baseType);
  }
});

console.log(`\nMatched: ${Object.keys(matchedTranslations).length}`);
console.log(`Missing: ${missingTranslations.length}`);

if (missingTranslations.length > 0) {
  console.log("\nMissing translations:");
  missingTranslations.forEach((baseType) => {
    console.log(`  ${baseType}`);
  });
}

// 5. dict.json 업데이트
const updatedDict = { ...dict, ...matchedTranslations };

// 공백을 언더스코어로 변환한 버전과 URL 인코딩 버전도 추가
Object.entries(matchedTranslations).forEach(([en, ko]) => {
  const underscoreName = en.replace(/\s/g, "_");
  const encodedName = encodeURIComponent(en);
  if (!updatedDict[underscoreName]) {
    updatedDict[underscoreName] = ko;
  }
  if (!updatedDict[encodedName]) {
    updatedDict[encodedName] = ko;
  }
});

fs.writeFileSync(DICT_PATH, JSON.stringify(updatedDict, null, 2));
console.log(`\n✓ Updated dict.json with ${Object.keys(matchedTranslations).length} new translations`);

if (missingTranslations.length > 0) {
  const missingPath = path.join(__dirname, "../data/missing-unique-translations.json");
  fs.writeFileSync(missingPath, JSON.stringify(missingTranslations, null, 2));
  console.log(`✓ Missing translations saved to: ${missingPath}`);
}
