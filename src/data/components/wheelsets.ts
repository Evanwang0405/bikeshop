import type { AvailabilityType, CatalogPriceRecord, SourceQuality } from "@/types/sourcing";
import { fxReference, noPrice } from "@/types/sourcing";

/**
 * Wheelset catalog.
 *
 * RULES THAT MATTER HERE
 *   · A wheelset weight is a `wheelset` weight, never a bike weight.
 *   · A price may be a China MSRP, a converted foreign MSRP, or a retailer figure.
 *     The `price` record says which, and a converted figure is never labelled as a
 *     China price.
 *   · OEM-only wheels (e.g. Giant ALP30, which ships on factory bikes) get no
 *     fabricated retail price — `priceType: "unknown"` is the correct answer.
 *   · Where a brand sells front and rear as separate SKUs, a displayed range is not
 *     the price of a pair.
 */

export type WheelCategory = "climbing" | "all-round-aero" | "race-aero" | "aero" | "aero-all-round" | "gravel" | "premium-aero";

export type WheelsetEntry = {
  id: string;
  brand: string;
  model: string;
  category: WheelCategory;
  rimDepthFrontMm?: number | null;
  rimDepthRearMm?: number | null;
  /** A single depth is used when front and rear match. */
  depthMm?: number | null;
  internalWidthMm?: number | null;
  weightGrams?: number | null;
  weightTolerancePercent?: number | null;
  price: CatalogPriceRecord;
  availability: AvailabilityType;
  productStatus: "current" | "legacy" | "unknown";
  generation?: string | null;
  modelYear?: number | null;
  sourceQuality?: SourceQuality | null;
  notes?: string[];
};

// ---------------------------------------------------------------------------
// ENVE
// ---------------------------------------------------------------------------

const enve: WheelsetEntry[] = [
  {
    id: "enve-ses-3-4",
    brand: "ENVE",
    model: "SES 3.4",
    category: "all-round-aero",
    rimDepthFrontMm: 39,
    rimDepthRearMm: 43,
    internalWidthMm: 25,
    weightGrams: 1420,
    // Prices are quoted per wheel by ENVE, so the pair figure is a reference the
    // retailer published, not a manufacturer pair MSRP.
    price: {
      rmb: 19127,
      priceType: "retailer-reference",
      sourceCurrency: "USD",
      sourcePrice: 2850,
      note: "前轮 US$1,282.50 + 后轮 US$1,567.50 合计；ENVE 按单只销售，此为一对参考价。",
      confidence: "medium",
    },
    availability: "retail",
    productStatus: "current",
    sourceQuality: "retailer",
    notes: ["ENVE sells front and rear as separate SKUs; a displayed figure is per wheel."],
  },
  {
    id: "enve-ses-4-5-pro",
    brand: "ENVE",
    model: "SES 4.5 Pro",
    category: "race-aero",
    weightGrams: 1295,
    weightTolerancePercent: 3,
    price: fxReference(3750, "USD", { market: "US", confidence: "medium" }),
    availability: "retail",
    productStatus: "current",
    sourceQuality: "manufacturer-global",
    notes: ["重量公差 ±3%。"],
  },
  // Prepared entries — no numeric values until exact current-generation data exists.
  {
    id: "enve-ses-2-3",
    brand: "ENVE",
    model: "SES 2.3",
    category: "climbing",
    weightGrams: null,
    price: noPrice("尚未取得当前世代官方价格数据。"),
    availability: "unknown",
    productStatus: "unknown",
    notes: ["已登记型号，等待确切当前世代数据后再填入数值。"],
  },
  {
    id: "enve-ses-4-5",
    brand: "ENVE",
    model: "SES 4.5",
    category: "all-round-aero",
    weightGrams: null,
    price: noPrice("尚未取得当前世代官方价格数据。"),
    availability: "unknown",
    productStatus: "unknown",
    notes: ["已登记型号，等待确切当前世代数据后再填入数值。"],
  },
  {
    id: "enve-ses-6-7",
    brand: "ENVE",
    model: "SES 6.7",
    category: "race-aero",
    weightGrams: null,
    price: noPrice("尚未取得当前世代官方价格数据。"),
    availability: "unknown",
    productStatus: "unknown",
    notes: ["已登记型号，等待确切当前世代数据后再填入数值。"],
  },
];

// ---------------------------------------------------------------------------
// Roval
// ---------------------------------------------------------------------------

const roval: WheelsetEntry[] = [
  {
    id: "roval-alpinist-clx-iii",
    brand: "Roval",
    model: "Alpinist CLX III",
    category: "climbing",
    weightGrams: 1131,
    rimDepthFrontMm: 33,
    rimDepthRearMm: 33,
    price: fxReference(3198, "EUR", { market: "EU", confidence: "medium" }),
    availability: "retail",
    productStatus: "current",
    sourceQuality: "manufacturer-global",
  },
  {
    id: "roval-rapide-clx-iii",
    brand: "Roval",
    model: "Rapide CLX III",
    category: "aero-all-round",
    weightGrams: 1305,
    rimDepthFrontMm: 51,
    rimDepthRearMm: 48,
    price: fxReference(3498, "EUR", { market: "EU", confidence: "medium" }),
    availability: "retail",
    productStatus: "current",
    sourceQuality: "manufacturer-global",
  },
  {
    id: "roval-rapide-cl-iii",
    brand: "Roval",
    model: "Rapide CL III",
    category: "aero",
    weightGrams: 1555,
    rimDepthFrontMm: 51,
    rimDepthRearMm: 48,
    price: fxReference(1798, "EUR", { market: "EU", confidence: "medium" }),
    availability: "retail",
    productStatus: "current",
    sourceQuality: "manufacturer-global",
  },
  {
    id: "roval-rapide-clx-sprint",
    brand: "Roval",
    model: "Rapide CLX Sprint",
    category: "aero",
    weightGrams: null,
    price: noPrice("尚未取得可核实价格。"),
    availability: "unknown",
    productStatus: "unknown",
  },
  {
    id: "roval-terra-clx-iii",
    brand: "Roval",
    model: "Terra CLX III",
    category: "gravel",
    weightGrams: null,
    price: noPrice("尚未取得可核实价格。"),
    availability: "unknown",
    productStatus: "unknown",
  },
  {
    id: "roval-alpinist-cl",
    brand: "Roval",
    model: "Alpinist CL",
    category: "climbing",
    weightGrams: null,
    price: noPrice("尚未取得可核实价格。"),
    availability: "unknown",
    productStatus: "unknown",
  },
];

// ---------------------------------------------------------------------------
// SCOM
// ---------------------------------------------------------------------------

const scom: WheelsetEntry[] = [
  {
    id: "scom-ultra-40",
    brand: "SCOM",
    model: "Ultra 40",
    category: "climbing",
    depthMm: 40,
    weightGrams: 1320,
    price: noPrice("尚未取得可核实价格。"),
    availability: "unknown",
    productStatus: "unknown",
  },
  {
    id: "scom-ultra-50",
    brand: "SCOM",
    model: "Ultra 50",
    category: "all-round-aero",
    depthMm: 50,
    weightGrams: 1385,
    price: noPrice("尚未取得可核实价格。"),
    availability: "unknown",
    productStatus: "unknown",
  },
  {
    id: "scom-ultra-62",
    brand: "SCOM",
    model: "Ultra 62",
    category: "race-aero",
    depthMm: 62,
    weightGrams: 1500,
    // Retailer figure, not a manufacturer China MSRP.
    price: {
      rmb: 13661,
      priceType: "retailer-reference",
      note: "经销商参考价，不是厂商中国官方建议零售价。",
      confidence: "medium",
    },
    availability: "retail",
    productStatus: "current",
    sourceQuality: "retailer",
  },
];

// ---------------------------------------------------------------------------
// CADEX
// ---------------------------------------------------------------------------

const cadex: WheelsetEntry[] = [
  {
    id: "cadex-max-50",
    brand: "CADEX",
    model: "Max 50",
    category: "premium-aero",
    depthMm: 50,
    weightGrams: 1290,
    price: noPrice("CADEX 在部分市场按单只前轮/后轮销售，未取得成对价格。"),
    availability: "unknown",
    productStatus: "current",
    sourceQuality: "manufacturer",
    notes: [
      "CADEX 在部分市场按单只前轮 / 后轮 SKU 销售。",
      "不要把显示出的价格区间当成一对轮组的价格。",
    ],
  },
];

// ---------------------------------------------------------------------------
// Giant (retail SKUs only; OEM wheels are handled separately)
// ---------------------------------------------------------------------------

const giantWheels: WheelsetEntry[] = [
  {
    id: "giant-slr-1-36",
    brand: "Giant",
    model: "SLR 1 36",
    category: "all-round-aero",
    depthMm: 36,
    weightGrams: null,
    price: noPrice("尚未取得可核实的零售价格。"),
    availability: "both",
    productStatus: "current",
  },
  {
    id: "giant-slr-2-36",
    brand: "Giant",
    model: "SLR 2 36",
    category: "all-round-aero",
    depthMm: 36,
    weightGrams: null,
    price: noPrice("尚未取得可核实的零售价格。"),
    availability: "both",
    productStatus: "current",
  },
  {
    id: "giant-slr-0-40",
    brand: "Giant",
    model: "SLR 0 40",
    category: "race-aero",
    depthMm: 40,
    weightGrams: null,
    price: noPrice("尚未取得可核实的零售价格。"),
    availability: "both",
    productStatus: "current",
  },
  {
    id: "giant-slr-1-40",
    brand: "Giant",
    model: "SLR 1 40",
    category: "race-aero",
    depthMm: 40,
    weightGrams: null,
    price: noPrice("尚未取得可核实的零售价格。"),
    availability: "both",
    productStatus: "current",
  },
  {
    id: "giant-alp30-oem",
    brand: "Giant",
    model: "ALP30",
    category: "all-round-aero",
    depthMm: 30,
    weightGrams: null,
    // ALP30 ships on factory bikes and has no standalone retail product, so there
    // is no retail price to quote.
    price: noPrice("ALP30 为整车配套件，官方没有独立零售商品，因此没有零售价。"),
    availability: "oem",
    productStatus: "current",
  },
];

export const wheelsetEntries: WheelsetEntry[] = [
  ...enve,
  ...roval,
  ...scom,
  ...cadex,
  ...giantWheels,
];

/**
 * Brands the wheel catalog should eventually cover.
 * Declared so the architecture supports them; deliberately WITHOUT invented specs.
 */
export const wheelsetIngestionTargets: string[] = [
  "ENVE", "Roval", "SCOM", "Zipp", "DT Swiss", "CADEX", "Giant", "Reserve",
  "Fulcrum", "Campagnolo", "Vision", "HUNT", "Mavic", "Lightweight", "Shimano",
  "Lún / Winspace", "CRW", "Elitewheels", "Scope", "FFWD", "Newmen",
];

/** Model families named as targets, so a future pass knows what to look for. */
export const wheelsetTargetFamilies: Record<string, string[]> = {
  Zipp: ["303 Firecrest", "353 NSW", "404 Firecrest", "454 NSW"],
  "DT Swiss": ["ARC 1100 DICUT", "ARC 1400 DICUT", "ERC 1100", "ERC 1400", "PRC 1400"],
  Reserve: ["34|37", "40|44", "52|63"],
  "Lún / Winspace": ["HYPER series"],
  Elitewheels: ["Drive series"],
};