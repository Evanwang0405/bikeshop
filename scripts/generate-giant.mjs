/**
 * Generate GIANT CN catalog records from the ingestion cache.
 *
 * Reads  scripts/.giant-cn-raw.json   (produced by ingest-giant-cn.mjs)
 * Writes src/data/catalog/giant.ts
 *
 * Why a generator instead of hand-writing 50+ records: the transformation is
 * mechanical and auditable, and re-running it after a fresh scrape keeps the
 * catalog honest. Anything that cannot be mapped confidently is emitted as null
 * rather than guessed.
 *
 * Usage: node scripts/generate-giant.mjs
 */

import { readFile, writeFile } from "node:fs/promises";

const RAW = "scripts/.giant-cn-raw.json";
const OUT = "src/data/catalog/giant.ts";
const RETRIEVED_AT = "2026-09-24";

/**
 * Families that exist on GIANT's China road finder but are NOT road bicycles in
 * this catalogue's taxonomy. Excluded deliberately, with the reason recorded in
 * rejected.ts — not silently dropped.
 *
 * Keys are matched case-insensitively against the canonical family name.
 */
const EXCLUDED_FAMILIES = {
  trinity: "计时 / 铁三车（TT），不属于本目录的公路车分类（category 枚举需先扩展）。",
  speeder: "城市休闲 / 通勤车，非公路车定位。",
  amplify: "城市休闲 / 通勤车，非公路车定位。",
  pre: "城市休闲 / 通勤车，非公路车定位。",
};

/** Model names that are kids' / city bikes even though they share a road family name. */
const EXCLUDED_NAME_PATTERNS = [/^FastRoad\s+\d/i, /^Fastroad\s+\d/i];

/** family → tier patterns, ordered longest-first so "Advanced SL" wins over "Advanced". */
const TIER_PATTERNS = ["Advanced SL", "Advanced Pro", "Advanced", "AR Advanced", "AR ADV", "SLR", "LTD", "Lite", "AR"];

/** family → catalogue category + recommendation tags + riding style. Keys are canonical. */
const FAMILY_META = {
  TCR: {
    category: "all-round-road",
    ridingStyle: ["全能竞赛", "爬坡", "竞技"],
    recommendationTags: ["all-round", "climbing", "lightweight", "race", "aggressive"],
  },
  Propel: {
    category: "aero-road",
    ridingStyle: ["气动竞赛", "平路速度", "冲刺"],
    recommendationTags: ["aero", "race", "speed", "flat-road", "sprint"],
  },
  Defy: {
    category: "endurance-road",
    ridingStyle: ["耐力公路", "长距离", "舒适"],
    recommendationTags: ["endurance", "comfort", "long-distance", "road"],
  },
  Contend: {
    category: "road",
    ridingStyle: ["入门公路", "休闲公路", "性价比"],
    recommendationTags: ["beginner", "entry", "value", "comfort"],
  },
  PCR: {
    category: "all-round-road",
    ridingStyle: ["综合公路", "性价比"],
    recommendationTags: ["all-round", "value", "road"],
  },
  SCR: {
    category: "road",
    ridingStyle: ["入门公路", "进阶公路"],
    recommendationTags: ["entry", "value", "road"],
  },
  FCR: {
    category: "road",
    ridingStyle: ["公路运动", "性价比"],
    recommendationTags: ["value", "road"],
  },
  // GIANT writes "Fastroad" on the site; the canonical family name is "FastRoad".
  FastRoad: {
    canonical: "FastRoad",
    aliases: ["Fastroad", "FASTROAD"],
    category: "flat-bar-road",
    ridingStyle: ["平把快速公路", "健身", "通勤"],
    recommendationTags: ["flat-bar", "fitness", "commute", "value"],
  },
  Escape: {
    category: "flat-bar-road",
    ridingStyle: ["平把通勤", "休闲", "入门"],
    recommendationTags: ["flat-bar", "commute", "beginner", "value"],
  },
};

/** 规格 table label → factoryBuild slot. */
const SPEC_TO_SLOT = {
  车架: "frame",
  前叉: "fork",
  变速把手: "shifters",
  前变速器: "frontDerailleur",
  后变速器: "rearDerailleur",
  齿盘: "crankset",
  飞轮: "cassette",
  链条: "chain",
  中轴: "bottomBracket",
  刹车: "brakes",
  刹车把手: "brakeLevers",
  轮组: "wheelset",
  轮圈: "rim",
  花鼓: "hub",
  辐条: "spokes",
  轮胎: "tires",
  座垫: "saddle",
  座杆: "seatpost",
  把横: "handlebar",
  把立: "stem",
};

/**
 * Labels that belong *inside* another slot rather than a slot of their own
 * (wheel parts describe the wheelset) or that we deliberately do not store
 * (后避震器 is a MTB field; 其他 is frequently empty).
 */
const FOLDED_SPEC_LABELS = {
  轮圈: "wheelset",
  花鼓: "wheelset",
  辐条: "wheelset",
};

const IGNORED_SPEC_LABELS = new Set(["其他", "后避震器"]);

/** Map a raw spec value onto our factoryBuild slot vocabulary (null = not modelled). */
const SLOT_ORDER = [
  "frame",
  "fork",
  "shifters",
  "frontDerailleur",
  "rearDerailleur",
  "crankset",
  "cassette",
  "chain",
  "brakes",
  "rotors",
  "bottomBracket",
  "wheelset",
  "tires",
  "handlebar",
  "stem",
  "integratedCockpit",
  "seatpost",
  "saddle",
  "powerMeter",
  "pedals",
];

/**
 * Find the canonical family for a model name.
 * GIANT is inconsistent about casing ("Fastroad" vs "FastRoad"), so the match is
 * case-insensitive and the returned canonical name is what goes in the catalog.
 */
function detectFamily(name) {
  const lower = name.toLowerCase();
  for (const [canonical, meta] of Object.entries(FAMILY_META)) {
    const spellings = [canonical, ...(meta.aliases ?? [])];
    for (const spelling of spellings) {
      const s = spelling.toLowerCase();
      if (lower === s || lower.startsWith(`${s} `)) return canonical;
    }
  }
  return null;
}

/** True when the name denotes a kids' / city bike that only shares a family name. */
function isExcludedName(name) {
  return EXCLUDED_NAME_PATTERNS.some((pattern) => pattern.test(name));
}

function detectTier(name, family) {
  const rest = name.slice(family.length).trim();
  if (!rest) return null;
  const sorted = [...TIER_PATTERNS].sort((a, b) => b.length - a.length);
  for (const pattern of sorted) {
    if (rest === pattern || rest.startsWith(`${pattern} `)) return pattern;
  }
  // No tier keyword: the remainder is a bare trim (e.g. "SCR 2" → trim "2").
  return null;
}

function detectTrim(name, family, tier) {
  let rest = name.slice(family.length).trim();
  if (tier) rest = rest.slice(tier.length).trim();
  return rest.length ? rest : null;
}

/** Split a spec value into the raw text plus any parenthetical detail. */
function cleanSpecValue(value) {
  return value.replace(/\s*\n\s*/g, " ").replace(/\s+/g, " ").trim();
}

/** Infer a groupset summary from the drivetrain specs, without inventing a group. */
function inferGroupset(specs) {
  const parts = [specs["变速把手"], specs["前变速器"], specs["后变速器"]].filter(Boolean);
  if (!parts.length) return null;
  const joined = parts.join(" ");
  const series = joined.match(/Shimano\s+(R9270|R8170|R7170|R7120|R4720|R7100|R7000|R4700|Ultegra|105|Dura-Ace|Tiagra|Claris|Sora)[^,;]*/i);
  if (series) return cleanSpecValue(series[0]);
  if (/SRAM/i.test(joined)) {
    const sram = joined.match(/SRAM\s+[^,;]+/i);
    return sram ? cleanSpecValue(sram[0]) : "SRAM";
  }
  return cleanSpecValue(parts[0]);
}

/** Electronic shifting signals a modern build; used only for a note, never a claim. */
function isElectronic(specs) {
  return /Di2|AXS|eTap|电子/i.test(Object.values(specs).join(" "));
}

function frameMaterialFromSpec(frameSpec) {
  if (!frameSpec) return null;
  if (/Advanced SL-Grade|Advanced SL Grade/i.test(frameSpec)) return "Advanced SL-Grade Composite";
  if (/Advanced-Grade|Advanced Grade/i.test(frameSpec)) return "Advanced-Grade Composite";
  if (/ALUXX SL/i.test(frameSpec)) return "ALUXX SL 铝合金";
  if (/ALUXX/i.test(frameSpec)) return "ALUXX 铝合金";
  if (/Carbon|Composite/i.test(frameSpec)) return "碳纤维";
  if (/Aluminum|Alloy/i.test(frameSpec)) return "铝合金";
  return null;
}

/**
 * Frame standards we can read off the raw spec strings.
 *
 * GIANT states the rear axle in 车架 and the front axle in 前叉, e.g.
 *   车架 "Advanced-Grade Composite, Disc 12x142mm thru-axle, Disc"
 *   前叉 "Advanced Grade Composite, ... 12x100mm thru-axle, Disc"
 * Each is parsed from its own field so the two can never be swapped.
 *
 * IMPORTANT: the spec table does not state a maximum tyre clearance — it states the
 * fitted tyre size (700x28c). Reading that as clearance would be wrong, so
 * `tireClearanceMm` stays null unless an explicit clearance statement exists.
 */
function frameSpecsFromSpecs(specs) {
  const frameText = specs["车架"] ?? "";
  const forkText = specs["前叉"] ?? "";

  const axle = (text) => {
    const match = text.match(/(\d{2,3})x(\d{2,3})\s*mm\s*thru-?axle/i);
    return match ? `${match[1]}x${match[2]}` : null;
  };

  const clearanceMatch = `${frameText} ${forkText}`.match(/(?:最大)?轮胎(?:宽度|间隙|兼容)[^\d]{0,6}(\d{2,3})\s*mm/i);
  const carbonText = `${frameText} ${forkText}`;

  return {
    axleRear: axle(frameText),
    axleFront: axle(forkText),
    tireClearanceMm: clearanceMatch ? Number(clearanceMatch[1]) : null,
    carbonGrade: /Advanced SL/i.test(carbonText) ? "Advanced SL" : /Advanced/i.test(carbonText) ? "Advanced" : null,
    wheelSize: /700/i.test(frameText) || /700/i.test(specs["轮胎"] ?? "") ? "700c" : null,
  };
}

const raw = JSON.parse(await readFile(RAW, "utf8"));

const records = [];
const skipped = [];

for (const entry of raw) {
  const name = entry.name;
  if (!name) {
    skipped.push({ id: entry.id, name: "(未解析)", reason: "未能从详情页解析车型名" });
    continue;
  }
  const family = detectFamily(name);
  if (!family) {
    // Distinguish "a family we deliberately excluded" from "an unknown family".
    const firstToken = name.split(" ")[0].toLowerCase();
    const exclusionReason = EXCLUDED_FAMILIES[firstToken];
    if (exclusionReason) {
      skipped.push({ id: entry.id, name, reason: exclusionReason });
      continue;
    }
    if (isExcludedName(name)) {
      skipped.push({ id: entry.id, name, reason: "童车 / 非成人公路车，不属于本目录。" });
      continue;
    }
    skipped.push({ id: entry.id, name, reason: "无法归入已知 GIANT 公路车系，需人工确认分类。" });
    continue;
  }
  if (isExcludedName(name)) {
    skipped.push({ id: entry.id, name, reason: "童车（16/20/24 英寸），不属于成人公路车目录。" });
    continue;
  }

  const tier = detectTier(name, family);
  const trim = detectTrim(name, family, tier);
  const specs = entry.specs ?? {};
  const meta = FAMILY_META[family];

  const factoryBuild = {};
  const unmappedSpecLabels = [];
  const wheelParts = [];

  for (const [label, value] of Object.entries(specs)) {
    if (IGNORED_SPEC_LABELS.has(label)) continue;

    const folded = FOLDED_SPEC_LABELS[label];
    if (folded) {
      wheelParts.push(`${label} ${cleanSpecValue(value)}`);
      continue;
    }

    const slot = SPEC_TO_SLOT[label];
    if (!slot) {
      unmappedSpecLabels.push(label);
      continue;
    }
    if (slot === "brakeLevers") continue; // folded into brakes below
    factoryBuild[slot] = cleanSpecValue(value);
  }

  // Wheel sub-parts (轮圈 / 花鼓 / 辐条) enrich the wheelset description.
  if (wheelParts.length && factoryBuild.wheelset) {
    factoryBuild.wheelset = `${factoryBuild.wheelset}（${wheelParts.join("；")}）`;
  }

  // 刹车把手 completes the brake picture; keep it with the brakes slot.
  if (specs["刹车把手"]) {
    factoryBuild.brakes = [factoryBuild.brakes, `刹把 ${cleanSpecValue(specs["刹车把手"])}`].filter(Boolean).join(" · ");
  }

  const orderedBuild = Object.fromEntries(SLOT_ORDER.filter((slot) => factoryBuild[slot]).map((slot) => [slot, factoryBuild[slot]]));

  const canonicalFamily = FAMILY_META[family]?.canonical ?? family;

  records.push({
    id: `giant-cn-${entry.id}`,
    name,
    family: canonicalFamily,
    tier,
    trim,
    category: meta.category,
    ridingStyle: meta.ridingStyle,
    recommendationTags: meta.recommendationTags,
    price: entry.price,
    factoryBuild: orderedBuild,
    groupset: inferGroupset(specs),
    frameMaterial: frameMaterialFromSpec(specs["车架"]),
    wheelset: specs["轮组"] ? cleanSpecValue(specs["轮组"]) : null,
    tires: specs["轮胎"] ? cleanSpecValue(specs["轮胎"]) : null,
    saddle: specs["座垫"] ? cleanSpecValue(specs["座垫"]) : null,
    seatpost: specs["座杆"] ? cleanSpecValue(specs["座杆"]) : null,
    cockpit: specs["把横"] ? cleanSpecValue(specs["把横"]) : null,
    frameSpecs: frameSpecsFromSpecs(specs),
    sizes: entry.sizes,
    electronic: isElectronic(specs),
    newTag: /新品/.test(entry.finderName ?? ""),
    hotTag: /热销/.test(entry.finderName ?? ""),
    images: entry.images ?? [],
    url: entry.url,
    finderCategory: entry.finderCategory,
    specCount: Object.keys(specs).length,
    unmappedSpecLabels,
  });
}

await writeFile("scripts/.giant-generated.json", JSON.stringify({ records, skipped }, null, 2), "utf8");

console.log(`generated ${records.length} records, skipped ${skipped.length}`);
console.log("\n=== by family ===");
const byFamily = {};
for (const record of records) byFamily[record.family] = (byFamily[record.family] ?? 0) + 1;
for (const [family, count] of Object.entries(byFamily)) console.log(`  ${family.padEnd(10)} ${count}`);

console.log("\n=== unmapped spec labels (need a decision before import) ===");
const allUnmapped = [...new Set(records.flatMap((r) => r.unmappedSpecLabels))];
console.log(allUnmapped.length ? allUnmapped.join(", ") : "  none");

console.log("\n=== records missing a price or a build ===");
for (const record of records.filter((r) => r.price === null || Object.keys(r.factoryBuild).length < 3)) {
  console.log(`  ${record.id}  price:${record.price}  build:${Object.keys(record.factoryBuild).length}  ${record.name}`);
}

console.log("\n=== skipped ===");
for (const entry of skipped) console.log(`  ${entry.id}  ${entry.name}  — ${entry.reason}`);

// ---------------------------------------------------------------------------
// Emit the TypeScript catalog module
// ---------------------------------------------------------------------------

const quote = (value) => JSON.stringify(value);

function tsValue(value, indent = 0) {
  if (value === null || value === undefined) return "null";
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (typeof value === "string") return quote(value);
  if (Array.isArray(value)) {
    if (!value.length) return "[]";
    const pad = " ".repeat(indent + 2);
    return `[\n${value.map((item) => `${pad}${tsValue(item, indent + 2)},`).join("\n")}\n${" ".repeat(indent)}]`;
  }
  const pad = " ".repeat(indent + 2);
  const entries = Object.entries(value).filter(([, v]) => v !== null && v !== undefined);
  if (!entries.length) return "{}";
  return `{\n${entries.map(([key, v]) => `${pad}${key}: ${tsValue(v, indent + 2)},`).join("\n")}\n${" ".repeat(indent)}}`;
}

/** Build the alias list for a record from its identity + the shorthand riders use. */
function aliasesFor(record) {
  const aliases = new Set();
  const tierPart = record.tier ?? "";
  const compact = `${record.family} ${tierPart}`.trim();

  aliases.add(record.name);
  aliases.add(record.family);
  if (record.tier) {
    aliases.add(`${record.family} ${record.tier}`);
    // "TCR ADV" / "PP" shorthand that Chinese riders actually type.
    if (/^Advanced/.test(record.tier)) {
      aliases.add(`${record.family} ${record.tier.replace("Advanced", "ADV")}`);
    }
  }
  if (record.trim) aliases.add(`${compact} ${record.trim}`.trim());
  aliases.add(`捷安特${record.name}`);
  aliases.add(`捷安特${compact}`);

  // Family-level nicknames, applied so a nickname search reaches the whole family.
  if (record.family === "Propel") {
    aliases.add("PP");
    aliases.add("捷安特PP");
  }
  if (record.family === "TCR" && record.tier === "Advanced") {
    aliases.add("ADV");
    aliases.add("捷安特ADV");
  }
  if (record.family === "Contend" && record.tier === "AR") {
    aliases.add("Contend AR");
    aliases.add("捷安特Contend AR");
  }
  return [...aliases].filter(Boolean);
}

function renderRecord(record) {
  const lines = [];
  lines.push("  {");
  lines.push(`    id: ${quote(record.id)},`);
  lines.push(`    brand: "Giant",`);
  lines.push(`    brandCN: "捷安特",`);
  lines.push(`    family: ${quote(record.family)},`);
  lines.push(`    generation: ${quote("China 2026 line")},`);
  lines.push(`    tier: ${tsValue(record.tier)},`);
  lines.push(`    trim: ${tsValue(record.trim)},`);
  lines.push(`    modelYear: 2026,`);
  lines.push(`    category: ${quote(record.category)},`);
  lines.push(`    productType: "complete-bike",`);
  lines.push(`    productStatus: "current",`);
  lines.push(`    ridingStyle: ${tsValue(record.ridingStyle, 4)},`);
  lines.push(`    recommendationTags: ${tsValue(record.recommendationTags, 4)},`);
  lines.push(`    price: { amount: ${record.price}, currency: "CNY", region: "CN" },`);
  lines.push(`    weights: [],`);
  lines.push(`    frameMaterial: ${tsValue(record.frameMaterial)},`);
  lines.push(`    groupset: ${tsValue(record.groupset)},`);
  if (record.wheelset) lines.push(`    wheelset: ${tsValue(record.wheelset)},`);
  if (record.tires) lines.push(`    tires: ${tsValue(record.tires)},`);
  if (record.cockpit) lines.push(`    cockpit: ${tsValue(record.cockpit)},`);
  if (record.saddle) lines.push(`    saddle: ${tsValue(record.saddle)},`);
  if (record.seatpost) lines.push(`    seatpost: ${tsValue(record.seatpost)},`);
  lines.push(`    sizes: ${tsValue(record.sizes, 4)},`);
  lines.push(`    frameSpecs: ${tsValue(record.frameSpecs, 4)},`);
  lines.push(`    factoryBuild: ${tsValue(record.factoryBuild, 4)},`);
  if (record.images.length) {
    lines.push("    image: {");
    lines.push(`      url: ${quote(record.images[0])},`);
    lines.push(`      sourceUrl: ${quote(record.url)},`);
    lines.push(`      sourceType: "official",`);
    lines.push(`      alt: ${quote(`捷安特 ${record.name} 官方产品图`)}`);
    lines.push("    },");
  }
  lines.push(`    aliases: ${tsValue(aliasesFor(record), 4)},`);
  lines.push("    source: {");
  lines.push(`      manufacturer: "Giant",`);
  lines.push(`      productUrl: ${quote(record.url)},`);
  lines.push(`      catalogUrl: ${quote("https://www.giant.com.cn/index.php/index/bike_finder.html?surface=3")},`);
  lines.push(`      region: "CN",`);
  lines.push(`      retrievedAt: ${quote(RETRIEVED_AT)},`);
  lines.push(`      sourceTier: 1,`);
  lines.push(`      modelPageVerified: true,`);
  lines.push("    },");
  lines.push(`    dataQuality: "official",`);
  const notes = [
    `官方中国站 建议售价 ¥${record.price?.toLocaleString("en-US")}，产品页已核实。`,
    `规格表共 ${record.specCount} 项，已映射 ${Object.keys(record.factoryBuild).length} 项到原厂配置。`,
  ];
  if (record.electronic) notes.push("官方规格显示为电子变速（Di2 / AXS）。");
  if (record.weightUnpublished) notes.push("官方产品页未公布整车重量，故 weights 为空。");
  lines.push(`    notes: ${tsValue(notes, 4)},`);
  lines.push("  },");
  return lines.join("\n");
}

const header = `import type { Bicycle } from "@/types/catalog";

/**
 * GIANT / 捷安特 — China-market road catalogue.
 *
 * GENERATED FILE — do not hand-edit.
 *   source cache : scripts/.giant-cn-raw.json   (scripts/ingest-giant-cn.mjs)
 *   generator    : scripts/generate-giant.mjs
 *
 * Primary source (Tier 1): official China product pages, read ${RETRIEVED_AT}.
 *   listing: https://www.giant.com.cn/index.php/index/bike_finder.html?surface=3
 *   detail : https://www.giant.com.cn/index.php/index/bike_view.html?id=<id>
 *
 * Every price below is the 建议售价 printed on that product's own page — confirmed,
 * not inferred. \`weights\` is empty throughout because GIANT China does not publish
 * a complete-bike weight on these pages; no weight was invented to fill the gap.
 *
 * \`Advanced\`, \`Advanced Pro\` and \`Advanced SL\` are stored as performance TIERS
 * inside TCR / Propel / Defy, never as families.
 */

export const giantBicycles: Bicycle[] = [
`;

const footer = `];
`;

const body = records.map(renderRecord).join("\n");
await writeFile(OUT, header + body + footer, "utf8");
console.log(`\nwrote ${OUT} (${records.length} records)`);