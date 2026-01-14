
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const CURRENCY_TIERS_PATH = path.join(DATA_DIR, 'currency-tiers.json');
const UNIQUES_TIERS_PATH = path.join(DATA_DIR, 'uniques-tiers.json');
const OUTPUT_FILE = path.join(DATA_DIR, 'item-definitions-ko.json');
const BASE_URL = 'https://poe2db.tw/kr';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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
    const urlSlug = itemName.replace(/ /g, '_');
    const url = `${BASE_URL}/${urlSlug}`;
    console.log(`[${itemName}] Requesting: ${url}`);
    const response = await axios.get(url, { validateStatus: status => status < 500 });

    if (response.status === 404) {
      console.warn(`[${itemName}] Not found (404).`);
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
  const allItems = getItemList();
  
  let definitions = {};
  if (fs.existsSync(OUTPUT_FILE)) {
      definitions = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'));
  }

  // Identify targets
  const targets = [];
  
  // 1. Missing items
  for (const item of allItems) {
      if (!definitions[item]) {
          targets.push(item);
      }
  }
  
  // 2. Shards (Force update)
  for (const item of allItems) {
      if (item.includes('Shard') && !targets.includes(item)) {
          targets.push(item);
      }
  }

  console.log(`Targeting ${targets.length} items (Missing + Shards).`);

  for (const item of targets) {
      const data = await fetchItemData(item);
      if (data) {
          definitions[item] = data;
          console.log(`Updated: ${item}`);
      }
      await sleep(500); // polite delay
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(definitions, null, 2));
  console.log('Done. Data saved.');
}

run();
