// scripts/parse-base-tier.mjs
import fs from "node:fs";
import path from "node:path";

const INPUT = path.resolve("input/base-tier.txt");
const OUT_DIR = path.resolve("data");

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function extractTags(line) {
  // 한 줄에 [KEY: VALUE] 여러 개 있는 경우 전부 추출
  // 예: "# [GROUP: gear] [CLASS: Belts] [TIER: 1] [MIN_ILVL: 75]"
  const tags = {};
  const re = /\[([A-Z_]+)\s*:\s*([^\]]*?)\]/g;
  let m;
  while ((m = re.exec(line)) !== null) {
    const key = m[1].trim();
    const value = m[2].trim();
    // 같은 키가 여러 번 나오면 배열로 누적
    if (tags[key] === undefined) tags[key] = value;
    else if (Array.isArray(tags[key])) tags[key].push(value);
    else tags[key] = [tags[key], value];
  }
  return tags;
}

function extractQuotedStrings(line) {
  const re = /"([^"]+)"/g;
  const out = [];
  let m;
  while ((m = re.exec(line)) !== null) out.push(m[1]);
  return out;
}

function normalizeTiersAvailable(v) {
  // "1" / "1,2" / "1,2,3" 형태 지원
  if (!v) return null;
  const s = String(v).replace(/\s+/g, "");
  return s
    .split(",")
    .map((x) => parseInt(x, 10))
    .filter((n) => Number.isFinite(n));
}

function safeSectionId(raw) {
  // SECTION이 "# [SECTION: xxx]" 이 아니라 "# [SECTION: xxx" 처럼 ] 빠져도 대응
  // -> 줄에서 "SECTION:" 뒤를 끝까지 가져오고, 공백/해시 제거
  const idx = raw.indexOf("SECTION:");
  if (idx === -1) return null;
  return raw
    .slice(idx + "SECTION:".length)
    .replace(/[\]#]/g, "")
    .trim();
}

ensureDir(OUT_DIR);

const lines = fs.readFileSync(INPUT, "utf-8").split(/\r?\n/);

const classes = {}; // className -> meta
const tiers = {}; // className -> { tierNumber: [BaseType...] }
const bases = {}; // baseName -> { class, tier, armourType? }

let ctx = {
  section: null,
  group: null,
  className: null,
  armourType: null,
  minIlvl: null,
  capIlvl: null,
  tiersAvailable: null,
  headerTier: null, // 헤더에 [TIER: 1] 같은 경우
};

let currentTier = null;

function commitClassMeta() {
  if (!ctx.className) return;
  const c = ctx.className;

  if (!classes[c])
    classes[c] = {
      group: null,
      minIlvl: null,
      capIlvl: null,
      tiersAvailable: null,
      sections: [],
    };

  // meta 업데이트(이미 있으면 더 구체적인 값 우선)
  const meta = classes[c];
  if (ctx.group) meta.group = ctx.group;
  if (ctx.minIlvl != null) meta.minIlvl = ctx.minIlvl;
  if (ctx.capIlvl != null) meta.capIlvl = ctx.capIlvl;
  if (ctx.tiersAvailable) meta.tiersAvailable = ctx.tiersAvailable;

  if (ctx.section) {
    if (!meta.sections.includes(ctx.section)) meta.sections.push(ctx.section);
  }

  if (!tiers[c]) tiers[c] = {};
}

function addBaseToTier(className, tierNum, armourType, baseList) {
  if (!tiers[className]) tiers[className] = {};
  if (!tiers[className][tierNum]) tiers[className][tierNum] = [];
  const arr = tiers[className][tierNum];

  for (const b of baseList) {
    if (!arr.includes(b)) arr.push(b);

    // bases 역인덱스
    if (!bases[b])
      bases[b] = {
        class: className,
        tier: tierNum,
        armourType: armourType ?? null,
      };
    else {
      // 충돌 감지 (다른 클래스/티어에 같은 BaseType이 들어가면 경고)
      const prev = bases[b];
      if (prev.class !== className || prev.tier !== tierNum) {
        console.warn(
          `[WARN] BaseType conflict: "${b}" was ${prev.class}/T${prev.tier} but now ${className}/T${tierNum}`
        );
      }
    }
  }
}

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  // SECTION 시작 감지
  if (line.includes("[SECTION:")) {
    // 컨텍스트 초기화
    ctx = {
      section: safeSectionId(line),
      group: null,
      className: null,
      armourType: null,
      minIlvl: null,
      capIlvl: null,
      tiersAvailable: null,
      headerTier: null,
    };
    currentTier = null;

    // SECTION 줄에도 태그가 섞여 있을 수 있으니 태그 파싱 시도
    const tags = extractTags(line);
    if (tags.GROUP) ctx.group = String(tags.GROUP);
    if (tags.CLASS) ctx.className = String(tags.CLASS);
    if (tags.ARMOUR_TYPE) ctx.armourType = String(tags.ARMOUR_TYPE);
    if (tags.MIN_ILVL) ctx.minIlvl = parseInt(tags.MIN_ILVL, 10);
    if (tags.CAP_ILVL) ctx.capIlvl = parseInt(tags.CAP_ILVL, 10);
    if (tags.TIERS_AVAILABLE)
      ctx.tiersAvailable = normalizeTiersAvailable(tags.TIERS_AVAILABLE);
    if (tags.TIER) ctx.headerTier = parseInt(tags.TIER, 10);

    commitClassMeta();
    continue;
  }

  // SECTION 헤더 다음 줄들(메타 줄들)에서 태그 업데이트
  if (line.trim().startsWith("#") && line.includes("[") && line.includes(":")) {
    const tags = extractTags(line);

    if (tags.GROUP) ctx.group = String(tags.GROUP);
    if (tags.CLASS) ctx.className = String(tags.CLASS);
    if (tags.ARMOUR_TYPE) ctx.armourType = String(tags.ARMOUR_TYPE);
    if (tags.MIN_ILVL) ctx.minIlvl = parseInt(tags.MIN_ILVL, 10);
    if (tags.CAP_ILVL) ctx.capIlvl = parseInt(tags.CAP_ILVL, 10);
    if (tags.TIERS_AVAILABLE)
      ctx.tiersAvailable = normalizeTiersAvailable(tags.TIERS_AVAILABLE);
    if (tags.TIER) currentTier = parseInt(tags.TIER, 10);

    commitClassMeta();
    continue;
  }

  // BaseType 라인 파싱
  if (line.includes("BaseType") && line.includes("==")) {
    if (!ctx.className) continue; // class 없으면 스킵

    const baseList = extractQuotedStrings(line);
    if (baseList.length === 0) continue;

    // tier 결정: (1) 현재 Tier 태그 (2) 헤더 tier (3) tiersAvailable가 1개면 그거
    let tierNum = currentTier ?? ctx.headerTier ?? null;
    if (
      !tierNum &&
      Array.isArray(ctx.tiersAvailable) &&
      ctx.tiersAvailable.length === 1
    ) {
      tierNum = ctx.tiersAvailable[0];
    }
    if (!tierNum) {
      console.warn(
        `[WARN] Missing TIER for BaseType in class=${
          ctx.className
        }: ${line.trim()}`
      );
      continue;
    }

    addBaseToTier(ctx.className, tierNum, ctx.armourType, baseList);
  }
}

// 출력 정리: 티어 배열 정렬(옵션)
for (const c of Object.keys(tiers)) {
  for (const t of Object.keys(tiers[c])) {
    tiers[c][t].sort((a, b) => a.localeCompare(b));
  }
}

fs.writeFileSync(
  path.join(OUT_DIR, "classes.json"),
  JSON.stringify(classes, null, 2),
  "utf-8"
);
fs.writeFileSync(
  path.join(OUT_DIR, "tiers.json"),
  JSON.stringify(tiers, null, 2),
  "utf-8"
);
fs.writeFileSync(
  path.join(OUT_DIR, "bases.json"),
  JSON.stringify(bases, null, 2),
  "utf-8"
);

console.log(
  "✅ Done. Wrote data/classes.json, data/tiers.json, data/bases.json"
);
