/**
 * MERIDA China ingestion → JSON.
 *
 * CORRECTION: I previously recorded MERIDA prices as unavailable. That was wrong.
 * The *catalogue* page lists no prices, but each individual product page publishes
 * 建议零售价, e.g. "建议零售价：59800元". I had only read the catalogue.
 *
 * Real endpoints:
 *   listing (road): https://www.merida.cn/zh-tw/bikefinder?category_id=2
 *   detail:         https://www.merida.cn/zh-tw/bikefinder/bike/<id>/:slug.html
 *
 * Output: scripts/.merida-cn-raw.json
 *
 * Usage: node scripts/ingest-merida-cn.mjs
 */

import { writeFile } from "node:fs/promises";

const DETAIL_URL = (id) => `https://www.merida.cn/zh-tw/bikefinder/bike/${id}/:slug.html`;
const OUT_FILE = "scripts/.merida-cn-raw.json";

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
  "Accept-Language": "zh-CN,zh;q=0.9",
};

async function getHtml(url) {
  const response = await fetch(url, { headers: HEADERS });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.text();
}

function toText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(tr|div|li|p|h\d)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .split("\n")
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .filter(Boolean)
    .join("\n");
}

/**
 * MERIDA road families, by the category_id of their official finder pages.
 * The ROAD index paginates at 12 items, so the per-family pages are used to
 * enumerate every model reliably.
 */
const FAMILY_PAGES = [
  { categoryId: 91, family: "REACTO" },
  { categoryId: 92, family: "SCULTURA" },
  { categoryId: 23, family: "SCULTURA ENDURANCE" },
  { categoryId: 104, family: "SILEX" },
];
const FAMILY_URL = (categoryId) => `https://www.merida.cn/zh-tw/bikefinder?category_id=${categoryId}`;

/** Every road bike id across all family pages, with its model-year suffix. */
async function listRoadBikes() {
  const bikes = [];
  const seen = new Set();

  for (const page of FAMILY_PAGES) {
    const html = await getHtml(FAMILY_URL(page.categoryId));
    // Cards carry a /bikefinder/bike/<id>/ link and a model name with a year suffix
    // such as `SCULTURA 6000 25‘` or `REACTO 6000 CN 27‘`.
    for (const [, id] of html.matchAll(/bikefinder\/bike\/(\d+)\//gi)) {
      if (seen.has(id)) continue;
      seen.add(id);

      // Read the model name from a window of markup around the id.
      const window = html.slice(Math.max(0, html.indexOf(`/bike/${id}/`) - 600), html.indexOf(`/bike/${id}/`) + 600);
      const nameMatch = window.match(
        /(REACTO(?:\s+(?:ONE|TEAM|NT CN|CN|\d{4}))?|SCULTURA(?:\s+ENDURANCE)?(?:\s+(?:TEAM|DISC \d+|\d{3,4}))?|SILEX\s+\d{3,4})[^'’′]{0,12}?(\d{2})\s*['’′]/i,
      );
      const modelYearSuffix = nameMatch ? Number(nameMatch[2]) : null;
      const name = nameMatch ? `${nameMatch[1].trim()} ${nameMatch[2]}'` : `${page.family} (id ${id})`;

      bikes.push({
        id,
        name: name.replace(/\s+/g, " ").trim(),
        family: page.family,
        // MERIDA writes 25' for the 2025 model year; 2000 + suffix.
        modelYear: modelYearSuffix ? 2000 + modelYearSuffix : null,
      });
    }
  }
  return bikes;
}

async function getBikeDetail(id) {
  const html = await getHtml(DETAIL_URL(id));
  const text = toText(html);

  const priceRaw = text.match(/建议零售价[：:]\s*([\d,]+(?:\.\d+)?)\s*元/)?.[1];
  const price = priceRaw ? Number(priceRaw.replace(/,/g, "")) : null;

  // The spec block is a run of "标签 值" lines between 规格 and the next section.
  const specKeys = [
    "车架", "前叉", "变速把手", "前变速器", "后变速器", "刹车", "碟盘", "刹车握把",
    "齿盘", "飞轮", "链条", "手把", "车把", "把手", "座垫", "座杆", "轮组", "轮胎", "速别",
  ];
  const specs = {};
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i += 1) {
    const key = specKeys.find((candidate) => lines[i] === candidate || lines[i].startsWith(`${candidate} `));
    if (!key) continue;
    const inline = lines[i].slice(key.length).trim();
    const value = inline || lines[i + 1]?.trim() || "";
    if (value && !specKeys.includes(value) && value.length < 120) specs[key] = value;
  }

  const sizesRaw = text.match(/车架尺寸\s*([\dA-Za-z3XSLM,\s/]+)/)?.[1];
  const sizes = sizesRaw
    ? sizesRaw.split(/[,，]/).map((s) => s.trim()).filter((s) => s && s.length <= 5)
    : null;

  const colorsRaw = text.match(/车色\s*([^\n]+)/)?.[1];
  const colors = colorsRaw ? colorsRaw.split(/[、,，]/).map((c) => c.trim()).filter(Boolean) : null;

  const images = [
    ...new Set([...html.matchAll(/https:\/\/[^"'\s]*merida[^"'\s]*?\.(?:jpg|jpeg|png|webp)/gi)].map((m) => m[0])),
  ];

  return { id, url: DETAIL_URL(id), price, sizes, colors, specs, images };
}

const bikes = await listRoadBikes();
console.log(`${bikes.length} road bikes listed; fetching detail pages...`);

const records = [];
for (const bike of bikes) {
  try {
    const detail = await getBikeDetail(bike.id);
    records.push({ ...bike, ...detail });
    const specCount = Object.keys(detail.specs).length;
    console.log(
      `${String(bike.id).padStart(4)}  ${(detail.price === null ? "未公布" : `¥${detail.price}`).padStart(9)}  specs:${String(specCount).padStart(2)}  img:${String(detail.images.length).padStart(2)}  ${bike.name}`,
    );
  } catch (error) {
    console.warn(`${bike.id}  FAILED: ${error.message}`);
  }
}

await writeFile(OUT_FILE, JSON.stringify(records, null, 2), "utf8");

const withPrice = records.filter((r) => r.price !== null).length;
console.log(`\nwrote ${records.length} records to ${OUT_FILE}`);
console.log(`with a verified price: ${withPrice} / ${records.length}`);