const fs = require('fs');
const tiers = JSON.parse(fs.readFileSync('d:/MyLibrary/MyDocuments/My Games/_Project/reim/data/currency-tiers.json', 'utf8'));
const categories = JSON.parse(fs.readFileSync('d:/MyLibrary/MyDocuments/My Games/_Project/reim/data/currency-item-categories.json', 'utf8'));

const breachItems = categories['breach'] || [];
console.log("Breach Items count:", breachItems.length);

const foundInTiers = { normal: [], notFound: [] };
const leagueData = tiers['normal'] || {}; 

breachItems.forEach(item => {
    let found = false;
    for (const [tier, list] of Object.entries(leagueData)) {
        if (list.includes(item)) {
            foundInTiers.normal.push({ item, tier });
            found = true;
            break;
        }
    }
    if (!found) foundInTiers.notFound.push(item);
});

console.log("Found count:", foundInTiers.normal.length);
console.log("Not Found:", foundInTiers.notFound);
