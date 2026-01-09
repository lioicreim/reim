import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FILTER_RULES_PATH = path.join(__dirname, "../data/filter-rules.json");
const OUTPUT_PATH = path.join(__dirname, "../data/currency-type-default-colors.json");

// filter-rules.json 읽기
const filterRules = JSON.parse(fs.readFileSync(FILTER_RULES_PATH, "utf-8"));

// 화폐 종류별 기본 색상 데이터 구조
const currencyTypeColors = {};

// 화폐 종류별로 그룹화하여 티어별 색상 추출
const currencyTypes = ["currency", "runes"]; // 필요한 화폐 종류 추가 가능

currencyTypes.forEach((section) => {
  currencyTypeColors[section] = {
    S: null,
    A: null,
    B: null,
    C: null,
    D: null,
    E: null,
  };

  // 각 티어별로 색상 추출
  ["S", "A", "B", "C", "D", "E"].forEach((tier) => {
    const rid = `${section}_${tier.toLowerCase()}`;
    const rule = filterRules.rules.find((r) => r.rid === rid && r.section === section);

    if (rule && rule.styles) {
      const styles = rule.styles;
      
      // 첫 번째 스타일 그룹에서 색상 추출 (여러 스타일이 있을 수 있음)
      let fontSize = null;
      let textColor = null;
      let borderColor = null;
      let backgroundColor = null;

      // styles 배열에서 색상 정보 찾기
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

      // 기본값 설정 (없으면 null 유지)
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

// currency의 경우 getCurrencyTierColors에서 기본값 가져오기 (없는 경우)
if (!currencyTypeColors.currency.S) {
  currencyTypeColors.currency = {
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

// runes의 경우 필터 파일에서 추출 (runes_d는 backgroundColor가 다름)
// runes의 D 티어 색상은 filter-rules.json에서 이미 추출되었을 것
// 없으면 currency와 동일하게 설정하되, D 티어만 다르게
if (!currencyTypeColors.runes.D || !currencyTypeColors.runes.D.backgroundColor) {
  currencyTypeColors.runes = {
    ...currencyTypeColors.currency,
    D: {
      fontSize: 42,
      textColor: { r: 0, g: 0, b: 0, a: 255 },
      borderColor: { r: 0, g: 0, b: 0, a: 255 },
      backgroundColor: { r: 83, g: 68, b: 0, a: 255 }, // runes의 D 티어는 다른 색상
    },
  };
}

// 파일로 저장
fs.writeFileSync(OUTPUT_PATH, JSON.stringify(currencyTypeColors, null, 2), "utf-8");
console.log(`✅ 화폐 종류별 기본 색상 데이터를 ${OUTPUT_PATH}에 저장했습니다.`);
