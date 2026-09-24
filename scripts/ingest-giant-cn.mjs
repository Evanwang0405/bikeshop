/**
 * GIANT China ingestion → JSON.
 *
 * The official China site (giant.com.cn) IS server-rendered. Earlier failed
 * attempts only used the wrong URL patterns. Real endpoints:
 *
 *   listing: https://www.giant.com.cn/index.php/index/bike_finder.html?surface=3
 *   detail:  https://www.giant.com.cn/index.php/index/bike_view.html?id=<id>
 *
 * `surface=3` = 铺设路面 ROAD. Detail pages expose 建议售价 (MSRP), the complete
 * 规格 factory build, the frame geometry table and official product photos.
 *
 * Output: scripts/.giant-cn-raw.json — a review cache. Nothing is imported
 * automatically; the checked-in catalog modules are written from this by hand so
 * every field stays deliberate.
 *
 * Usage: node scripts/ingest-giant-cn.mjs
 */

import { writeFile } from "node:fs/promises";

const LISTING_URL = "https://www.giant.com.cn/index.php/index/bike_finder.html?surface=3";
const DETAIL_URL = (id) => `https://www.giant.com.cn/index.php/index/bike_view.html?id=${id}`;
const OUT_FILE = "scripts/.giant-cn-raw.json";

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

/** Flatten HTML into newline-separated text so labels and values are parseable. */
function toText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(tr|div|li|p|h\d)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .split("\n")
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .filter(Boolean)
    .join("\n");
}

/** Road models with a clean name taken from the finder card, not the detail page. */
async function listRoadModels() {
  const html = await getHtml(LISTING_URL);
  const cards = [...html.matchAll(/<a[^>]+href="([^"]*bike_view\.html\?id=(\d+))"[^>]*>([\s\S]*?)<\/a>/gi)];

  const models = [];
  const seen = new Set();
  for (const [, href, id, inner] of cards) {
    if (seen.has(id)) continue;
    const text = toText(inner).replace(/\n/g, " ");
    const category = text.match(/ROAD\s*\/\s*([A-Z][A-Z ]*)/)?.[1]?.trim();
    if (!category) continue;
    seen.add(id);

    const name = text
      .replace(/新品|热销/g, " ")
      .replace(/\s*ROAD\s*\/.*$/i, " ")
      .replace(/\s+/g, " ")
      .trim();

    models.push({
      id,
      name,
      category,
      url: href.startsWith("http") ? href : `https://www.giant.com.cn/${href.replace(/^\//, "")}`,
    });
  }
  return models;
}

/**
 * Parse the 规格 block. It is a series of <table>s, each with a 车架组 /
 * 变速传动系统 / 刹车系统 / 组件 / 轮组 section header and <tr><td>label</td>
 * <td>value</td></tr> rows.
 */
function parseSpecs(html) {
  const block = html.split(/<!--\s*规格 开始\s*-->/)[1]?.split(/<!--\s*规格 结束\s*-->/)[0] ?? "";
  const sections = {};
  const flat = {};

  for (const [, group, body] of block.matchAll(
    /<thead>\s*<tr>\s*<th[^>]*>([\s\S]*?)<\/th>\s*<\/tr>\s*<\/thead>\s*<tbody>([\s\S]*?)<\/tbody>/gi,
  )) {
    const groupName = toText(group).replace(/\n/g, " ").trim();
    const rows = {};
    for (const [, label, value] of body.matchAll(/<tr>\s*<td[^>]*>([\s\S]*?)<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>/gi)) {
      const key = toText(label).replace(/\n/g, " ").trim();
      const raw = toText(value).trim();
      if (!key || !raw) continue;
      rows[key] = raw;
      flat[key] = raw;
    }
    if (Object.keys(rows).length) sections[groupName] = rows;
  }

  return { sections, flat };
}

/**
 * Extract the clean model name straight from the detail page rather than the
 * finder card, whose text is prefixed with the colour options.
 *
 * The detail page renders the model name in <title>-adjacent markup and as the
 * first heading; we take the first line that looks like a model name.
 */
const MODEL_NAME_RE =
  /^(Propel|TCR|Defy|Contend|PCR|SCR|FCR|Fastroad|FastRoad|Escape|Speeder|Amplify|Trinity|PRE|Reign|Anthem)\b[^\n]*$/;

function extractDetailName(text) {
  for (const line of text.split("\n")) {
    const candidate = line.trim();
    if (!MODEL_NAME_RE.test(candidate)) continue;
    // Reject lines that are really colour lists or navigation.
    if (/铺设路面|竞技挑战|同系列|建议售价/.test(candidate)) continue;
    if (candidate.length > 60) continue;
    return candidate
      .replace(/\s*铺设路面.*$/, "")
      .replace(/\s*竞技挑战.*$/, "")
      .trim();
  }
  return null;
}

/**
 * Frame sizes.
 *
 * The geometry *table* is Vue-rendered client-side, so the size list is not in the
 * server HTML. However GIANT's own component spec lines enumerate the sizes, e.g.
 *   stem:      "… Integrated XS:80mm, S:90mm, M:100mm, M/L:110mm, L:110mm, XL:120mm"
 *   crankset:  "… DUB, 48/35 XS:170mm, S:170mm, M:172.5mm, M/L:172.5mm, L:175mm"
 *
 * Reading the sizes from that text is reading the manufacturer's own statement, so
 * it is safe. If no such line exists we return null rather than guess a size range.
 */
const SIZE_TOKEN = String.raw`3XS|2XS|XXS|XS|M\/L|ML|S|M|L|XL|2XL`;
const SIZE_COLON_RE = new RegExp(`(${SIZE_TOKEN})\\s*[:：]`, "g");

function extractSizes(specs) {
  for (const value of Object.values(specs)) {
    const found = [];
    // Reset lastIndex because the regex is global and shared.
    SIZE_COLON_RE.lastIndex = 0;
    let match = SIZE_COLON_RE.exec(value);
    while (match) {
      found.push(match[1]);
      match = SIZE_COLON_RE.exec(value);
    }
    if (found.length >= 3) return [...new Set(found)];
  }
  return null;
}

async function getModelDetail(id, fallbackName = null) {
  const html = await getHtml(DETAIL_URL(id));
  const text = toText(html);

  const detailName = extractDetailName(text);

  const priceRaw = text.match(/建议售价[：:]\s*[￥¥]?\s*([\d,]+(?:\.\d+)?)/)?.[1];
  const price = priceRaw ? Number(priceRaw.replace(/,/g, "")) : null;

  const { sections, flat } = parseSpecs(html);
  const sizes = extractSizes(flat);

  // Prefer product photography from the product-images CDN path.
  const images = [
    ...new Set(
      [...html.matchAll(/https:\/\/giant-images\.oss-cn-shanghai\.aliyuncs\.com\/product\/images\/[^"'\s]+?\.(?:jpg|jpeg|png|webp)/gi)].map(
        (m) => m[0],
      ),
    ),
  ];

  const description = text.split(/\n铺设路面ROAD\n/)[1]?.split("\n查找附近门店")[0]?.trim() ?? null;

  return {
    id,
    url: DETAIL_URL(id),
    name: detailName ?? fallbackName,
    detailName,
    price,
    sizes,
    specs: flat,
    specSections: sections,
    images,
    description,
  };
}

const models = await listRoadModels();
console.log(`${models.length} road models found; fetching detail pages...`);

const records = [];
for (const model of models) {
  try {
    const detail = await getModelDetail(model.id, model.name);
    records.push({ ...detail, finderName: model.name, finderCategory: model.category });
    const specCount = Object.keys(detail.specs).length;
    console.log(
      `${String(model.id).padStart(5)}  ${(detail.price === null ? "未公布" : `¥${detail.price}`).padStart(9)}  specs:${String(specCount).padStart(2)}  img:${String(detail.images.length).padStart(2)}  ${detail.name ?? "?"}`,
    );
  } catch (error) {
    console.warn(`${model.id}  FAILED: ${error.message}`);
  }
}

await writeFile(OUT_FILE, JSON.stringify(records, null, 2), "utf8");
console.log(`\nwrote ${records.length} records to ${OUT_FILE}`);