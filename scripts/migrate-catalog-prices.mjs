/**
 * Migrate the catalog data files from the old price/weight shape to the new
 * provenance-aware one.
 *
 * OLD price            →  NEW price
 * { amount, currency, region }        { rmb, priceType, sourceCurrency, market, ... }
 * weight { grams, kind: "X" }         { grams, weightType: "X" }
 *
 * Runs as a purely textual rewrite over the generated + hand-written catalog
 * modules so no value is retyped by hand. Idempotent: already-migrated literals are
 * left alone, which is what makes it safe to re-run.
 *
 * Usage: node scripts/migrate-catalog-prices.mjs
 */

import { readFile, writeFile } from "node:fs/promises";

const FILES = [
  "src/data/catalog/camp.ts",
  "src/data/catalog/giant.ts",
  "src/data/catalog/giant-framesets.ts",
  "src/data/catalog/merida.ts",
  "src/data/catalog/pardus.ts",
  "src/data/catalog/seka.ts",
  "src/data/catalog/winspace.ts",
  "src/data/catalog/xds.ts",
];

/**
 * Old enum names → new enum names.
 * `unpainted-frame` and `frame-with-fork` are gone: they were never used, and
 * `bare-frame` + `paintIncluded: false` says the same thing without a second name.
 */
const WEIGHT_TYPE_MAP = {
  "complete-bike": "complete-bike",
  "bare-frame": "bare-frame",
  "unpainted-frame": "bare-frame",
  "frame-with-fork": "frameset",
  frameset: "frameset",
  frame: "frame",
  wheelset: "wheelset",
  groupset: "groupset",
  component: "component",
};

function mapWeightKind(value) {
  return WEIGHT_TYPE_MAP[value] ?? value;
}

let totalPrices = 0;
let totalReferences = 0;
let totalWeights = 0;
const report = [];

for (const file of FILES) {
  let source;
  try {
    source = await readFile(file, "utf8");
  } catch {
    continue;
  }
  const before = source;

  // ------------------------------------------------------------------ prices
  // `price: { amount: 17800, currency: "CNY", region: "CN" },`
  // A CNY amount is a China MSRP. A USD amount is a manufacturer MSRP in its own
  // currency and is NOT a China price — `priceType` records that distinction.
  source = source.replace(
    /(\n\s*)(price|referencePrice): \{\s*amount: ([\d.]+),\s*currency: "(CNY|USD|EUR|GBP)",\s*region: "([A-Za-z]+)",?\s*\}/g,
    (match, indent, field, amount, currency, region) => {
      const priceType = currency === "CNY" ? "china-msrp" : "manufacturer-msrp";
      if (field === "price") totalPrices += 1;
      else totalReferences += 1;
      return (
        `${indent}${field}: { rmb: ${amount}, priceType: "${priceType}", ` +
        `sourceCurrency: "${currency}", market: "${region}" }`
      );
    },
  );

  // referencePrice that also carried a note:
  // `referencePrice: { amount: N, currency: "CNY", region: "CN", note: NOTE },`
  source = source.replace(
    /(\n\s*)referencePrice: \{\s*amount: ([\d.]+),\s*currency: "(CNY|USD|EUR|GBP)",\s*region: "([A-Za-z]+)",\s*note: ([^}]+?)\s*\}/g,
    (match, indent, amount, currency, region, note) => {
      totalReferences += 1;
      const priceType = currency === "CNY" ? "historical" : "fx-converted-reference";
      return (
        `${indent}referencePrice: { rmb: ${amount}, priceType: "${priceType}", ` +
        `sourceCurrency: "${currency}", market: "${region}", note: ${note.trim()} }`
      );
    },
  );

  // A null price becomes an explicit "no reliable figure" record, so the UI has
  // something to explain rather than a bare null.
  source = source.replace(
    /(\n\s*)price: null,(\s*\n\s*)priceNote: ("[^"]*"|[A-Za-z_$][\w$]*),/g,
    (match, indent, gap, note) =>
      `${indent}price: { rmb: null, priceType: "unknown", note: ${note} },`,
  );

  // ----------------------------------------------------------------- weights
  // `kind: "complete-bike",` → `weightType: "complete-bike",`
  source = source.replace(/(\n\s*)kind: "([a-z-]+)",/g, (match, indent, kind) => {
    totalWeights += 1;
    return `${indent}weightType: "${mapWeightKind(kind)}",`;
  });

  if (source !== before) {
    await writeFile(file, source, "utf8");
    report.push(file);
  }
}

console.log(`migrated ${report.length} files`);
console.log(`  price literals rewritten:      ${totalPrices}`);
console.log(`  referencePrice literals:        ${totalReferences}`);
console.log(`  weight kind → weightType:       ${totalWeights}`);
for (const file of report) console.log(`  · ${file}`);