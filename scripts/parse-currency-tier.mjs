// scripts/parse-currency-tier.mjs
import fs from "node:fs";
import path from "node:path";

const INPUT = path.resolve("input/currency-tier.txt");
const OUT_DIR = path.resolve("data");

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function extractQuotedStrings(line) {
  const re = /"([^"]+)"/g;
  const out = [];
  let m;
  while ((m = re.exec(line)) !== null) out.push(m[1]);
  return out;
}

function extractRID(line) {
  // [RID: currency_preset_early_game_s][RID: currency_s] 형태에서 프리셋과 티어 추출
  // 패턴: currency_preset_<preset_type>_<tier>
  // 예: currency_preset_early_game_s, currency_preset_normal_a, currency_preset_ssf_s
  
  let preset = null;
  let tier = null;
  
  // currency_preset_로 시작하는 패턴 찾기
  const presetPattern = /currency_preset_([a-z_]+)_([a-z])/i;
  const presetMatch = line.match(presetPattern);
  
  if (presetMatch) {
    const presetType = presetMatch[1]; // early_game, normal, late_game, ssf, __normal
    const tierLetter = presetMatch[2]; // s, a, b, c, d, e
    
    // 프리셋 타입 매핑
    if (presetType === "early_game") preset = "early";
    else if (presetType === "late_game") preset = "late";
    else if (presetType === "normal" || presetType === "__normal") preset = "normal";
    else if (presetType === "ssf") preset = "ssf";
    
    // 티어 매핑 (소문자를 대문자로)
    tier = tierLetter.toUpperCase();
  } else {
    // currency_로 시작하는 패턴 찾기 (fallback)
    const tierPattern = /currency_([sabcde])/i;
    const tierMatch = line.match(tierPattern);
    if (tierMatch) {
      tier = tierMatch[1].toUpperCase();
    }
  }
  
  return { preset, tier };
}

ensureDir(OUT_DIR);

const lines = fs.readFileSync(INPUT, "utf-8").split(/\r?\n/);

const currencyData = {
  early: { S: [], A: [], B: [], C: [], D: [], E: [] },
  normal: { S: [], A: [], B: [], C: [], D: [], E: [] },
  late: { S: [], A: [], B: [], C: [], D: [], E: [] },
  ssf: { S: [], A: [], B: [], C: [], D: [], E: [] }
  // default는 normal의 복사본으로 설정 (나중에 관리자모드에서 변경 가능)
};

let currentPreset = null;
let currentTier = null;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // 주석 줄에서 RID 추출
  if (line.trim().startsWith("#") && line.includes("[RID:")) {
    const { preset, tier } = extractRID(line);
    if (preset) currentPreset = preset;
    if (tier) currentTier = tier;
    continue;
  }
  
  // BaseType 라인 파싱
  if (line.includes("BaseType") && line.includes("==")) {
    const baseList = extractQuotedStrings(line);
    if (baseList.length === 0) continue;
    
    // 현재 프리셋과 티어가 있으면 추가
    if (currentPreset && currentTier) {
      const presetData = currencyData[currentPreset];
      if (presetData && presetData[currentTier]) {
        // 중복 제거하면서 추가
        baseList.forEach(item => {
          if (!presetData[currentTier].includes(item)) {
            presetData[currentTier].push(item);
          }
        });
      }
    }
    
    // 다음 줄을 위해 초기화하지 않음 (같은 프리셋/티어가 여러 줄에 걸쳐 있을 수 있음)
  }
}

// 각 프리셋별로 티어 배열 정렬
Object.keys(currencyData).forEach(preset => {
  Object.keys(currencyData[preset]).forEach(tier => {
    currencyData[preset][tier].sort((a, b) => a.localeCompare(b));
  });
});

// default는 normal의 복사본으로 설정 (나중에 관리자모드에서 변경 가능)
currencyData.default = JSON.parse(JSON.stringify(currencyData.normal));

// 모든 화폐 아이템 목록 추출 (중복 제거)
const allCurrencyItems = new Set();
Object.keys(currencyData).forEach(preset => {
  Object.keys(currencyData[preset]).forEach(tier => {
    currencyData[preset][tier].forEach(item => {
      allCurrencyItems.add(item);
    });
  });
});

const currencyItems = Array.from(allCurrencyItems).sort();

// JSON 파일로 저장
fs.writeFileSync(
  path.join(OUT_DIR, "currency-tiers.json"),
  JSON.stringify(currencyData, null, 2),
  "utf-8"
);

fs.writeFileSync(
  path.join(OUT_DIR, "currency-items.json"),
  JSON.stringify(currencyItems, null, 2),
  "utf-8"
);

console.log("✓ Currency tier data parsed successfully!");
console.log(`  - Total currency items: ${currencyItems.length}`);
console.log(`  - Presets: early, normal, late, ssf, default (default = normal)`);
console.log(`  - Tiers: S, A, B, C, D, E`);
