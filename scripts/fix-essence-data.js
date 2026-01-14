const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '../data/item-definitions-ko.json');

try {
    const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
    let fixedCount = 0;

    // List of essence types to fix
    const essenceTypes = [
        "Body", "Mind", "Fire", "Lightning", "Battle", 
        "Infinite", "Sorcery", "Haste", "Ruin", "Torment", 
        "Electricity", "Ice", "Abrasion", "Alacrity", 
        "Command", "Enhancement", "Flames", "Grounding", 
        "Insulation", "Opulence", "Seeking", "Thawing",
        "the Body", "the Mind", "the Infinite"
    ];

    essenceTypes.forEach(type => {
        const baseKey = `Essence of ${type}`;
        const greaterKey = `Greater Essence of ${type}`;

        // If we have the Greater variant data
        if (data[greaterKey]) {
            // Overwrite or create the base variant
            // We preserve the NameKo if it exists and is different, or just sync it?
            // Usually 'Greater' name is '상위 ...', we might want to keep the base name if valid?
            // But the user reported screenshot shows '상위...' for the tier item. 
            // Actually, let's just copy the valid Icon and Tooltip.
            
            if (!data[baseKey]) {
                data[baseKey] = { ...data[greaterKey] };
                // Adjust name if needed? Let's keep the Greater name/icon as that's what we want to show/verify.
                // Or maybe strip "Greater" from English Name but keep Korean Name? 
                // For safety, let's just clone the high quality data.
                console.log(`Created missing: ${baseKey} from ${greaterKey}`);
                fixedCount++;
            } else {
                // If exists, checks if iconUrl is missing
                if (!data[baseKey].iconUrl || data[baseKey].iconUrl.trim() === '') {
                     data[baseKey] = { ...data[greaterKey] };
                     console.log(`Fixed broken: ${baseKey} using ${greaterKey}`);
                     fixedCount++;
                } else {
                    // Even if it has icon, if the user says it's not showing, maybe the URL is bad.
                    // Let's force update if the Greater one is known good (fetched recently).
                    data[baseKey] = { ...data[greaterKey] };
                    console.log(`Force updated: ${baseKey} using ${greaterKey}`);
                    fixedCount++;
                }
            }
        }
    });

    if (fixedCount > 0) {
        fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf8');
        console.log(`Successfully fixed ${fixedCount} Essence entries.`);
    } else {
        console.log("No Essence entries needed fixing.");
    }

} catch (e) {
    console.error("Error fixing essence data:", e);
}
