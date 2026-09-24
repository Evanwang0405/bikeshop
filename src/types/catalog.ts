/**
 * Normalized China-market bicycle catalog schema.
 *
 * Design rules (see AGENTS.md / catalog README):
 * - A bicycle NAME is never modelled as one large string. Identity is the tuple
 *   brand + family + tier + trim + modelYear (+ generation when it matters).
 * - `Advanced`, `Advanced Pro`, `Advanced SL` are performance TIERS inside a family,
 *   never families themselves.
 * - Missing values are `null`, never invented. `null` is a first-class value and is
 *   surfaced in the data-quality report.
 * - Every real product preserves its source URL, source tier and retrieval date.
 */

export const bicycleCategories = [
  "road",
  "gravel",
  "endurance-road",
  "aero-road",
  "climbing-road",
  "all-round-road",
  "flat-bar-road",
] as const;

export type BicycleCategory = (typeof bicycleCategories)[number];

export const productTypes = ["complete-bike", "frameset"] as const;
export type ProductType = (typeof productTypes)[number];

export const productStatuses = [
  "current",
  "previous-generation",
  "archived",
  "unknown",
  /**
   * A China figure that exists but is legacy or market-specific. Useful for RS8/RS9
   * style records whose current MSRP cannot be confirmed. Must never be presented
   * as a guaranteed current price.
   */
  "historical-or-market-reference",
] as const;
export type ProductStatus = (typeof productStatuses)[number];

export type DataQuality = "official" | "verified" | "partial";

export type Currency = "CNY" | "USD" | "EUR" | "GBP";

/**
 * EVERYTHING PRICE-RELATED NOW LIVES IN src/types/sourcing.ts.
 *
 * The old shape (`{ amount, currency, region }`) could not express the difference
 * between a China MSRP and a foreign MSRP converted to RMB, and could not say
 * "we have no reliable figure". It was replaced by `CatalogPriceRecord`, which
 * carries a `priceType` and may have `rmb: null`.
 *
 * Re-exported here so existing imports keep working.
 */
export type {
  PriceType,
  CatalogPriceRecord,
  WeightType,
  CatalogWeightRecord,
  SourceQuality,
  Confidence,
  AvailabilityType,
  SourcedValue,
} from "./sourcing";
export { priceTypes, weightTypes, sourceQualities, availabilityTypes, FX_SNAPSHOTS, convertToRmb, fxReference, chinaMsrp, noPrice } from "./sourcing";

import type { CatalogPriceRecord, CatalogWeightRecord } from "./sourcing";

/**
 * Legacy alias kept so records written before the migration still compile while
 * they are being converted. New code should use `CatalogPriceRecord`.
 */
export type CatalogPrice = CatalogPriceRecord;

/**
 * A price seen on a manufacturer page but not confirmed against the exact
 * model + model year + region + trim page.
 */
export type ReferencePrice = CatalogPriceRecord;

/**
 * Data-source priority for China-market bicycles (lower tier wins on conflict).
 * 1. Manufacturer official China product page
 * 2. Manufacturer official global product page
 * 3. Manufacturer official store
 * 4. Authorized official marketplace store
 * 5. Other verified sources, only when unavoidable
 */
export type SourceTier = 1 | 2 | 3 | 4 | 5;

export type CatalogSource = {
  manufacturer: string;
  /** Official page this record was read from. */
  productUrl: string;
  /** Grouping page (family / catalog) the record belongs to. */
  catalogUrl?: string;
  region: string;
  retrievedAt: string;
  sourceTier: SourceTier;
  /** True when only brand/catalog level was checkable, not a model-level page. */
  modelPageVerified: boolean;
};

export type CatalogImage = {
  url: string;
  sourceUrl: string;
  sourceType: "official" | "fallback";
  alt?: string;
};

/**
 * Factory build slots. Every slot is an explicit string or `null`; a complete bike
 * must never collapse into an empty frame.
 */
export type FactoryBuildSlots = {
  frame?: string | null;
  fork?: string | null;
  /**
   * Groupset summary slot. Used when the manufacturer states a groupset as a whole
   * rather than naming each derailleur/shifter individually.
   */
  groupset?: string | null;
  shifters?: string | null;
  frontDerailleur?: string | null;
  rearDerailleur?: string | null;
  crankset?: string | null;
  cassette?: string | null;
  chain?: string | null;
  brakes?: string | null;
  rotors?: string | null;
  bottomBracket?: string | null;
  wheelset?: string | null;
  tires?: string | null;
  handlebar?: string | null;
  stem?: string | null;
  integratedCockpit?: string | null;
  seatpost?: string | null;
  saddle?: string | null;
  powerMeter?: string | null;
  pedals?: string | null;
};

export const factoryBuildSlots = [
  "frame",
  "fork",
  "groupset",
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
] as const satisfies readonly (keyof FactoryBuildSlots)[];

export type FactoryBuild = FactoryBuildSlots;

/** Frame-level standards that the Workshop compatibility engine can consume. */
export type FrameSpecs = {
  carbonGrade?: string | null;
  bottomBracket?: string | null;
  headset?: string | null;
  axleFront?: string | null;
  axleRear?: string | null;
  tireClearanceMm?: number | null;
  seatpostDiameterMm?: number | null;
  hanger?: string | null;
  wheelSize?: string | null;
};

export type Bicycle = {
  id: string;

  brand: string;
  brandCN?: string | null;

  family: string;
  /** Named platform generation, e.g. "CF3 V", "Gen 2", "5th". Never merged casually. */
  generation?: string | null;
  /** Performance tier inside the family, e.g. Advanced / Advanced Pro / Advanced SL. */
  tier?: string | null;
  /** Complete-bike trim, e.g. "2-KOM", "1-Di2", "8000", "105". */
  trim?: string | null;
  modelYear?: number | null;

  category: BicycleCategory;
  productType: ProductType;
  productStatus: ProductStatus;

  /** Free-form positioning words used for display. */
  ridingStyle: string[];
  /** Structured recommendation tags used by the ranking engine. */
  recommendationTags: string[];

  price: CatalogPriceRecord;
  priceNote?: string | null;
  /**
   * A figure that exists but is not the product's confirmed primary price — a
   * retailer listing, or a China figure that is legacy or market-specific.
   *
   * Stored in its own field so it can never be read as `price`. `priceType` on the
   * record says which kind it is.
   */
  referencePrice?: CatalogPriceRecord | null;

  /**
   * Confirmed weights. Each entry states what it measures via `weightType`; a
   * completion-bike weight is never derived from a bare-frame figure.
   */
  weights: CatalogWeightRecord[];
  /**
   * Weights that exist in the brief or an earlier source but could not be confirmed
   * on a product page. Kept separate so the verified-weight count cannot be
   * inflated — the same reason FX reference prices are not China MSRP.
   */
  referenceWeights?: CatalogWeightRecord[] | null;
  /**
   * Why a weight is absent, when that is a deliberate decision rather than an
   * oversight — e.g. the owner confirmed a model must not be estimated.
   */
  weightNote?: string | null;
  frameMaterial?: string | null;
  groupset?: string | null;
  crankset?: string | null;
  cassette?: string | null;
  brakes?: string | null;
  wheelset?: string | null;
  tires?: string | null;
  cockpit?: string | null;
  saddle?: string | null;
  seatpost?: string | null;

  sizes?: string[] | null;

  frameSpecs?: FrameSpecs;

  factoryBuild?: FactoryBuild;

  image?: CatalogImage | null;

  /** Search aliases: abbreviations, pinyin-ish nicknames, common misspellings. */
  aliases: string[];

  source: CatalogSource;
  dataQuality: DataQuality;
  notes?: string[];
};

export type BicycleFamily = {
  brand: string;
  brandCN?: string | null;
  family: string;
  /** Positioned role of the family, independent of price. */
  positioning: string;
  recommendationTags: string[];
  category: BicycleCategory;
  /** Performance tiers in the order the manufacturer presents them. */
  tiers: string[];
  aliases: string[];
  officialUrl: string;
};

export type BrandRecord = {
  name: string;
  nameCN?: string | null;
  officialUrl: string;
  region: string;
  /** Whether this brand has been ingested or is a future ingestion target. */
  status: "ingested" | "ingestion-target";
  focus: boolean;
  notes?: string | null;
};

/** A product considered for import and rejected because the data was insufficient. */
export type RejectedProduct = {
  brand: string;
  label: string;
  reason: string;
  attemptedUrl: string;
  retrievedAt: string;
};