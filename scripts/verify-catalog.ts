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
 *   · a converted foreign price is never labelled a China MSRP
 *   · a bare-frame weight is never stored as a complete-bike weight
 *   · an OEM-only part never carries a retail price it does not publish
 */
import { catalog, families } from "@/data/catalog";
import { searchCatalog, resolveBrandFromQuery } from "@/lib/catalog/search";
import { buildCatalogReport } from "@/lib/catalog/stats";
import { derivedComponents, derivedComponentStats } from "@/lib/catalog/derivedComponents";
import { catalogComponents, mergePartSources } from "@/lib/catalog/componentAdapters";
import { products } from "@/data/products";
import {
  componentCatalog,
  groupsetCatalog,
  wheelsetCatalog,
  drivetrainSkus,
  exactBrakeGroups,
  wheelsetIngestionTargets,
} from "@/data/components";
import { priceTypes, weightTypes, availabilityTypes } from "@/types/sourcing";

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
    if (!weightTypes.includes(weight.weightType)) {
      failures.push(`${bike.id}: 重量缺少合法的 weightType（实际为 ${weight.weightType}）`);
    }
    if (weight.grams <= 0) failures.push(`${bike.id}: 重量不是正数`);
  }
  if (!priceTypes.includes(bike.price.priceType)) {
    failures.push(`${bike.id}: 价格缺少合法的 priceType（实际为 ${bike.price.priceType}）`);
  }
  // A price only exists if it has a number; a number only exists if it has a type.
  if (bike.price.rmb !== null && bike.price.priceType === "unknown") {
    failures.push(`${bike.id}: 有价格数值却标记为 unknown`);
  }
  if (bike.price.rmb === null && bike.price.priceType !== "unknown") {
    failures.push(`${bike.id}: 标记为 ${bike.price.priceType} 却没有价格数值`);
  }
}

// 4a. A converted foreign price must never masquerade as a China MSRP.
for (const bike of catalog) {
  for (const price of [bike.price, bike.referencePrice].filter(Boolean)) {
    if (!price) continue;
    if (!priceTypes.includes(price.priceType)) {
      failures.push(`${bike.id}: 参考价 priceType 非法（${price.priceType}）`);
    }
    if (price.priceType === "china-msrp" && price.sourceCurrency && price.sourceCurrency !== "CNY") {
      failures.push(`${bike.id}: 非人民币来源被标记为中国官方建议零售价`);
    }
    if (price.priceType === "fx-converted-reference" && !price.fxDate) {
      failures.push(`${bike.id}: 折算参考价缺少汇率日期`);
    }
  }
}

// 4b. A weight label must match the weight it describes. A bare frame is not a bike.
const FRAME_ONLY_TYPES = ["bare-frame", "unpainted-frame", "frame", "frameset"];
for (const bike of catalog) {
  for (const weight of bike.weights) {
    if (bike.productType === "complete-bike" && FRAME_ONLY_TYPES.includes(weight.weightType)) {
      failures.push(`${bike.id}: 整车记录把${weight.weightType}当作整车重量`);
    }
    if (weight.weightType === "complete-bike" && bike.productType === "frameset") {
      failures.push(`${bike.id}: 车架组记录带有整车重量`);
    }
  }
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
// 10. Derived part ids must be unique, or React renders duplicate keys and the
//     picker shows the same part twice.
const partIds = derivedComponents.map((component) => component.id);
const duplicatePartIds = [...new Set(partIds.filter((id, index) => partIds.indexOf(id) !== index))];
if (duplicatePartIds.length) {
  failures.push(`原厂零件存在重复 id：${duplicatePartIds.slice(0, 5).join(", ")}`);
}

// 11. No part may claim a price or weight we do not have. OEM parts carry no
//     published price/weight, and sample parts must be labelled as such.
for (const component of derivedComponents) {
  if (component.price !== 0 || component.weight !== 0) {
    failures.push(`原厂件 ${component.id} 带有未经核实的价格或重量`);
  }
  if (component.priceBasis !== "unknown" || component.weightBasis !== "unknown") {
    failures.push(`原厂件 ${component.id} 的来源标记应为 unknown`);
  }
}
for (const component of products) {
  if (!component.priceBasis || !component.weightBasis) {
    failures.push(`示例零件 ${component.id} 缺少 priceBasis / weightBasis`);
  }
}

// 12. Component catalogs: ids unique per catalog, no OEM-only part with a retail price.
const catalogIdGroups: Array<[string, { id: string; availability?: string; price?: { rmb: number | null; priceType: string } }[]]> = [
  ["套件", groupsetCatalog.map((entry) => ({ id: entry.id, availability: entry.spec.availability, price: entry.spec.price }))],
  ["轮组", wheelsetCatalog.map((entry) => ({ id: entry.id, availability: entry.availability, price: entry.price }))],
  ["零件", componentCatalog.map((entry) => ({ id: entry.id, availability: entry.availability, price: entry.price }))],
];
for (const [label, entries] of catalogIdGroups) {
  const ids = entries.map((entry) => entry.id);
  const dupes = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
  if (dupes.length) failures.push(`${label}目录存在重复 id：${dupes.slice(0, 5).join(", ")}`);
  for (const entry of entries) {
    if (entry.availability && !availabilityTypes.includes(entry.availability as (typeof availabilityTypes)[number])) {
      failures.push(`${label} ${entry.id}: availability 非法`);
    }
    if (entry.availability === "oem" && entry.price && entry.price.rmb !== null) {
      failures.push(`${label} ${entry.id}: OEM 专供件不应带有零售价`);
    }
    if (entry.price && entry.price.rmb === null && entry.price.priceType !== "unknown") {
      failures.push(`${label} ${entry.id}: 无价格数值却标记为 ${entry.price.priceType}`);
    }
  }
}

// 13. 11-34, 11-36 and a 50/34 crank are three different SKUs. Merging them would
//     silently change the spec of every bike that uses one.
if (drivetrainSkus.length < 3) failures.push("105 传动 SKU 数量不足，疑似被合并");

// 13a. The part picker merges four sources, so an id owned by two of them renders the
//      same product twice. A "sample" id that a real source also owns is worse still:
//      it is a defect that can leave a fabricated price visible. Both must be zero.
const merged = mergePartSources([
  ["derived", derivedComponents],
  ["factory", []],
  ["catalog", catalogComponents],
  ["sample", products],
]);
if (merged.report.internalDuplicates.length) {
  failures.push(
    `同一来源内部存在重复零件 id：${merged.report.internalDuplicates
      .slice(0, 5)
      .map((entry) => `${entry.id}（${entry.source} ×${entry.count}）`)
      .join(", ")}`,
  );
}
if (merged.report.collisions.length) {
  failures.push(
    `不同来源之间存在零件 id 冲突：${merged.report.collisions
      .slice(0, 5)
      .map((entry) => `${entry.id}（${entry.winner} 取代 ${entry.losers.join("/")}）`)
      .join(", ")}`,
  );
}
if (merged.report.droppedSamples.length) {
  failures.push(
    `示例零件与真实零件 id 重复（已丢弃示例条目，但仍应改名）：${merged.report.droppedSamples.slice(0, 5).join(", ")}`,
  );
}

// 14. Braking is modelled as shifter + caliper + rotor, not one ambiguous part.
for (const group of exactBrakeGroups) {
  if (!group.shifterBrakeLever || !group.caliper) {
    failures.push(`制动组 ${group.id}: 缺少手变或卡钳`);
  }
}

// 15. The ingestion target list must stay declared so coverage can be reported
//     honestly rather than claimed.
if (wheelsetIngestionTargets.length < 10) failures.push("轮组导入目标品牌列表过短");

const report = buildCatalogReport();

const structureOnly = catalog.filter(
  (bike) => bike.price.rmb === null && bike.weights.length === 0 && !Object.keys(bike.factoryBuild ?? {}).length,
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

const parts = derivedComponentStats();
console.log("");
console.log("=== 零件来源 ===");
console.log(`原厂件（来自官方规格表） ${parts.total}`);
console.log(`  覆盖整车            ${parts.bikesCovered}`);
console.log(`示例零件（标注 demo）    ${products.length}`);
console.log(`套件目录              ${groupsetCatalog.length}`);
console.log(`轮组目录              ${wheelsetCatalog.length}`);
console.log(`零件目录              ${componentCatalog.length}`);
console.log(`传动 SKU              ${drivetrainSkus.length}`);
console.log(`制动组                ${exactBrakeGroups.length}`);
console.log(`轮组导入目标品牌      ${wheelsetIngestionTargets.length}`);
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