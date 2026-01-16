const fs = require('fs');
const path = require('path');

// __dirname은 스크립트 파일 위치 기준이므로 ../data가 맞음
const tiersPath = path.join(__dirname, '../data/currency-tiers.json');
const categoriesPath = path.join(__dirname, '../data/currency-item-categories.json');

const tiers = JSON.parse(fs.readFileSync(tiersPath, 'utf8'));
const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));

const breachItems = categories['breach'] || [];
const targetTier = "C";

console.log(`Adding ${breachItems.length} breach items to ${targetTier} tier...`);

let updateCount = 0;

// 모든 리그에 대해 추가
Object.keys(tiers).forEach(league => {
    if (!tiers[league][targetTier]) {
        tiers[league][targetTier] = [];
    }
    
    // 중복 방지하며 추가
    breachItems.forEach(item => {
        let exists = false;
        // 해당 리그의 모든 티어 확인
        Object.values(tiers[league]).forEach(list => {
            if (list.includes(item)) exists = true;
        });

        if (!exists) {
            tiers[league][targetTier].push(item);
            updateCount++;
        }
    });
});

fs.writeFileSync(tiersPath, JSON.stringify(tiers, null, 2));
console.log(`Added ${updateCount} entries. (Total breach items: ${breachItems.length} * Leagues)`);
console.log("Done.");
