import type { Component, ComponentCategory } from "@/types/bike";
import type { CatalogPriceRecord } from "@/types/sourcing";
import type { GroupsetEntry } from "@/data/components/groupsets";
import type { WheelsetEntry } from "@/data/components/wheelsets";
import type { ComponentSeed } from "@/data/components/giant-cadex";
import {
  groupsetEntries,
  wheelsetEntries,
  giantCadexComponents,
} from "@/data/components";

/**
 * Bridges the component catalogs into the Workshop's `Component` shape.
 *
 * WHY A BRIDGE INSTEAD OF A THIRD SHAPE
 * The picker already renders three kinds of row (real OEM parts, sample parts,
 * catalogued components). Teaching it one more render path would mean three places
 * to keep consistent. Instead the catalogs are projected into `Component` and each
 * row carries its own provenance, so the picker stays a single component.
 *
 * WHAT MUST NOT BE LOST IN THE PROJECTION
 *   · the price label (`中国官方建议零售价` vs `经销商参考价` vs `价格未知`)
 *   · the weight definition (a 1420 g wheelset is not a bike weight)
 *   · whether the part is OEM-only and therefore has no standalone price
 */

/** A price caption plus the display kind it should map to. */
function priceFields(price: CatalogPriceRecord): Pick<Component, "price" | "priceBasis" | "priceProvenance"> {
  if (price.rmb === null || price.priceType === "unknown") {
    return { price: 0, priceBasis: "unknown", priceProvenance: "unknown" };
  }
  switch (price.priceType) {
    case "china-msrp":
      return { price: price.rmb, priceBasis: "verified", priceProvenance: "china-msrp" };
    case "fx-converted-reference":
      return { price: price.rmb, priceBasis: "verified", priceProvenance: "foreign-reference" };
    case "retailer-reference":
      return { price: price.rmb, priceBasis: "verified", priceProvenance: "retailer" };
    case "historical":
      return { price: price.rmb, priceBasis: "verified", priceProvenance: "historical" };
    default:
      return { price: price.rmb, priceBasis: "verified", priceProvenance: "retailer" };
  }
}

/**
 * A component with a weight we did not read from a manufacturer page is still a
 * published figure when it came with the seed data, so it is marked `official`.
 * Only genuinely absent weights become `unknown` — never a guess.
 */
function weightFields(grams: number | null | undefined): Pick<Component, "weight" | "weightBasis"> {
  if (!grams || grams <= 0) return { weight: 0, weightBasis: "unknown" };
  return { weight: grams, weightBasis: "official" };
}

const GROUPSET_SPEC_LABELS: Record<string, string> = {
  "2x12": "2x12 速",
  "1x12": "1x12 速",
  "1x13": "1x13 速",
  "2x10": "2x10 速",
  "2x9": "2x9 速",
};

export function groupsetToComponent(entry: GroupsetEntry): Component {
  const spec = entry.spec;
  // A groupset is sold in configurations; the recorded figure must name which one.
  const rmb = spec.priceWithPowerMeterRmb ?? spec.priceWithoutPowerMeterRmb ?? spec.priceRmb ?? null;
  const priceRecord: CatalogPriceRecord = {
    rmb,
    priceType: rmb === null ? "unknown" : (spec.priceType ?? "retailer-reference"),
    note: rmb === null ? "尚未取得可核实价格。" : undefined,
  };
  const grams = spec.weightWithPowerMeterGrams ?? spec.weightWithoutPowerMeterGrams ?? spec.weightGrams ?? null;

  const specifications: Record<string, string> = {
    世代: spec.generation,
    布局: GROUPSET_SPEC_LABELS[spec.layout] ?? spec.layout,
    变速: spec.shifting === "mechanical" ? "机械" : spec.shifting === "electronic" ? "电子（有线）" : "电子（无线）",
    制动: spec.braking === "hydraulic-disc" ? "液压碟刹" : spec.braking === "mechanical-disc" ? "机械碟刹" : "圈刹",
  };
  if (spec.cassette) specifications.飞轮 = spec.cassette;
  if (spec.priceWithPowerMeterRmb) specifications.含功率计价格 = `¥${spec.priceWithPowerMeterRmb.toLocaleString("zh-CN")}`;
  if (spec.priceWithoutPowerMeterRmb) specifications.不含功率计价格 = `¥${spec.priceWithoutPowerMeterRmb.toLocaleString("zh-CN")}`;
  if (spec.requiresUDH) specifications.车架要求 = "需要 UDH 尾勾车架";

  return {
    id: entry.id,
    brand: entry.brand,
    model: `${entry.family} ${spec.generation}`,
    category: "groupset",
    ...priceFields(priceRecord),
    ...weightFields(grams),
    image: "groupset-silver",
    description: `${entry.brand} ${entry.family}（${spec.generation}）${spec.productStatus === "legacy" ? "已停产型号" : "当前在售型号"}。重量取决于配置（牙盘长度、飞轮、碟片、功率计、中轴），对比前请确认配置一致。`,
    specifications,
    compatibility: {
      drivetrainSpeed: Number(spec.layout.replace(/^\d+x/, "")),
      brakeType: spec.braking === "rim" ? "rim" : "disc",
      freehub: spec.shifting === "electronic-wireless" ? "XDR" : "HG",
    },
    dataQuality: spec.productStatus === "legacy" ? "verified" : "official",
    source: {
      manufacturer: entry.brand,
      productUrl: "",
      region: "CN",
      sourceCurrency: "CNY",
      retrievedAt: "2026-09-24",
      sourceTier: 1,
    },
  };
}

export function wheelsetToComponent(entry: WheelsetEntry): Component {
  const front = entry.rimDepthFrontMm ?? entry.depthMm ?? null;
  const rear = entry.rimDepthRearMm ?? entry.depthMm ?? null;
  const depth =
    front === null && rear === null
      ? "深度未公布"
      : front === rear
        ? `${front}mm`
        : `${front ?? "?"}/${rear ?? "?"}mm`;

  const specifications: Record<string, string> = { 轮圈: "碳纤维", 框高: depth };
  if (entry.internalWidthMm) specifications.内宽 = `${entry.internalWidthMm}mm`;
  if (entry.weightTolerancePercent) specifications.重量公差 = `±${entry.weightTolerancePercent}%`;
  if (entry.availability === "oem") specifications.供应 = "OEM 专供（随整车出厂）";

  return {
    id: entry.id,
    brand: entry.brand,
    model: entry.model,
    category: "wheelset",
    ...priceFields(entry.price),
    ...weightFields(entry.weightGrams),
    image: "wheels-carbon",
    description: notesDescription(entry),
    specifications,
    compatibility: { wheelSize: "700c", axleStandard: "12x142" },
    dataQuality: entry.availability === "oem" ? "partial" : "official",
    source: {
      manufacturer: entry.brand,
      productUrl: "",
      region: "CN",
      sourceCurrency: entry.price.sourceCurrency ?? "CNY",
      retrievedAt: "2026-09-24",
      sourceTier: 1,
    },
  };
}

function notesDescription(entry: WheelsetEntry): string {
  const parts = [`${entry.brand} ${entry.model} 轮组。`];
  if (entry.availability === "oem") parts.push("该轮组为 OEM 专供，随整车出厂，官方未公布单独零售价。");
  if (entry.notes?.length) parts.push(entry.notes.join(" "));
  return parts.join(" ");
}

/** Category mapping for the Giant / CADEX component seed. */
const SEED_CATEGORY: Record<ComponentSeed["category"], ComponentCategory> = {
  saddle: "saddle",
  stem: "stem",
  seatpost: "seatpost",
  tire: "tires",
  handlebar: "handlebar",
};

export function seedToComponent(entry: ComponentSeed): Component {
  const specifications: Record<string, string> = {};
  if (entry.material) specifications.材质 = entry.material;
  if (entry.size) specifications.规格 = entry.size;
  if (entry.generation) specifications.世代 = entry.generation;
  if (entry.priceUnit === "each") specifications.计价 = "单只价格";
  if (entry.availability === "oem") specifications.供应 = "OEM 专供（随整车出厂）";

  return {
    id: entry.id,
    brand: entry.brand,
    model: entry.model,
    category: SEED_CATEGORY[entry.category],
    ...priceFields(entry.price),
    ...weightFields(entry.weightGrams),
    image: `swatch-${entry.category}`,
    description: entry.notes?.join(" ") || `${entry.brand} ${entry.model}。`,
    specifications,
    compatibility: entry.category === "tire" ? { wheelSize: "700c", tireWidth: 28 } : {},
    dataQuality: entry.availability === "oem" ? "partial" : "verified",
    source: {
      manufacturer: entry.brand,
      productUrl: "",
      region: "CN",
      sourceCurrency: "CNY",
      retrievedAt: "2026-09-24",
      sourceTier: 1,
    },
  };
}

/**
 * The catalogued-component list handed to the picker, alongside the OEM parts and
 * the sample parts. Legacy groupsets are included on purpose: a 2024 bike may
 * still be built with one, and hiding them would make those builds unbuildable.
 */
export const catalogComponents: Component[] = [
  ...wheelsetEntries.map(wheelsetToComponent),
  ...groupsetEntries.map(groupsetToComponent),
  ...giantCadexComponents.map(seedToComponent),
];

export function catalogComponentStats() {
  return {
    wheelsets: wheelsetEntries.length,
    groupsets: groupsetEntries.length,
    components: giantCadexComponents.length,
    total: catalogComponents.length,
    withPrice: catalogComponents.filter((component) => component.priceBasis === "verified").length,
    withWeight: catalogComponents.filter((component) => component.weightBasis === "official").length,
  };
}

/**
 * Precedence when two sources publish the same component id.
 *
 * Lower rank wins. This exists because ids are not namespaced across sources, so a
 * collision is possible — and the failure mode is quiet and dangerous: the losing
 * record still renders, so a fabricated ¥18,280 sample price can silently replace a
 * sourced ¥11,698 catalog figure.
 *
 *   derived  — an OEM part read off a manufacturer spec table: authoritative for
 *              what a factory bike actually ships with
 *   catalog  — a component with its own identity and provenance
 *   factory  — synthesized from the bicycle the user just loaded: authoritative for
 *              that build, so it outranks a generic catalog entry
 *   sample   — illustrative demo data: never allowed to shadow a real figure
 */
export const SOURCE_RANK = {
  derived: 0,
  factory: 1,
  catalog: 2,
  sample: 3,
} as const;

export type PartSource = keyof typeof SOURCE_RANK;

export type PartSourceReport = {
  total: number;
  /** Same id in two real sources: the ranked winner is used and the rest dropped. */
  collisions: Array<{ id: string; winner: PartSource; losers: PartSource[] }>;
  /** Demo entries dropped because a real source already owns that id. */
  droppedSamples: string[];
  /** Ids duplicated *within* one source, which no precedence rule can resolve. */
  internalDuplicates: Array<{ id: string; source: PartSource; count: number }>;
};

/**
 * Merge the picker's sources into one list, keeping the highest-precedence record
 * for each id.
 *
 * Precedence alone is not enough. A demo record sharing an id with a real one is not
 * a ranking problem — it is a defect that produces two rows for one product, and
 * React will warn about duplicate keys. So a `sample` entry whose id a non-sample
 * source already owns is dropped outright rather than demoted: the row disappears
 * and the id is reported, which is the state the brief asks for ("select products by
 * ID without producing duplicate entries").
 *
 * Within-source duplication cannot be resolved by precedence at all, so it is
 * reported separately and left visible.
 */
export function mergePartSources(sources: Array<[PartSource, Component[]]>): {
  components: Component[];
  report: PartSourceReport;
} {
  const ordered = [...sources].sort((a, b) => SOURCE_RANK[a[0]] - SOURCE_RANK[b[0]]);

  // Ids owned by a real (non-sample) source, so samples can be dropped wholesale.
  const ownedByRealSource = new Set<string>();
  for (const [source, list] of ordered) {
    if (source === "sample") continue;
    for (const component of list) ownedByRealSource.add(component.id);
  }

  const byId = new Map<string, Component>();
  const winnerSourceById = new Map<string, PartSource>();
  const losersById = new Map<string, PartSource[]>();
  const droppedSamples: string[] = [];
  const internalCounts = new Map<string, { source: PartSource; count: number }>();

  for (const [source, list] of ordered) {
    for (const component of list) {
      if (source === "sample" && ownedByRealSource.has(component.id)) {
        droppedSamples.push(component.id);
        continue;
      }
      if (byId.has(component.id)) {
        const winner = winnerSourceById.get(component.id) ?? "sample";
        if (winner === source) {
          // Duplicate inside one source: precedence cannot pick between them.
          const current = internalCounts.get(component.id);
          internalCounts.set(component.id, { source, count: (current?.count ?? 1) + 1 });
        } else {
          losersById.set(component.id, [...(losersById.get(component.id) ?? []), source]);
        }
        continue;
      }
      byId.set(component.id, component);
      winnerSourceById.set(component.id, source);
    }
  }

  return {
    components: [...byId.values()],
    report: {
      total: byId.size,
      collisions: [...losersById.entries()].map(([id, losers]) => ({
        id,
        winner: winnerSourceById.get(id) ?? "sample",
        losers,
      })),
      droppedSamples: [...new Set(droppedSamples)],
      internalDuplicates: [...internalCounts.entries()].map(([id, { source, count }]) => ({ id, source, count })),
    },
  };
}