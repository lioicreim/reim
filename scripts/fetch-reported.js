
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const OUTPUT_FILE = path.join(DATA_DIR, 'item-definitions-ko.json');
const BASE_URL = 'https://poe2db.tw/kr';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Specific items reported by user (English names found in currency-tiers.json)
const targetItems = [
    // Correct Greater Essence Names from dict.json
    "Greater Essence of Abrasion",
    "Greater Essence of Alacrity", 
    "Greater Essence of Battle",
    "Greater Essence of Command",
    "Greater Essence of Electricity",
    "Greater Essence of Enhancement",
    "Greater Essence of Flames",
    "Greater Essence of Grounding",
    "Greater Essence of Haste",
    "Greater Essence of Ice",
    "Greater Essence of Insulation",
    "Greater Essence of Opulence",
    "Greater Essence of Ruin",
    "Greater Essence of Seeking",
    "Greater Essence of Sorcery",
    "Greater Essence of Thawing",
    "Greater Essence of the Body",
    "Greater Essence of the Infinite",
    "Greater Essence of the Mind",

    // Missing Runes (S-Tier default)
    "Hedgewitch Assandra's Rune of Wisdom",
    "Greater Rune of Alacrity",
    "Farrul's Rune of the Chase",
    "Countess Seske's Rune of Archery",
    "Storm Rune",
    "Iron Rune",
    "Lesser Iron Rune",
    "Lesser Robust Rune",
    "Lesser Adept Rune",
    "Lesser Resolve Rune",
    "Greater Rune of Leadership",
    "Greater Rune of Tithing",
    "Saqawal's Rune of the Sky",
    "Saqawal's Rune of Memory",
    "Courtesan Mannan's Rune of Cruelty",
    "Thane Girt's Rune of Wildness",

    
    // Distillates (Liquid items)
    "Concentrated Liquid Suffering", "Concentrated Liquid Isolation", "Concentrated Liquid Fear",
    "Liquid Despair", "Liquid Emotions",
    
    // Omens
    "Omen of the Ancients", 
    "Omen of Bartering", 
    "Omen of Gambling", 
    "Omen of Chance",
    "Omen of Recombination",
    "Omen of Corruption",
    "Omen of Amelioration",
    
    // Uniques
    "Atziri's Communion",
    "Zarokh's Revolt",
    "Einhar's Beastrite",
    "Omen of the Blessed"
];

// Helper to find fuzzy matches if exact slug fails?
// For now, strict slug.

async function fetchItemData(itemName) {
  try {
    // Basic slug: space -> underscore
    let urlSlug = itemName.replace(/ /g, '_');
    
    // Special handling for some essences if naming matches 'Essence_of_the_Body' etc.
    // They seem standard. 
    
    const url = `${BASE_URL}/${urlSlug}`;
    console.log(`[${itemName}] Requesting: ${url}`);
    
    // Axios config to handle redirects if poe2db does that? usually it returns 200.
    const response = await axios.get(url, { validateStatus: status => status < 500 });

    if (response.status === 404) {
      console.warn(`[${itemName}] Not found (404). Trying search fallback...`);
      // Fallback: simple search URL construction?
      // https://poe2db.tw/kr/search?q=itemName
      // But searching is harder to parse.
      return null;
    }

    const $ = cheerio.load(response.data);
    let nameKo = $('meta[property="og:title"]').attr('content');
    if (nameKo && nameKo.includes(' - PoE2DB')) {
        nameKo = nameKo.split(' - PoE2DB')[0];
    }
    const iconUrl = $('meta[property="og:image"]').attr('content');
    
    let tooltipHtml = $('.newItemPopup').first().html();
    if (!tooltipHtml) {
        tooltipHtml = $('.item-popup--poe2').first().html();
    }
    
    if (tooltipHtml) {
        tooltipHtml = tooltipHtml.replace(/href="\/kr\//g, 'href="https://poe2db.tw/kr/');
    }

    if (nameKo) {
        return {
            nameEn: itemName,
            nameKo: nameKo.trim(),
            iconUrl: iconUrl,
            tooltipHtml: tooltipHtml,
            fetchedAt: new Date().toISOString()
        };
    }
    return null;
  } catch (error) {
    console.error(`[${itemName}] Error:`, error.message);
    return null;
  }
}

async function run() {
  let definitions = {};
  if (fs.existsSync(OUTPUT_FILE)) {
      definitions = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'));
  }

  // Also scan definitions for items that exist but have NO iconUrl (broken)
  for (const key in definitions) {
      if (!definitions[key].iconUrl || definitions[key].iconUrl.includes('undefined')) {
          if (!targetItems.includes(key)) {
            // targetItems.push(key); // Re-fetch broken icons if we want
          }
      }
  }

  console.log(`Targeting ${targetItems.length} specific items.`);

  for (const item of targetItems) {
      const data = await fetchItemData(item);
      if (data) {
          definitions[item] = data;
          console.log(`Updated: ${item} -> ${data.nameKo}`);
      } else {
          console.log(`Failed to fetch: ${item}`);
      }
      await sleep(1000); 
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(definitions, null, 2));
  console.log('Done. Data saved.');
}

run();
