
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const CURRENCY_TIERS_PATH = path.join(DATA_DIR, 'currency-tiers.json');
const OUTPUT_FILE = path.join(DATA_DIR, 'item-definitions-ko.json');
const BASE_URL = 'https://poe2db.tw/kr';

// Helper to delay
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const UNIQUES_TIERS_PATH = path.join(DATA_DIR, 'uniques-tiers.json');

// Load item names from currency-tiers and uniques-tiers
function getItemList() {
  const currencyData = JSON.parse(fs.readFileSync(CURRENCY_TIERS_PATH, 'utf-8'));
  let uniquesData = {};
  if (fs.existsSync(UNIQUES_TIERS_PATH)) {
      uniquesData = JSON.parse(fs.readFileSync(UNIQUES_TIERS_PATH, 'utf-8'));
  }

  const uniqueItems = new Set();

  function traverse(obj) {
    for (const key in obj) {
      if (Array.isArray(obj[key])) {
        obj[key].forEach(item => uniqueItems.add(item));
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        traverse(obj[key]);
      }
    }
  }

  traverse(currencyData);
  traverse(uniquesData);
  
  return Array.from(uniqueItems).sort();
}

async function fetchItemData(itemName) {
  try {
    const slug = itemName.replace(/ /g, '_').replace(/'/g, '%27'); // Simple slug, handle apostrophe if needed for URL? 
    // Actually poe2db usually keeps apostrophe or encodes it. ' -> %27
    // Let's rely on encodeURI for safety, but usually spaces to underscores is key.
    // Testing showed "Divine_Orb" works.
    
    // Better slug logic for poe2db:
    // "Hinekora's Lock" -> "Hinekoras_Lock"? No, often they keep it or use specific handling.
    // Let's try flexible slug 
    // "Hinekora's Lock" -> "Hinekoras_Lock" is common in wiki but poe2db might be strict.
    // Let's try with "Divine_Orb" style.
    // If strict slug fails, maybe search?
    // Let's stick to space -> underscore for now, and encodeURIComponent parts if needed.
    
    const urlSlug = itemName.replace(/ /g, '_');
    const url = `${BASE_URL}/${urlSlug}`;
    
    console.log(`[${itemName}] Requesting: ${url}`);
    const response = await axios.get(url, {
      validateStatus: status => status < 500 // Handle 404 manually
    });

    if (response.status === 404) {
      console.warn(`[${itemName}] Not found (404).`);
      return null;
    }

    const $ = cheerio.load(response.data);

    // 1. Name KO
    let nameKo = $('meta[property="og:title"]').attr('content');
    // Sanitize: "신성한 오브 - PoE2DB..."
    if (nameKo && nameKo.includes(' - PoE2DB')) {
        nameKo = nameKo.split(' - PoE2DB')[0];
    }
    
    // 2. Icon
    const iconUrl = $('meta[property="og:image"]').attr('content');

    // 3. Tooltip
    // Try .newItemPopup first (POE 2 style)
    let tooltipHtml = $('.newItemPopup').first().html();
    
    // If empty, try other containers if structure differs
    if (!tooltipHtml) {
        // Fallback for some items?
        tooltipHtml = $('.item-popup--poe2').first().html();
    }
    
    if (!tooltipHtml) {
        console.warn(`[${itemName}] Tooltip not found.`);
    } else {
        // Clean up tooltip HTML if needed (e.g. remove local links or fix paths)
        // poe2db images are CDN links, usually absolute, so it should be fine.
        // But links in text might be relative "/kr/...".
        // We can replace href="/kr/..." with "#" or strict text to avoid navigation.
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
  const items = getItemList();
  console.log(`Found ${items.length} unique items.`);
  
  // Load existing data to avoid re-fetching
  let existingData = {};
  if (fs.existsSync(OUTPUT_FILE)) {
      existingData = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'));
  }

  const results = { ...existingData };
  let updatedCount = 0;

  for (const item of items) {
    if (results[item] && results[item].tooltipHtml) {
        // console.log(`[${item}] Already exists.`);
        continue;
    }

    const data = await fetchItemData(item);
    if (data) {
        results[item] = data;
        updatedCount++;
        // Save intermittently
        if (updatedCount % 5 === 0) {
            fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
            console.log(`Saved progress (${updatedCount} items updated).`);
        }
    }
    
    // Rate limit
    await sleep(800 + Math.random() * 500); 
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
  console.log('Done. All data saved.');
}

run();
