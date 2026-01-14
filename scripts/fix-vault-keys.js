const fs = require('fs');
const path = require('path');

// 1. Fix currency-tiers.json
const tiersPath = path.join(__dirname, '../data/currency-tiers.json');
try {
  const tiersData = JSON.parse(fs.readFileSync(tiersPath, 'utf8'));
  let modifiedTiers = false;

  Object.keys(tiersData).forEach(league => {
    // Check if D tier exists and is an array
    if (tiersData[league].D && Array.isArray(tiersData[league].D)) {
      if (!tiersData[league].D.includes("Twilight Reliquary Key")) {
        tiersData[league].D.push("Twilight Reliquary Key");
        modifiedTiers = true;
        console.log(`Added Twilight Reliquary Key to ${league} D tier`);
      }
    } else {
      // If D tier doesn't exist, create it (optional, but good for safety)
      if (!tiersData[league].D) {
         tiersData[league].D = ["Twilight Reliquary Key"];
         modifiedTiers = true;
         console.log(`Created D tier and added Twilight Reliquary Key to ${league}`);
      }
    }
  });

  if (modifiedTiers) {
    fs.writeFileSync(tiersPath, JSON.stringify(tiersData, null, 2));
    console.log('Saved currency-tiers.json');
  } else {
    console.log('currency-tiers.json already has the key');
  }
} catch (e) {
  console.error("Error updating currency-tiers.json:", e);
}

// 2. Fix item-definitions-ko.json
const defsPath = path.join(__dirname, '../data/item-definitions-ko.json');
const baseUrl = 'https://cdn.poe2db.tw/image/Art/2DItems/Currency/ReliquaryKeys/';

const newItems = {
  "Xesht's Reliquary Key": { nameKo: "제쉬트의 성물함 열쇠", icon: "ReliquaryKeyXesht.webp" },
  "The Trialmaster's Reliquary Key": { nameKo: "결전의 대가 성물함 열쇠", icon: "ReliquaryKeyTrialmaster.webp" },
  "Tangmazu's Reliquary Key": { nameKo: "탕마즈의 성물함 열쇠", icon: "ReliquaryKeyTangmazu.webp" },
  "Olroth's Reliquary Key": { nameKo: "올로스의 성물함 열쇠", icon: "ReliquaryKeyOlroth.webp" },
  "The Arbiter's Reliquary Key": { nameKo: "중재자의 성물함 열쇠", icon: "ReliquaryKeyArbiter.webp" },
  "Zarokh's Reliquary Key: Against the Darkness": { nameKo: "자로크의 성물함 열쇠: 어둠에 맞서", icon: "ReliquaryKeyZarokh.webp" },
  "Zarokh's Reliquary Key: Sandstorm Visage": { nameKo: "자로크의 성물함 열쇠: 모래폭풍의 형상", icon: "ReliquaryKeyZarokh.webp" },
  "Zarokh's Reliquary Key: Blessed Bonds": { nameKo: "자로크의 성물함 열쇠: 축복받은 결속", icon: "ReliquaryKeyZarokh.webp" },
  "Zarokh's Reliquary Key: Sekhema's Resolve": { nameKo: "자로크의 성물함 열쇠: 세케마의 결의", icon: "ReliquaryKeyZarokh.webp" },
  "Zarokh's Reliquary Key: Temporalis": { nameKo: "자로크의 성물함 열쇠: 템포랄리스", icon: "ReliquaryKeyZarokh.webp" },
  "Azmeri Reliquary Key": { nameKo: "아즈메리 성물함 열쇠", icon: "ReliquaryKeyAzmeri.webp" },
  "Ritualistic Reliquary Key": { nameKo: "의식의 성물함 열쇠", icon: "ReliquaryKeyRitual.webp" },
  "Twilight Reliquary Key": { nameKo: "황혼의 성물함 열쇠", icon: "ReliquaryKeyTwilight.webp" }
};

try {
  let defsData = {};
  try {
     defsData = JSON.parse(fs.readFileSync(defsPath, 'utf8'));
  } catch (err) {
    console.error("Could not read definitions file, creating new?", err);
    // Don't create new if it fails to read, risky.
    throw err;
  }

  let modifiedDefs = false;
  Object.keys(newItems).forEach(key => {
    if (!defsData[key]) {
      defsData[key] = {
        nameEn: key,
        nameKo: newItems[key].nameKo,
        iconUrl: baseUrl + newItems[key].icon,
        fetchedAt: new Date().toISOString()
      };
      modifiedDefs = true;
      console.log(`Added definition for ${key}`);
    }
  });

  if (modifiedDefs) {
    fs.writeFileSync(defsPath, JSON.stringify(defsData, null, 2));
    console.log('Saved item-definitions-ko.json');
  } else {
    console.log('item-definitions-ko.json already up to date');
  }
} catch (e) {
  console.error("Error updating item-definitions-ko.json:", e);
}
