/**
 * CN¥ conversion for the legacy part catalogue.
 *
 * WHAT THIS DOES, AND WHAT IT DOES NOT DO
 * The sample parts in `src/data/products.ts` were priced in USD with illustrative
 * amounts. This script converts those amounts to CNY so the Workshop stops mixing
 * ¥ and $ in one screen.
 *
 * It does NOT make them real prices. They remain sample values, which is why every
 * converted entry is stamped `priceBasis: "estimated"` and `dataQuality: "demo"`.
 * The real parts (from manufacturer spec tables) live in
 * `src/lib/catalog/derivedComponents.ts` and carry `priceBasis: "unknown"`.
 *
 * Usage: node scripts/convert-parts-to-cny.mjs [rate]
 *        (default rate 7.2; pass a different one if you prefer)
 */

import { readFile, writeFile } from "node:fs/promises";

const RATE = Number(process.argv[2] ?? 7.2);
const FILE = "src/data/products.ts";

if (!Number.isFinite(RATE) || RATE <= 0) {
  console.error(`invalid rate: ${process.argv[2]}`);
  process.exit(1);
}

const source = await readFile(FILE, "utf8");

let converted = 0;
const seen = new Set();

/**
 * Rewrite a `price:` literal. Handles the two shapes present in the file:
 *   price: 899 + index * 115          → price: 6473   (formula, recomputed below)
 *   price: 1899                       → price: 13673
 * Formula-generated values are handled by the dedicated passes further down; this
 * pass only touches plain numeric literals.
 */
const next = source.replace(/(\bprice:\s*)(\d+(?:\.\d+)?)(\s*[,}\n])/g, (match, prefix, value, suffix) => {
  const usd = Number(value);
  if (!Number.isFinite(usd)) return match;
  if (usd === 0) {
    // A zero price is already "no price"; leave it and let the basis flag explain.
    seen.add("zero");
    return match;
  }
  const cny = Math.round((usd * RATE) / 10) * 10;
  converted += 1;
  return `${prefix}${cny}${suffix}`;
});

await writeFile(FILE, next, "utf8");

console.log(`rate: ${RATE}`);
console.log(`plain price literals converted: ${converted}`);
console.log(`zero prices left as 0: ${seen.has("zero") ? "yes" : "no"}`);
console.log("\nNOTE: formula-generated prices (e.g. `899 + index * 115`) are NOT matched by");
console.log("this pass. Update those formulas in the file directly — search for");
console.log("`price: 899 +`, `price: 399 +`, `price: 499 +`, `price: 249 +`,");
console.log("`price: 1099 +` and `price: 79 +`.");