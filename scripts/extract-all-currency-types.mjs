import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FILTER_RULES_PATH = path.join(__dirname, "../data/filter-rules.json");
const CURRENCY_CATEGORIES_PATH = path.join(__dirname, "../data/currency-item-categories.json");
const DEFAULT_COLORS_PATH = path.join(__dirname, "../data/currency-type-default-colors.json");

// filter-rules.json 읽기
const filterRules = JSON.parse(fs.readFileSync(FILTER_RULES_PATH, "utf-8"));

// 화폐 종류로 간주할 섹션들 (currency 관련 섹션들)
const currencySections = [
  "currency",
  "runes",
  "essences",
  "ritual_omen",
  "waystones",
  "delirium",
  "breach",
  "abyssal",
  "ancient_bones",
  "expedition",
  "tablet",
  "uncut_gems",
  "lineage_gems",
  "jewels",
  "charm",
  "flask",
  "pinnacle_key",
  "map_fragments",
  "vault_key",
  "incubators",
  "soul_cores",
  "idosl",
];

// 1. 각 화폐 종류별 아이템 목록 추출
const currencyItemCategories = {};
const currencyTypeColors = {};

currencySections.forEach((section) => {
  currencyItemCategories[section] = [];
  currencyTypeColors[section] = {
    S: null,
    A: null,
    B: null,
    C: null,
    D: null,
    E: null,
  };

  // 해당 섹션의 모든 규칙 찾기
  const sectionRules = filterRules.rules.filter(
    (rule) => rule.section === section && rule.type === "show"
  );

  // 각 규칙에서 baseType 조건 추출하여 아이템 목록 수집
  sectionRules.forEach((rule) => {
    if (rule.conditions) {
      rule.conditions.forEach((condition) => {
        if (condition.type === "baseType" && Array.isArray(condition.value)) {
          condition.value.forEach((itemName) => {
            if (!currencyItemCategories[section].includes(itemName)) {
              currencyItemCategories[section].push(itemName);
            }
          });
        }
      });
    }
  });

  // 아이템 목록 정렬
  currencyItemCategories[section].sort((a, b) => a.localeCompare(b));

  // 2. 각 티어별 색상 추출
  ["S", "A", "B", "C", "D", "E"].forEach((tier) => {
    const tierLower = tier.toLowerCase();
    // RID 패턴 매칭: section_tier 또는 다른 형식도 허용
    // 예: ritual_omen_s 또는 omem_s (ritual_omen 섹션의 경우)
    const ridPatterns = [
      `${section}_${tierLower}`,  // 기본 패턴: ritual_omen_s
    ];
    
    // ritual_omen 섹션의 경우 omem_s 형식도 시도
    if (section === "ritual_omen") {
      ridPatterns.push(`omem_${tierLower}`);
    }
    
    // ancient_bones 섹션의 경우 ancient_bone_s 형식도 시도 (단수형)
    if (section === "ancient_bones") {
      ridPatterns.push(`ancient_bone_${tierLower}`);
    }
    
    // 모든 패턴을 시도해서 찾을 때까지 반복
    let rule = null;
    for (const pattern of ridPatterns) {
      rule = sectionRules.find((r) => r.rid === pattern);
      if (rule) break;
    }

    if (rule && rule.styles) {
      const styles = rule.styles;

      let fontSize = null;
      let textColor = null;
      let borderColor = null;
      let backgroundColor = null;

      // styles 배열에서 색상 정보 찾기 (첫 번째 스타일 그룹 사용)
      styles.forEach((style) => {
        if (style.type === "fontSize") {
          fontSize = style.value;
        } else if (style.type === "textColor") {
          textColor = {
            r: style.r || 0,
            g: style.g || 0,
            b: style.b || 0,
            a: style.a !== undefined ? style.a : 255,
          };
        } else if (style.type === "borderColor") {
          borderColor = {
            r: style.r || 0,
            g: style.g || 0,
            b: style.b || 0,
            a: style.a !== undefined ? style.a : 255,
          };
        } else if (style.type === "backgroundColor") {
          backgroundColor = {
            r: style.r || 0,
            g: style.g || 0,
            b: style.b || 0,
            a: style.a !== undefined ? style.a : 255,
          };
        }
      });

      // 색상 정보가 있으면 저장
      if (fontSize || textColor || borderColor || backgroundColor) {
        currencyTypeColors[section][tier] = {
          fontSize: fontSize || 42,
          textColor: textColor || { r: 0, g: 0, b: 0, a: 255 },
          borderColor: borderColor || { r: 0, g: 0, b: 0, a: 255 },
          backgroundColor: backgroundColor || { r: 0, g: 0, b: 0, a: 255 },
        };
      }
    }
  });
});

// 3. 기존 currency-item-categories.json과 병합 (기존 데이터 유지)
let existingCategories = {};
if (fs.existsSync(CURRENCY_CATEGORIES_PATH)) {
  try {
    existingCategories = JSON.parse(fs.readFileSync(CURRENCY_CATEGORIES_PATH, "utf-8"));
  } catch (e) {
    console.warn("기존 currency-item-categories.json을 읽을 수 없습니다. 새로 생성합니다.");
  }
}

// 병합: 기존 데이터가 있으면 유지, 없으면 새로 추출한 데이터 사용
const mergedCategories = { ...currencyItemCategories };
Object.keys(existingCategories).forEach((key) => {
  if (existingCategories[key] && existingCategories[key].length > 0) {
    // 기존 데이터가 더 많으면 유지
    if (existingCategories[key].length >= (mergedCategories[key]?.length || 0)) {
      mergedCategories[key] = existingCategories[key];
    } else {
      // 새로 추출한 데이터가 더 많으면 병합
      const existingSet = new Set(existingCategories[key]);
      currencyItemCategories[key]?.forEach((item) => existingSet.add(item));
      mergedCategories[key] = Array.from(existingSet).sort((a, b) => a.localeCompare(b));
    }
  }
});

// 4. 기존 default-colors.json과 병합
let existingColors = {};
if (fs.existsSync(DEFAULT_COLORS_PATH)) {
  try {
    existingColors = JSON.parse(fs.readFileSync(DEFAULT_COLORS_PATH, "utf-8"));
  } catch (e) {
    console.warn("기존 currency-type-default-colors.json을 읽을 수 없습니다. 새로 생성합니다.");
  }
}

// 병합: 기존 색상이 있으면 유지, 없으면 새로 추출한 색상 사용
const mergedColors = { ...currencyTypeColors };
Object.keys(existingColors).forEach((key) => {
  if (existingColors[key]) {
    mergedColors[key] = { ...currencyTypeColors[key] };
    // 기존 색상이 있으면 유지
    ["S", "A", "B", "C", "D", "E"].forEach((tier) => {
      if (existingColors[key][tier]) {
        mergedColors[key][tier] = existingColors[key][tier];
      }
    });
  }
});

// currency 섹션의 기본값 설정 (없는 경우)
if (!mergedColors.currency || !mergedColors.currency.S) {
  mergedColors.currency = {
    S: {
      fontSize: 45,
      textColor: { r: 255, g: 0, b: 0, a: 255 },
      borderColor: { r: 255, g: 0, b: 0, a: 255 },
      backgroundColor: { r: 255, g: 255, b: 255, a: 255 },
    },
    A: {
      fontSize: 45,
      textColor: { r: 255, g: 255, b: 255, a: 255 },
      borderColor: { r: 255, g: 255, b: 255, a: 255 },
      backgroundColor: { r: 240, g: 35, b: 120, a: 255 },
    },
    B: {
      fontSize: 45,
      textColor: { r: 255, g: 255, b: 255, a: 255 },
      borderColor: { r: 255, g: 255, b: 255, a: 255 },
      backgroundColor: { r: 240, g: 90, b: 35, a: 255 },
    },
    C: {
      fontSize: 42,
      textColor: { r: 0, g: 0, b: 0, a: 255 },
      borderColor: { r: 0, g: 0, b: 0, a: 255 },
      backgroundColor: { r: 249, g: 150, b: 25, a: 255 },
    },
    D: {
      fontSize: 42,
      textColor: { r: 0, g: 0, b: 0, a: 255 },
      borderColor: { r: 0, g: 0, b: 0, a: 255 },
      backgroundColor: { r: 210, g: 178, b: 135, a: 255 },
    },
    E: {
      fontSize: 38,
      textColor: { r: 220, g: 175, b: 132, a: 255 },
      borderColor: { r: 0, g: 0, b: 0, a: 255 },
      backgroundColor: { r: 0, g: 0, b: 0, a: 255 },
    },
  };
}

// 파일로 저장
fs.writeFileSync(
  CURRENCY_CATEGORIES_PATH,
  JSON.stringify(mergedCategories, null, 2),
  "utf-8"
);
console.log(`✅ 화폐 종류별 아이템 카테고리를 ${CURRENCY_CATEGORIES_PATH}에 저장했습니다.`);

fs.writeFileSync(
  DEFAULT_COLORS_PATH,
  JSON.stringify(mergedColors, null, 2),
  "utf-8"
);
console.log(`✅ 화폐 종류별 기본 색상을 ${DEFAULT_COLORS_PATH}에 저장했습니다.`);

// 통계 출력
console.log("\n📊 추출된 화폐 종류 통계:");
Object.keys(mergedCategories).forEach((section) => {
  const itemCount = mergedCategories[section]?.length || 0;
  const colorCount = Object.values(mergedColors[section] || {}).filter((c) => c !== null).length;
  console.log(`  - ${section}: ${itemCount}개 아이템, ${colorCount}개 티어 색상`);
});
