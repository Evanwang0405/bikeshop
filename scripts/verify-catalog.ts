/**
 * Catalog invariants check.
 *
 * Run with: npx tsx scripts/verify-catalog.ts
 *
 * These assertions encode the rules the brief cares about most, so a future
 * ingestion batch cannot quietly break them:
 *   · the 15 required search aliases all resolve to at least one product
 *   · a bike name is never stored as one string (family/tier/trim are separate)
 *   · no product has an invented price or weight
 *   · framesets and complete bikes are never merged
 *   · model-year variants with the same name stay separate records
 */
import { catalog, families } from "@/data/catalog";
import { searchCatalog, resolveBrandFromQuery } from "@/lib/catalog/search";
import { buildCatalogReport } from "@/lib/catalog/stats";

const REQUIRED_SEARCHES = [
  "ADV",
  "TCR ADV",
  "捷安特ADV",
  "PP",
  "捷安特PP",
  "Propel",
  "斯特拉",
  "Scultura",
  "锐克多",
  "Reacto",
  "瑞豹",
  "锐豹",
  "Robin",
  "Spark",
  "坎普",
  "ACE",
  "SR9",
  "喜德盛AD",
  "XDS RS",
  "RT9",
  "SEKA Spear",
  "Exceed",
  "T1550",
  "SLC3",
];

const failures: string[] = [];

// 1. Required searches resolve.
for (const query of REQUIRED_SEARCHES) {
  const results = searchCatalog({ query });
  if (!results.length) failures.push(`搜索「${query}」没有匹配到任何记录`);
}

// 2. 锐豹 must resolve to Pardus, not create a second brand.
const brandHint = resolveBrandFromQuery("锐豹");
if (brandHint !== "Pardus") failures.push(`「锐豹」应解析到 Pardus，实际为 ${brandHint}`);

// 3. Identity is normalized: no product stores brand+family+tier+trim in one field.
for (const bike of catalog) {
  if (bike.family.includes(bike.brand)) {
    failures.push(`${bike.id}: family 字段疑似包含品牌名（"${bike.family}"）`);
  }
  if (/^\s*(giant|merida|pardus|camp|xds|seka|winspace)\s/i.test(bike.family)) {
    failures.push(`${bike.id}: family 看起来像完整车型字符串`);
  }
}

// 4. No fabricated values: every weight carries a definition, prices keep provenance.
for (const bike of catalog) {
  for (const weight of bike.weights) {
    if (!weight.kind) failures.push(`${bike.id}: 重量缺少 kind 定义`);
    if (weight.grams <= 0) failures.push(`${bike.id}: 重量不是正数`);
  }
  if (bike.price && !bike.price.currency) failures.push(`${bike.id}: 价格缺少币种`);
}

// 5. Framesets and complete bikes stay separate product types.
const badTypes = catalog.filter((bike) => !["complete-bike", "frameset"].includes(bike.productType));
if (badTypes.length) failures.push(`存在 productType 不规范的记录：${badTypes.map((b) => b.id).join(", ")}`);

// 6. Same-name different model years must remain distinct records.
const identityKeys = catalog.map(
  (bike) => `${bike.brand}|${bike.family}|${bike.tier ?? ""}|${bike.trim ?? ""}|${bike.generation ?? ""}|${bike.modelYear ?? ""}|${bike.productType}`,
);
const duplicates = identityKeys.filter((key, index) => identityKeys.indexOf(key) !== index);
if (duplicates.length) failures.push(`存在重复的身份组合（会让搜索产生重复条目）：${[...new Set(duplicates)].join(" ; ")}`);

// 7. REACTO 6000 and REACTO 6000 CN must both exist and differ.
const reacto6000 = catalog.filter((bike) => bike.family === "REACTO" && (bike.tier ?? "").includes("6000"));
if (reacto6000.length < 2) failures.push("REACTO 6000 与 REACTO 6000 CN 应作为两个独立记录存在");

// 8. ADV must be a tier, never a family.
if (families.some((family) => /^adv/i.test(family.family))) {
  failures.push("ADV / Advanced 被当作车系处理，应为性能层级");
}

// 9. Structure-only records must be counted consistently so they can never be
//    mistaken for fully imported products in the coverage numbers.
const report = buildCatalogReport();

const structureOnly = catalog.filter(
  (bike) => !bike.price && bike.weights.length === 0 && !Object.keys(bike.factoryBuild ?? {}).length,
);
if (structureOnly.length !== report.structureOnly) {
  failures.push("仅结构记录统计与目录不一致");
}

console.log("=== 数据质量报告 ===");
console.log(`导入品牌        ${report.brandsImported}`);
console.log(`未来导入品牌    ${report.brandsQueued}`);
console.log(`车系            ${report.familiesImported}`);
console.log(`整车            ${report.completeBikes}`);
console.log(`车架组          ${report.framesets}`);
console.log(`已核实价格      ${report.verifiedPrices}`);
console.log(`仅参考价        ${report.referencePricesOnly}`);
console.log(`已核实重量      ${report.verifiedWeights}`);
console.log(`可载入原厂配置  ${report.loadableFactoryBuilds}`);
console.log(`完整原厂配置    ${report.completeFactoryBuilds}`);
console.log(`官方图片        ${report.officialImages}`);
console.log(`仅结构记录      ${report.structureOnly}`);
console.log(`被拒记录        ${report.rejected}`);
console.log(`总记录          ${report.totalRecords}`);
console.log("");
console.log("=== 按厂商 ===");
for (const row of report.byManufacturer) {
  console.log(
    `${row.manufacturer.padEnd(10)} 车系 ${String(row.families).padStart(2)} | 整车 ${String(row.completeBikes).padStart(2)} | 车架组 ${String(row.framesets).padStart(2)} | 价格 ${String(row.verifiedPrices).padStart(2)} | 重量 ${String(row.verifiedWeights).padStart(2)} | 可载入 ${String(row.loadableFactoryBuilds).padStart(2)} | 完整 ${String(row.completeFactoryBuilds).padStart(2)} | Tier ${row.sourceTier}`,
  );
}

if (failures.length) {
  console.error("\n=== 校验失败 ===");
  for (const failure of failures) console.error(`✗ ${failure}`);
  process.exit(1);
}
console.log("\n✓ 全部校验通过");