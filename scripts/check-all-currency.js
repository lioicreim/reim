const fs = require('fs');
const path = require('path');

const tiersPath = path.join(__dirname, '../data/currency-tiers.json');
const categoriesPath = path.join(__dirname, '../data/currency-item-categories.json');

const tiers = JSON.parse(fs.readFileSync(tiersPath, 'utf8'));
const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));

const allCategories = Object.keys(categories);
let missingItems = [];
const leagueData = tiers['normal'] || {};

allCategories.forEach(cat => {
    const items = categories[cat];
    items.forEach(item => {
        let found = false;
        // 리그 데이터의 모든 티어를 뒤짐
        for (const [tier, list] of Object.entries(leagueData)) {
            if (list.includes(item)) {
                found = true;
                break;
            }
        }
        if (!found) {
            missingItems.push({ category: cat, item });
        }
    });
});

console.log(`Total missing items: ${missingItems.length}`);
if (missingItems.length > 0) {
    console.log("Missing Items Summary (Count by Category):");
    const summary = {};
    missingItems.forEach(x => {
        if (!summary[x.category]) summary[x.category] = 0;
        summary[x.category]++;
    });
    console.log(summary);
}
