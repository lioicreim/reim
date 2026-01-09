import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UNIQUES_TIERS_PATH = path.join(__dirname, "../data/uniques-tiers.json");
const REPOE_EN_PATH = path.join(__dirname, "../data/repoe_base_items_en.json");
const REPOE_KO_PATH = path.join(__dirname, "../data/repoe_base_items.json");
const DICT_PATH = path.join(__dirname, "../data/dict.json");

// 1. uniques-tiers.json에서 모든 BaseType 추출
const uniquesTiers = JSON.parse(fs.readFileSync(UNIQUES_TIERS_PATH, "utf-8"));
const allUniquesBaseTypes = new Set();

Object.values(uniquesTiers).forEach((tierItems) => {
  tierItems.forEach((baseType) => {
    allUniquesBaseTypes.add(baseType);
  });
});

console.log(`Found ${allUniquesBaseTypes.size} unique BaseTypes in uniques-tiers.json`);

// 2. RePoE 데이터 로드
const repoeEn = JSON.parse(fs.readFileSync(REPOE_EN_PATH, "utf-8"));
const repoeKo = JSON.parse(fs.readFileSync(REPOE_KO_PATH, "utf-8"));
const existingDict = JSON.parse(fs.readFileSync(DICT_PATH, "utf-8"));

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

// 4. 유니크 BaseType과 매칭
const matched = {};
const unmatched = [];

allUniquesBaseTypes.forEach((baseType) => {
  // 이미 dict.json에 있는지 확인
  if (existingDict[baseType]) {
    matched[baseType] = existingDict[baseType];
    return;
  }

  // RePoE 매핑에서 찾기
  if (repoeMapping[baseType]) {
    matched[baseType] = repoeMapping[baseType];
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
    matched[baseType] = found[1];
  } else {
    unmatched.push(baseType);
  }
});

console.log(`\nMatched: ${Object.keys(matched).length}`);
console.log(`Unmatched: ${unmatched.length}`);

if (Object.keys(matched).length > 0) {
  console.log("\nSample matches:");
  Object.entries(matched)
    .slice(0, 10)
    .forEach(([en, ko]) => {
      console.log(`  ${en} -> ${ko}`);
    });
}

if (unmatched.length > 0) {
  console.log("\nSample unmatched:");
  unmatched.slice(0, 10).forEach((baseType) => {
    console.log(`  ${baseType}`);
  });
}

// 5. dict.json 업데이트
const updatedDict = { ...existingDict, ...matched };

// 공백을 언더스코어로 변환한 버전과 URL 인코딩 버전도 추가
Object.entries(matched).forEach(([en, ko]) => {
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
console.log(`\n✓ Updated dict.json with ${Object.keys(matched).length} new translations`);

// 6. 매칭되지 않은 항목 저장
const unmatchedPath = path.join(__dirname, "../data/unmatched-uniques.json");
fs.writeFileSync(unmatchedPath, JSON.stringify(unmatched, null, 2));
console.log(`✓ Unmatched items saved to: ${unmatchedPath}`);
