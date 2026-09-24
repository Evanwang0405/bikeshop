import type { AvailabilityType, CatalogPriceRecord, SourceQuality } from "@/types/sourcing";
import { noPrice } from "@/types/sourcing";

/**
 * Giant / CADEX component data.
 *
 * NAMING DISCIPLINE
 * `Contact`, `Contact SL`, `Contact SL Aero`, `Contact SLR`, `Contact AeroLight`
 * and `Contact SL AeroLight` are six different products at different price points.
 * They are stored as separate records and must never be merged into one "Contact".
 *
 * OEM items (many Giant cockpits, the ALP30 wheels, SR1 tyres, the D-Fuse alloy
 * seatpost) ship on factory bikes and may have no standalone retail SKU. Those get
 * `availabilityType: "oem"` and no fabricated retail price.
 */

export type ComponentSeed = {
  id: string;
  brand: "Giant" | "CADEX" | "SR" | "Prologo";
  model: string;
  category: "saddle" | "stem" | "seatpost" | "tire" | "handlebar";
  weightGrams?: number | null;
  /** Some prices are per item; a tyre is priced each, not per pair. */
  priceUnit?: "each" | "pair";
  price: CatalogPriceRecord;
  availability: AvailabilityType;
  material?: string | null;
  size?: string | null;
  sizeReference?: string | null;
  generation?: string | null;
  productStatus: "current" | "legacy" | "unknown";
  sourceQuality?: SourceQuality | null;
  notes?: string[];
};

/** A retailer/reference RMB figure, used where no China MSRP is published. */
function referenceRmb(rmb: number, note: string): CatalogPriceRecord {
  return { rmb, priceType: "retailer-reference", note, confidence: "medium" };
}

export const giantCadexComponents: ComponentSeed[] = [
  // ---------------------------------------------------------------- saddles
  {
    id: "giant-fleet-sl",
    brand: "Giant",
    model: "Fleet SL",
    category: "saddle",
    weightGrams: 220,
    price: noPrice("尚未取得可核实价格。"),
    availability: "both",
    productStatus: "current",
    sourceQuality: "manufacturer",
  },
  {
    id: "giant-approach",
    brand: "Giant",
    model: "Approach",
    category: "saddle",
    weightGrams: 310,
    price: referenceRmb(267, "经销商参考价。"),
    availability: "both",
    productStatus: "current",
    sourceQuality: "authorized-retailer",
  },
  {
    id: "cadex-amp",
    brand: "CADEX",
    model: "AMP",
    category: "saddle",
    weightGrams: 129,
    price: referenceRmb(2349, "经销商参考价。"),
    availability: "retail",
    productStatus: "current",
    sourceQuality: "authorized-retailer",
  },
  {
    id: "giant-grit-core",
    brand: "Giant",
    model: "GRIT CORE",
    category: "saddle",
    weightGrams: null,
    price: noPrice("尚未取得可核实价格。"),
    availability: "oem",
    productStatus: "current",
    notes: ["官方产品页未公布重量与零售价格。"],
  },

  // ------------------------------------------------------------------- stems
  // Kept apart from Contact SL / SLR / SL Aero — different products.
  {
    id: "giant-contact-aerolight-stem",
    brand: "Giant",
    model: "Contact AeroLight",
    category: "stem",
    sizeReference: "100mm",
    weightGrams: 190,
    price: referenceRmb(267, "经销商参考价，按 100mm 规格。"),
    availability: "both",
    productStatus: "current",
    sourceQuality: "authorized-retailer",
  },
  {
    id: "giant-contact-sl-stem",
    brand: "Giant",
    model: "Contact SL",
    category: "stem",
    weightGrams: null,
    price: noPrice("尚未取得可核实价格。"),
    availability: "both",
    productStatus: "current",
  },
  {
    id: "giant-contact-slr-stem",
    brand: "Giant",
    model: "Contact SLR",
    category: "stem",
    weightGrams: null,
    price: noPrice("尚未取得可核实价格。"),
    availability: "both",
    productStatus: "current",
  },
  {
    id: "giant-contact-sl-aero-stem",
    brand: "Giant",
    model: "Contact SL Aero",
    category: "stem",
    weightGrams: null,
    price: noPrice("尚未取得可核实价格。"),
    availability: "both",
    productStatus: "current",
  },
  {
    id: "giant-contact-sl-aerolight-stem",
    brand: "Giant",
    model: "Contact SL AeroLight",
    category: "stem",
    weightGrams: null,
    price: noPrice("尚未取得可核实价格。"),
    availability: "both",
    productStatus: "current",
  },

  // --------------------------------------------------------------- seatposts
  {
    id: "giant-variant-2024-tcr",
    brand: "Giant",
    model: "Variant",
    category: "seatpost",
    generation: "2024+ TCR",
    material: "carbon",
    weightGrams: 195,
    price: referenceRmb(1298, "经销商参考价，适用于 2024+ TCR。"),
    availability: "both",
    productStatus: "current",
    sourceQuality: "authorized-retailer",
  },
  {
    id: "giant-d-fuse-alloy",
    brand: "Giant",
    model: "D-Fuse（铝合金）",
    category: "seatpost",
    material: "alloy",
    weightGrams: null,
    // Ships on factory bikes; no standalone retail SKU confirmed.
    price: noPrice("多为整车配套件，未取得独立零售价格。"),
    availability: "oem",
    productStatus: "current",
    notes: ["不要为 OEM 件编造零售价格。"],
  },

  // ------------------------------------------------------------------- tyres
  {
    id: "cadex-race-gc-700x28",
    brand: "CADEX",
    model: "Race GC",
    category: "tire",
    size: "700x28",
    weightGrams: 279,
    priceUnit: "each",
    price: referenceRmb(671, "经销商参考价，单条价格。"),
    availability: "retail",
    productStatus: "current",
    sourceQuality: "authorized-retailer",
    notes: ["价格为单条，不是一对。"],
  },
  {
    id: "giant-sr1-700x28",
    brand: "Giant",
    model: "SR1",
    category: "tire",
    size: "700X28C",
    weightGrams: null,
    priceUnit: "each",
    // Frequently an OEM fitment; no confirmed retail price.
    price: noPrice("多为整车配套件，未取得独立零售价格。"),
    availability: "oem",
    productStatus: "current",
  },
  {
    id: "giant-gavia-course-1",
    brand: "Giant",
    model: "Gavia COURSE 1",
    category: "tire",
    size: "700x25/28c",
    weightGrams: null,
    priceUnit: "each",
    price: noPrice("多为整车配套件，未取得独立零售价格。"),
    availability: "both",
    productStatus: "current",
  },

  // -------------------------------------------------------------- handlebars
  {
    id: "giant-contact-handlebar",
    brand: "Giant",
    model: "Contact",
    category: "handlebar",
    weightGrams: null,
    price: noPrice("尚未取得可核实价格。"),
    availability: "both",
    productStatus: "current",
  },
  {
    id: "giant-contact-sl-handlebar",
    brand: "Giant",
    model: "Contact SL",
    category: "handlebar",
    weightGrams: null,
    price: noPrice("尚未取得可核实价格。"),
    availability: "both",
    productStatus: "current",
  },
  {
    id: "giant-contact-slr-handlebar",
    brand: "Giant",
    model: "Contact SLR",
    category: "handlebar",
    weightGrams: null,
    price: noPrice("尚未取得可核实价格。"),
    availability: "both",
    productStatus: "current",
  },
];

/**
 * Names that look similar but are distinct products. Kept as an explicit guard so
 * a future edit cannot collapse them into one record.
 */
export const contactDistinctProducts = [
  "Contact",
  "Contact SL",
  "Contact SL Aero",
  "Contact SLR",
  "Contact AeroLight",
  "Contact SL AeroLight",
] as const;

export { noPrice };