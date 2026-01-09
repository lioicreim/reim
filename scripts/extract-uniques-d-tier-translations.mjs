import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPOE_EN_PATH = path.join(__dirname, "../data/repoe_base_items_en.json");
const REPOE_KO_PATH = path.join(__dirname, "../data/repoe_base_items.json");
const DICT_PATH = path.join(__dirname, "../data/dict.json");

// 사용자가 제공한 D 티어 기타 유니크 BaseType 리스트
const dTierOtherBaseTypes = [
  "Altar Robe", "Siphoning Wand", "Heavy Bow", "Bloodstone Amulet", "Feathered Sandals",
  "Fur Plate", "Iron Crown", "Broadhead Quiver", "Champion Cuirass", "Gauze Wraps",
  "Reflecting Staff", "Heavy Crown", "Spired Greathelm", "Rope Cuffs", "Felt Cap",
  "Magus Tiara", "Marabout Garb", "Effigial Tower Shield", "Coffer Relic", "Giant Maul",
  "Antler Focus", "Intricate Crest Shield", "Conqueror Plate", "Tattered Robe", "Aged Cuffs",
  "Plate Belt", "Pelage Targe", "Jade Tiara", "Fanatic Bow", "Vaal Cuirass", "Iron Ring",
  "Crimson Amulet", "Fine Belt", "Velvet Cap", "Covert Hood", "Vicious Talisman", "Torment Club",
  "Shrouded Vest", "Wyrm Quarterstaff", "Composite Bow", "Embroidered Gloves", "Lace Hood",
  "Corvus Mantle", "Decorated Helm", "Prismatic Ring", "Shortbow", "Ornate Belt", "Helix Spear",
  "Smuggler Coat", "Dualstring Bow", "Heroic Armour", "Desolate Crossbow", "Cleric Vestments",
  "Straw Sandals", "Wrapped Sandals", "Gilded Vestments", "Havoc Raiment", "Brimmed Helm",
  "Totemic Greatclub", "Death Mask", "Execratus Hammer", "Grounding Charm", "Ironclad Vestments",
  "Grand Cuisses", "Burnished Gauntlets", "Blazon Crest Shield", "Changeling Talisman",
  "Voodoo Focus", "Hermit Garb", "Hardwood Targe", "Pathfinder Coat", "Closed Helm", "Veiled Mask",
  "Cinched Boots", "Layered Gauntlets", "Velour Shoes", "Visceral Quiver", "Stone Greaves",
  "Feathered Robe", "Wrapped Greathelm", "Fire Quiver", "Ruby Ring", "Gargantuan Life Flask",
  "Fierce Greathelm", "Iron Buckler", "Goldcast Cuffs", "Studded Greatclub", "Rusted Cuirass",
  "Laced Boots", "Rhoahide Coat", "Leather Vest", "Horned Crown", "Wooden Club", "Lizardscale Boots",
  "Ornate Buckler", "Sombre Gloves", "Amber Amulet", "Engraved Focus", "Hunting Spear",
  "Leaden Greathammer", "Chain Mail", "Warrior Greathelm", "Iron Greaves", "Assassin Garb",
  "Mail Belt", "Cultist Crown", "Twig Circlet", "Acrid Wand", "War Spear", "Braced Sabatons",
  "Emerald Ring", "Doubled Gauntlets", "Twig Focus", "Elite Greathelm", "Intricate Gloves",
  "Splintered Tower Shield", "Braced Tower Shield", "Scale Mail", "Dyad Crossbow", "Bolstered Mitts",
  "Penetrating Quiver", "Leather Buckler", "Ashen Staff", "Studded Vest", "Voltaic Staff",
  "Iron Cuirass", "Hunter Hood", "Titan Mitts", "Volatile Wand", "Guarded Helm", "Gold Amulet",
  "Soldier Greathelm", "Artillery Bow", "Crescent Targe", "Omen Sceptre", "Quilted Vest",
  "Slim Mace", "Embossed Boots", "Threaded Shoes", "Elementalist Robe", "Waxed Jacket",
  "Abyssal Signet", "Firm Bracers", "Felled Greatclub", "Rusted Greathelm", "Oak Greathammer",
  "Shaman Mantle", "Familial Talisman", "Mail Vestments", "Sectioned Bracers", "Shabby Hood",
  "Vagabond Armour", "Visored Helm", "Ringmail Gauntlets", "Ridged Buckler", "Linen Belt",
  "Full Plate", "Jewelled Gloves", "Hooded Mask", "Rough Greaves", "Attuned Wand", "Ancestral Mail",
  "Lapis Amulet", "Tempered Mitts", "Rampart Tower Shield", "Omen Crest Shield", "Feathered Tiara",
  "Crescent Quarterstaff", "Rawhide Belt", "Makeshift Crossbow", "Toxic Quiver", "Steelpoint Quarterstaff",
  "Bone Raiment", "Pauascale Gloves", "Wooden Buckler", "Suede Bracers", "Sigil Crest Shield",
  "Stacked Sabatons", "Torn Gloves", "Cloaked Mail", "Knight Armour", "Long Quarterstaff",
  "Hunting Shoes", "Keth Raiment", "Serpentscale Coat", "Crumbling Maul", "Tense Crossbow",
  "Blunt Quiver", "Anchorite Garb", "Plated Buckler", "Lunar Amulet", "Emblem Crest Shield",
  "Bone Wand", "Warpick", "Plated Mace", "Tonal Focus", "Covered Sabatons", "Temple Maul",
  "Enlightened Robe", "Spiked Buckler", "Zealot Bow", "Spined Bracers", "Grand Visage",
  "Sacrificial Mantle", "Long Belt", "Hardwood Spear", "Recurve Bow", "Leatherbound Hood",
  "Crucible Tower Shield", "Gelid Staff", "Votive Raiment", "Rogue Armour", "Hexer's Robe",
  "Corsair Cap", "Wrapped Quarterstaff", "Tapestry Relic", "Seal Relic", "Wayfarer Jacket",
  "Rattling Sceptre", "Wicker Tiara", "Cultist Greathammer", "Crystal Focus", "Azure Amulet",
  "Lamellar Mail", "Hewn Mask", "Bronze Greaves", "Mail Sabatons", "Sacral Quiver", "Amphora Relic",
  "Verisium Cuffs", "Scout's Vest", "Raider Plate", "Pyrophyte Staff", "Gothic Quarterstaff",
  "Cowled Helm", "Stone Tower Shield", "Solid Mask", "Ravenous Staff", "Shielded Helm",
  "Withered Wand", "Utility Wraps", "Steeltoe Boots", "Pointed Maul", "Maraketh Cuirass",
  "Riveted Mitts", "Forge Maul", "Ironhead Spear", "Plate Gauntlets", "Plated Raiment",
  "Beaded Circlet", "Secured Leggings", "Steel Plate", "Crude Bow", "Barricade Tower Shield",
  "Silk Slippers", "Painted Tower Shield", "Smithing Hammer", "Strider Vest", "Scalper's Jacket"
];

console.log(`Processing ${dTierOtherBaseTypes.length} D-tier unique BaseTypes...`);

// RePoE 데이터 로드
const repoeEn = JSON.parse(fs.readFileSync(REPOE_EN_PATH, "utf-8"));
const repoeKo = JSON.parse(fs.readFileSync(REPOE_KO_PATH, "utf-8"));
const existingDict = JSON.parse(fs.readFileSync(DICT_PATH, "utf-8"));

// RePoE에서 영어-한국어 매핑 생성
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

// D 티어 BaseType과 매칭
const matched = {};
const unmatched = [];

dTierOtherBaseTypes.forEach((baseType) => {
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
    .slice(0, 15)
    .forEach(([en, ko]) => {
      console.log(`  ${en} -> ${ko}`);
    });
}

if (unmatched.length > 0) {
  console.log("\nUnmatched BaseTypes:");
  unmatched.forEach((baseType) => {
    console.log(`  ${baseType}`);
  });
}

// dict.json 업데이트
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

if (unmatched.length > 0) {
  const unmatchedPath = path.join(__dirname, "../data/unmatched-uniques-d-tier.json");
  fs.writeFileSync(unmatchedPath, JSON.stringify(unmatched, null, 2));
  console.log(`✓ Unmatched items saved to: ${unmatchedPath}`);
}
