const fs = require('fs');
const path = require('path');

const tiersPath = path.join(__dirname, '../data/currency-tiers.json');
const categoriesPath = path.join(__dirname, '../data/currency-item-categories.json');

const tiers = JSON.parse(fs.readFileSync(tiersPath, 'utf8'));
const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));

// 별도 섹션이나 함수로 처리되는 카테고리들 제외
const excludedCategories = [
    "uncut_gems",   // generateUncutGemsRules
    "waystones",    // generateWaystonesRules
    "expedition",   // generateExpeditionRules (logbooks, artifacts)
    "charm",        // generateCharmsRules
    "flask",        // Flasks might be handled separately or generally (check filter-generator)
                    // But usually utility flasks are separate.
    // "ritual_omen" // ritual_omen is handled in currency rules but needs to be in tiers.
];

const targetTier = "C";
let count = 0;
let categoriesAdded = {};

Object.keys(categories).forEach(cat => {
    if (excludedCategories.includes(cat)) return;

    const items = categories[cat];
    if (!items || items.length === 0) return;

    items.forEach(item => {
        // Check if item exists in ANY tier of 'normal' league
        let exists = false;
        
        // We check against 'normal' league primarily as it's the default
        // If it's missing in normal, we add it to C tier in ALL leagues
        if (tiers.normal) {
            Object.values(tiers.normal).forEach(list => {
                if (list.includes(item)) exists = true;
            });
        }

        if (!exists) {
            // Add to all leagues
            Object.keys(tiers).forEach(league => {
                if (!tiers[league][targetTier]) tiers[league][targetTier] = [];
                // Double check existence in this specific league to be safe
                let leagueExists = false;
                Object.values(tiers[league]).forEach(list => {
                    if (list.includes(item)) leagueExists = true;
                });
                
                if (!leagueExists) {
                    tiers[league][targetTier].push(item);
                }
            });
            count++;
            if (!categoriesAdded[cat]) categoriesAdded[cat] = 0;
            categoriesAdded[cat]++;
        }
    });
});

fs.writeFileSync(tiersPath, JSON.stringify(tiers, null, 2));
console.log(`Added ${count} missing items to ${targetTier} tier across leagues.`);
console.log("By Category:", categoriesAdded);
