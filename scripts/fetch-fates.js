const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "../data");
const OUTPUT_FILE = path.join(DATA_DIR, "item-definitions-ko.json");
const BASE_URL = "https://poe2db.tw/kr";
const BASE_URL_EN = "https://poe2db.tw";
const dict = require(path.join(DATA_DIR, "dict.json"));

const TARGETS = ["Cowardly Fate", "Deadly Fate", "Victorious Fate"];

async function fetchItemData(itemName) {
  const urlSlug = itemName.replace(/ /g, "_");
  const url = `${BASE_URL}/${urlSlug}`;
  console.log(`[${itemName}] Requesting: ${url}`);

  const response = await axios.get(url, { validateStatus: (s) => s < 500 });
  if (response.status === 404) {
    console.warn(`[${itemName}] Not found (404)`);
    return null;
  }

  const $ = cheerio.load(response.data);

  let nameKo = $('meta[property="og:title"]').attr("content");
  if (nameKo && nameKo.includes(" - PoE2DB")) {
    nameKo = nameKo.split(" - PoE2DB")[0];
  }
  if (!nameKo) {
    // dict 기반 KO 이름 fallback
    nameKo = dict[itemName] || dict[urlSlug] || null;
  }

  let iconUrl = $('meta[property="og:image"]').attr("content") || null;
  if (!iconUrl) {
    // /kr 페이지에 og:image가 없는 경우가 있어, 영문 페이지에서 아이콘 추출
    const urlEn = `${BASE_URL_EN}/${urlSlug}`;
    const resEn = await axios.get(urlEn, { validateStatus: (s) => s < 500 });
    if (resEn.status !== 404) {
      const $en = cheerio.load(resEn.data);
      iconUrl = $en('meta[property="og:image"]').attr("content") || null;
      if (!iconUrl) {
        // 최후 fallback: HTML 안의 2DItems 경로를 직접 매칭
        const m = String(resEn.data).match(/https:\/\/cdn\.poe2db\.tw\/image\/Art\/2DItems\/[^\s"']+?\.webp/);
        if (m) iconUrl = m[0];
      }
    }
  }

  let tooltipHtml = $(".newItemPopup").first().html();
  if (!tooltipHtml) {
    tooltipHtml = $(".item-popup--poe2").first().html();
  }
  if (tooltipHtml) {
    tooltipHtml = tooltipHtml.replace(/href="\/kr\//g, 'href="https://poe2db.tw/kr/');
  }

  if (!iconUrl) {
    console.warn(`[${itemName}] iconUrl not found`);
  }
  if (!tooltipHtml) {
    console.warn(`[${itemName}] tooltipHtml not found`);
  }

  return {
    nameEn: itemName,
    nameKo: (nameKo || itemName).trim(),
    iconUrl: iconUrl,
    tooltipHtml: tooltipHtml || null,
    fetchedAt: new Date().toISOString(),
  };
}

async function run() {
  let definitions = {};
  if (fs.existsSync(OUTPUT_FILE)) {
    definitions = JSON.parse(fs.readFileSync(OUTPUT_FILE, "utf-8"));
  }

  for (const item of TARGETS) {
    const data = await fetchItemData(item);
    if (data) {
      definitions[item] = data;
      console.log(`[${item}] Updated: icon=${Boolean(data.iconUrl)} tooltip=${Boolean(data.tooltipHtml)}`);
    }
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(definitions, null, 2));
  console.log("Done. item-definitions-ko.json updated.");
}

run().catch((e) => {
  console.error("Failed:", e);
  process.exit(1);
});

