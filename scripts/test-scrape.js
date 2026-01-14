
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

// Target items to fetch (Example: Currency)
// In a real scenario, this list would come from reading our existing currency-tiers.json
const itemsToFetch = [
  "Divine Orb",
  "Orb of Alchemy",
  "Chaos Orb",
  "Exalted Orb",
  "Mirror of Kalandra",
  "Regal Orb",
  "Artificer's Orb",
  "Transmutation Shard",
  "Scroll of Wisdom",
  "Charm of Strength" 
];

const OUTPUT_FILE = path.join(__dirname, '../data/item-definitions-ko.json');
const BASE_URL = 'https://poe2db.tw/kr/search';

async function fetchItemData(itemName) {
  try {
    console.log(`Fetching data for: ${itemName}...`);
    // Search for the item
    const slug = itemName.replace(/ /g, '_');
    const searchUrl = `https://poe2db.tw/kr/${slug}`;
    console.log(`Requesting: ${searchUrl}`);
    const response = await axios.get(searchUrl);
    const $ = cheerio.load(response.data);
    
    // DEBUG: Write HTML to file to inspect structure
    if (itemName === "Divine Orb") {
        fs.writeFileSync(path.join(__dirname, 'temp_debug.html'), response.data);
    }

    // Logic to parse the search result page
    // poe2db search results often redirect to the item page if there's a unique match, 
    // or list results. We need to handle both or try to guess the direct URL.
    // For now, let's assume we find the first meaningful link or data.
    
    // NOTE: This is a heuristic. 
    // Usually poe2db has a specific structure.
    
    // Let's try to find the item icon and tooltip
    // Icons are often in <img> tags with class 'item-icon' or similar
    // Tooltips are complex HTML structures.
    
    // This is a placeholder for the scraping logic. 
    // We need to inspect the actual HTML structure of poe2db to write robust selectors.
    
    // For demonstration, let's look for a title and an image.
    const nameKo = $('.lc .item_header .item_name').first().text() || itemName; // Fallback
    const iconUrl = $('.lc .item_icon img').first().attr('src');
    
    // Tooltip text extraction is harder because of formatting.
    // We might just grab the raw HTML or text of the main content box.
    const description = $('.lc .implicitMod').text().trim(); // Example
    
    const data = {
      nameEn: itemName,
      nameKo: nameKo.trim(),
      iconUrl: iconUrl,
      description: description
    };
    console.log(`Fetched: ${JSON.stringify(data)}`);
    return data;

  } catch (error) {
    console.error(`Error fetching ${itemName}:`, error.message);
    return null;
  }
}

async function run() {
  const results = {};
  
  for (const item of itemsToFetch) {
    const data = await fetchItemData(item);
    if (data) {
      results[item] = data;
    }
    // Respect rate limits / politeness
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // console.log(JSON.stringify(results, null, 2));
  // fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
  console.log("Done. (Dry run - file write disabled for now)");
}

run();
