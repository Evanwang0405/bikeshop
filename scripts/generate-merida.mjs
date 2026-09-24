/**
 * Generate the MERIDA catalog module from the ingestion cache.
 *
 * Reads  scripts/.merida-cn-raw.json  (produced by ingest-merida-cn.mjs)
 * Writes src/data/catalog/merida.ts
 *
 * Why a generator: MERIDA's prices and specs are now machine-read from the
 * official pages, so hand-transcribing them would only add transcription errors.
 * The *identity* decisions (which family/tier/trim/modelYear a product is) are
 * still made deliberately in IDENTITY below, because those cannot be inferred
 * safely from a page title.
 *
 * Usage: node scripts/generate-merida.mjs
 */

import { readFile, writeFile } from "node:fs/promises";

const RAW = "scripts/.merida-cn-raw.json";
const OUT = "src/data/catalog/merida.ts";
const RETRIEVED_AT = "2026-09-24";
const CATALOG_URL = "https://www.merida.cn/zh-tw/bikefinder?category_id=2";

/**
 * Explicit identity for each MERIDA product id.
 *
 * Model identity is `brand + family + [generation] + tier + trim + modelYear`.
 * `generation` is derived from the model-year suffix MERIDA prints (25' = 2025),
 * and — critically — REACTO 6000 25' and REACTO 6000 CN 27' stay separate records.
 */
const IDENTITY = {
  115: { family: "REACTO", tier: "ONE", trim: "ONE", modelYear: 2027, generation: "CF5 V (5th generation)", status: "current" },
  2: { family: "REACTO", tier: "TEAM", trim: "TEAM", modelYear: 2025, generation: "CF5 IV (4th generation)", status: "previous-generation" },
  108: { family: "REACTO", tier: "9000", trim: "9000", modelYear: 2025, generation: "CF5 IV", status: "previous-generation" },
  109: { family: "REACTO", tier: "8000", trim: "8000", modelYear: 2025, generation: "CF3 IV", status: "previous-generation" },
  127: { family: "REACTO", tier: "NT CN", trim: "NT CN", modelYear: 2027, generation: "CF5 (China 2027)", status: "current" },
  126: { family: "REACTO", tier: "6000 CN", trim: "6000 CN", modelYear: 2027, generation: "CF3 (China 2027)", status: "current" },
  110: { family: "REACTO", tier: "6000", trim: "6000", modelYear: 2025, generation: "CF3", status: "previous-generation" },
  107: { family: "REACTO", tier: "5000", trim: "5000", modelYear: 2025, generation: "CF3 IV", status: "previous-generation" },
  106: { family: "REACTO", tier: "4000", trim: "4000", modelYear: 2025, generation: "CF3", status: "previous-generation" },
  103: { family: "REACTO", tier: "1000", trim: "1000", modelYear: 2025, generation: "CF3", status: "previous-generation" },
  22: { family: "SCULTURA", tier: "TEAM", trim: "TEAM", modelYear: 2025, generation: "CF5 V (5th generation)", status: "current" },
  23: { family: "SCULTURA", tier: "6000", trim: "6000", modelYear: 2025, generation: "CF3 V", status: "current" },
  26: { family: "SCULTURA", tier: "600", trim: "600", modelYear: 2025, generation: null, status: "current" },
  87: { family: "SCULTURA", tier: "8000", trim: "8000", modelYear: 2024, generation: "CF3", status: "previous-generation" },
  92: { family: "SCULTURA", tier: "4000", trim: "4000", modelYear: 2024, generation: "CF3 V", status: "previous-generation" },
  84: { family: "SCULTURA", tier: "DISC 1000", trim: "DISC 1000", modelYear: 2024, generation: "CF3", status: "previous-generation" },
  95: { family: "SCULTURA", tier: "CARBON", trim: "CARBON", modelYear: 2024, generation: null, status: "previous-generation" },
  104: { family: "SCULTURA", tier: "95 PLUS", trim: "95 PLUS", modelYear: 2025, generation: null, status: "current" },
  101: { family: "SCULTURA", tier: "93D", trim: "93D", modelYear: 2024, generation: null, status: "previous-generation" },
  105: { family: "SCULTURA", tier: "92", trim: "92", modelYear: 2024, generation: null, status: "previous-generation" },
  63: { family: "SCULTURA ENDURANCE", tier: "6000", trim: "6000", modelYear: 2025, generation: "CF3 II", status: "current" },
  70: { family: "SCULTURA ENDURANCE", tier: "4000", trim: "4000", modelYear: 2025, generation: "CF3 II", status: "current" },
  98: { family: "SILEX", tier: "7000", trim: "7000", modelYear: 2025, generation: "CF2 II", status: "current" },
  90: { family: "SILEX", tier: "700", trim: "700", modelYear: 2025, generation: "LITE II", status: "current" },
  85: { family: "SILEX", tier: "400", trim: "400", modelYear: 2025, generation: "LITE II", status: "current" },
};

/**
 * Weights stated in the brief or in MERIDA's own launch material that are NOT on the
 * product page. Kept in `referenceWeights` so they are visible without inflating the
 * verified-weight count.
 */
const REFERENCE_WEIGHTS = {
  109: [{ grams: 8000, kind: "complete-bike", note: "需求提供的 REACTO 8000 约 8 kg；官方产品页未列整车重量，故仅作参考。" }],
  23: [{ grams: 8200, kind: "complete-bike", size: "M", note: "需求提供的 SCULTURA 6000 约 8.2 kg（M 码）；官方产品页未列整车重量，故仅作参考。" }],
  115: [{ grams: 7400, kind: "complete-bike", size: "M", note: "第五代 REACTO 发布资料标示 REACTO ONE 7.4 kg（M 码）。" }],
};

const FAMILY_META = {
  REACTO: {
    category: "aero-road",
    ridingStyle: ["气动竞赛", "冲刺", "平路高速"],
    recommendationTags: ["aero", "race", "speed", "flat-road", "sprint"],
    aliases: ["REACTO", "Reacto", "锐克多", "美利达锐克多"],
  },
  SCULTURA: {
    category: "all-round-road",
    ridingStyle: ["轻量全能", "爬坡", "竞赛"],
    recommendationTags: ["all-round", "climbing", "lightweight", "race"],
    aliases: ["SCULTURA", "Scultura", "斯特拉", "美利达斯特拉", "str"],
  },
  "SCULTURA ENDURANCE": {
    category: "endurance-road",
    ridingStyle: ["耐力", "舒适", "长距离"],
    recommendationTags: ["endurance", "comfort", "long-distance"],
    aliases: ["SCULTURA ENDURANCE", "Scultura Endurance", "斯特拉耐力", "美利达耐力"],
  },
  SILEX: {
    category: "gravel",
    ridingStyle: ["砾石", "探险", "混合路面"],
    recommendationTags: ["gravel", "adventure", "mixed-surface", "touring"],
    aliases: ["SILEX", "Silex", "西力", "美利达SILEX"],
    productTags: ["gravel"],
  },
};

/** 规格 label → factoryBuild slot. */
const SPEC_TO_SLOT = {
  车架: "frame",
  前叉: "fork",
  变速把手: "shifters",
  前变速器: "frontDerailleur",
  后变速器: "rearDerailleur",
  齿盘: "crankset",
  飞轮: "cassette",
  链条: "chain",
  刹车: "brakes",
  碟盘: "rotors",
  刹车握把: "brakeLevers",
  轮组: "wheelset",
  轮胎: "tires",
  座垫: "saddle",
  座杆: "seatpost",
  手把: "handlebar",
  车把: "handlebar",
  把手: "handlebar",
};

const SLOT_ORDER = [
  "frame", "fork", "groupset", "shifters", "frontDerailleur", "rearDerailleur",
  "crankset", "cassette", "chain", "brakes", "rotors", "bottomBracket",
  "wheelset", "tires", "handlebar", "stem", "integratedCockpit", "seatpost", "saddle",
];

const clean = (value) => value.replace(/\s*\n\s*/g, " ").replace(/\s+/g, " ").trim();

function inferGroupset(specs) {
  const parts = [specs["变速把手"], specs["前变速器"], specs["后变速器"], specs["变速器"]].filter(Boolean);
  if (!parts.length) return null;
  const joined = parts.join(" ");
  const shimano = joined.match(/Shimano\s+(Dura-?Ace|Ultegra|105|Tiagra|Claris|Sora|GRX)[^,;]*/i);
  if (shimano) return clean(shimano[0]);
  const sram = joined.match(/SRAM\s+[^,;]+/i);
  if (sram) return clean(sram[0]);
  return clean(parts[0]);
}

function frameMaterialFrom(frameSpec) {
  if (!frameSpec) return null;
  const text = frameSpec;
  if (/铝合金|ALUXX|LITE/i.test(text)) return `${clean(text)}（铝合金）`;
  if (/CARBON|CF\d|碳纤维/i.test(text)) return `${clean(text)}（碳纤维）`;
  return clean(text);
}

function frameSpecsFrom(specs) {
  const frame = specs["车架"] ?? "";
  const fork = specs["前叉"] ?? "";
  const combined = `${frame} ${fork}`;
  return {
    carbonGrade: /CF5/i.test(combined) ? "CF5" : /CF3/i.test(combined) ? "CF3" : /CF2/i.test(combined) ? "CF2" : null,
    bottomBracket: null,
    axleFront: combined.includes("12x100") ? "12x100" : null,
    axleRear: combined.includes("12x142") ? "12x142" : null,
    // MERIDA states clearance explicitly ("可容纳宽达 35mm"), never as a fitted size.
    tireClearanceMm: Number(combined.match(/(?:宽达|兼容|最大)[^\d]{0,6}(\d{2})\s*mm/i)?.[1] ?? 0) || null,
    wheelSize: "700c",
  };
}

/** Build the alias list from the identity plus the shorthand riders use. */
function aliasesFor(identity, meta) {
  const { family, tier, trim } = identity;
  const set = new Set(meta.aliases);
  const parts = [family, tier, trim].filter(Boolean);
  set.add(parts.join(" "));
  set.add(`${family} ${trim ?? tier ?? ""}`.trim());
  set.add(`美利达${parts.join(" ")}`);
  if (family === "SCULTURA ENDURANCE") {
    set.add("斯特拉耐力");
    set.add("Scultura Endurance");
  }
  return [...set].filter(Boolean);
}

const raw = JSON.parse(await readFile(RAW, "utf8"));

const records = [];
const skipped = [];

for (const entry of raw) {
  const identity = IDENTITY[entry.id];
  if (!identity) {
    skipped.push({ id: entry.id, reason: "无明确身份映射，需人工确认" });
    continue;
  }
  const meta = FAMILY_META[identity.family];
  const specs = entry.specs ?? {};

  const factoryBuild = {};
  for (const [label, value] of Object.entries(specs)) {
    const slot = SPEC_TO_SLOT[label];
    if (!slot || slot === "brakeLevers") continue;
    factoryBuild[slot] = clean(value);
  }
  if (specs["刹车握把"]) {
    factoryBuild.brakes = [factoryBuild.brakes, `刹把 ${clean(specs["刹车握把"])}`].filter(Boolean).join(" · ");
  }
  const ordered = Object.fromEntries(SLOT_ORDER.filter((s) => factoryBuild[s]).map((s) => [s, factoryBuild[s]]));
  if (inferGroupset(specs) && !ordered.groupset) {
    ordered.groupset = inferGroupset(specs);
  }

  records.push({
    id: entry.id,
    identity,
    meta,
    price: entry.price,
    sizes: entry.sizes,
    colors: entry.colors,
    factoryBuild: ordered,
    groupset: inferGroupset(specs),
    frameMaterial: frameMaterialFrom(specs["车架"]),
    wheelset: specs["轮组"] ? clean(specs["轮组"]) : null,
    tires: specs["轮胎"] ? clean(specs["轮胎"]) : null,
    saddle: specs["座垫"] ? clean(specs["座垫"]) : null,
    seatpost: specs["座杆"] ? clean(specs["座杆"]) : null,
    cockpit: specs["手把"] ?? specs["车把"] ?? specs["把手"] ? clean(specs["手把"] ?? specs["车把"] ?? specs["把手"]) : null,
    brakes: specs["刹车"] ? clean(specs["刹车"]) : null,
    crankset: specs["齿盘"] ? clean(specs["齿盘"]) : null,
    cassette: specs["飞轮"] ? clean(specs["飞轮"]) : null,
    frameSpecs: frameSpecsFrom(specs),
    specCount: Object.keys(specs).length,
    images: entry.images ?? [],
    url: entry.url,
  });
}

// ---------------------------------------------------------------------------
// Emit TypeScript
// ---------------------------------------------------------------------------

const quote = (v) => JSON.stringify(v);
function tsValue(value, indent = 0) {
  if (value === null || value === undefined) return "null";
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (typeof value === "string") return quote(value);
  if (Array.isArray(value)) {
    if (!value.length) return "[]";
    const pad = " ".repeat(indent + 2);
    return `[\n${value.map((v) => `${pad}${tsValue(v, indent + 2)},`).join("\n")}\n${" ".repeat(indent)}]`;
  }
  const pad = " ".repeat(indent + 2);
  const entries = Object.entries(value).filter(([, v]) => v !== null && v !== undefined);
  if (!entries.length) return "{}";
  return `{\n${entries.map(([k, v]) => `${pad}${k}: ${tsValue(v, indent + 2)},`).join("\n")}\n${" ".repeat(indent)}}`;
}

const ID_SLUG = (record) =>
  ["merida", record.identity.family, record.identity.tier, record.identity.modelYear]
    .filter(Boolean)
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");

function renderRecord(record) {
  const { identity, meta } = record;
  const rows = [];
  rows.push("  {");
  rows.push(`    id: ${quote(ID_SLUG(record))},`);
  rows.push(`    brand: "Merida",`);
  rows.push(`    brandCN: "美利达",`);
  rows.push(`    family: ${quote(identity.family)},`);
  rows.push(`    generation: ${tsValue(identity.generation)},`);
  rows.push(`    tier: ${tsValue(identity.tier)},`);
  rows.push(`    trim: ${tsValue(identity.trim)},`);
  rows.push(`    modelYear: ${tsValue(identity.modelYear)},`);
  rows.push(`    category: ${quote(meta.category)},`);
  rows.push(`    productType: "complete-bike",`);
  rows.push(`    productStatus: ${quote(identity.status)},`);
  rows.push(`    ridingStyle: ${tsValue(meta.ridingStyle, 4)},`);
  rows.push(`    recommendationTags: ${tsValue(meta.recommendationTags, 4)},`);
  if (record.price === null) {
    rows.push(`    price: null,`);
    rows.push(`    priceNote: "官方产品页未公布建议零售价。",`);
  } else {
    rows.push(`    price: { amount: ${record.price}, currency: "CNY", region: "CN" },`);
  }
  rows.push(`    weights: [],`);
  if (REFERENCE_WEIGHTS[record.id]) {
    rows.push(`    referenceWeights: ${tsValue(REFERENCE_WEIGHTS[record.id], 4)},`);
  }
  rows.push(`    frameMaterial: ${tsValue(record.frameMaterial)},`);
  rows.push(`    groupset: ${tsValue(record.groupset)},`);
  if (record.crankset) rows.push(`    crankset: ${tsValue(record.crankset)},`);
  if (record.cassette) rows.push(`    cassette: ${tsValue(record.cassette)},`);
  if (record.brakes) rows.push(`    brakes: ${tsValue(record.brakes)},`);
  if (record.wheelset) rows.push(`    wheelset: ${tsValue(record.wheelset)},`);
  if (record.tires) rows.push(`    tires: ${tsValue(record.tires)},`);
  if (record.cockpit) rows.push(`    cockpit: ${tsValue(record.cockpit)},`);
  if (record.saddle) rows.push(`    saddle: ${tsValue(record.saddle)},`);
  if (record.seatpost) rows.push(`    seatpost: ${tsValue(record.seatpost)},`);
  rows.push(`    sizes: ${tsValue(record.sizes, 4)},`);
  rows.push(`    frameSpecs: ${tsValue(record.frameSpecs, 4)},`);
  rows.push(`    factoryBuild: ${tsValue(record.factoryBuild, 4)},`);
  if (record.images.length) {
    rows.push("    image: {");
    rows.push(`      url: ${quote(record.images[0])},`);
    rows.push(`      sourceUrl: ${quote(record.url)},`);
    rows.push(`      sourceType: "official",`);
    rows.push(`      alt: ${quote(`美利达 ${identity.family} ${identity.tier ?? ""} 官方产品图`)}`);
    rows.push("    },");
  }
  rows.push(`    aliases: ${tsValue(aliasesFor(identity, meta), 4)},`);
  rows.push("    source: {");
  rows.push(`      manufacturer: "Merida",`);
  rows.push(`      productUrl: ${quote(record.url)},`);
  rows.push(`      catalogUrl: ${quote(CATALOG_URL)},`);
  rows.push(`      region: "CN",`);
  rows.push(`      retrievedAt: ${quote(RETRIEVED_AT)},`);
  rows.push(`      sourceTier: 1,`);
  rows.push(`      modelPageVerified: true,`);
  rows.push("    },");
  rows.push(`    dataQuality: "official",`);
  const notes = [
    record.price === null
      ? "官方产品页未公布建议零售价，保持 null。"
      : `官方中国站 建议零售价 ¥${record.price.toLocaleString("en-US")}，产品页已核实。`,
    `规格表 ${record.specCount} 项，已映射 ${Object.keys(record.factoryBuild).length} 项到原厂配置。`,
    "官方产品页未公布整车重量，故 weights 为空。",
  ];
  if (REFERENCE_WEIGHTS[record.id]) {
    notes.push("存在发布资料/需求提供的重量，已存入 referenceWeights，未计入已核实重量。");
  }
  if (identity.family === "SILEX") notes.push("SILEX 归类为砾石 / 探险平台，不归入普通公路竞赛车系。");
  rows.push(`    notes: ${tsValue(notes, 4)},`);
  rows.push("  },");
  return rows.join("\n");
}

const header = `import type { Bicycle } from "@/types/catalog";

/**
 * MERIDA / 美利达 — China-market road catalogue.
 *
 * GENERATED FILE — do not hand-edit.
 *   source cache : scripts/.merida-cn-raw.json   (scripts/ingest-merida-cn.mjs)
 *   generator    : scripts/generate-merida.mjs
 *
 * Primary source (Tier 1): official China product pages, read ${RETRIEVED_AT}.
 *   listing : https://www.merida.cn/zh-tw/bikefinder?category_id=2
 *   detail  : https://www.merida.cn/zh-tw/bikefinder/bike/<id>/:slug.html
 *
 * Each product page publishes 建议零售价 (MSRP) and a 规格 table, e.g.
 * "建议零售价：59800元". Prices here are read from the product's own page.
 *
 * MODEL-YEAR SEPARATION: REACTO 6000 25' and REACTO 6000 CN 27' are DIFFERENT
 * products and are kept as separate records; the same applies to every 24'/25'/27'
 * pair. \`generation\` records which frame series each belongs to.
 *
 * \`weights\` is empty throughout: MERIDA publishes no complete-bike weight on these
 * pages, and no figure was invented to fill the gap.
 */

export const meridaBicycles: Bicycle[] = [
`;

const footer = `];
`;

await writeFile(OUT, header + records.map(renderRecord).join("\n") + footer, "utf8");

console.log(`generated ${records.length} records, skipped ${skipped.length}`);
console.log(`with verified price: ${records.filter((r) => r.price !== null).length}`);
console.log("\n=== by family ===");
const byFamily = {};
for (const r of records) byFamily[r.identity.family] = (byFamily[r.identity.family] ?? 0) + 1;
for (const [f, n] of Object.entries(byFamily)) console.log(`  ${f.padEnd(20)} ${n}`);
console.log("\n=== no price ===");
for (const r of records.filter((x) => x.price === null)) console.log(`  ${r.id}  ${r.identity.family} ${r.identity.tier}`);
if (skipped.length) {
  console.log("\n=== skipped ===");
  for (const s of skipped) console.log(`  ${s.id}  ${s.reason}`);
}
console.log(`\nwrote ${OUT}`);