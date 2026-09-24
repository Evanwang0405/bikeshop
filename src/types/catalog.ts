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

export const productStatuses = ["current", "previous-generation", "archived", "unknown"] as const;
export type ProductStatus = (typeof productStatuses)[number];

export type DataQuality = "official" | "verified" | "partial";

export type Currency = "CNY" | "USD" | "EUR";

export type CatalogPrice = {
  amount: number;
  currency: Currency;
  region: string;
};

/**
 * A price seen on a manufacturer page but not confirmed against the exact
 * model + model year + region + trim page. Kept separate so it can never be
 * silently promoted to a verified price.
 */
export type ReferencePrice = {
  amount: number;
  currency: Currency;
  region: string;
  /** Why this is not treated as verified. */
  note: string;
};

export const weightKinds = [
  "complete-bike",
  "bare-frame",
  "unpainted-frame",
  "frame-with-fork",
  "frameset",
] as const;

export type WeightKind = (typeof weightKinds)[number];

/**
 * A weight must always carry the definition it was measured under. A bare-frame
 * laboratory figure is never a complete-bike weight.
 */
export type WeightRecord = {
  grams: number;
  kind: WeightKind;
  /** Frame size the figure was measured in, when the manufacturer states it. */
  size?: string | null;
  /** Whether paint is included, when the manufacturer states it. */
  paintIncluded?: boolean | null;
  note?: string | null;
};

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

  price: CatalogPrice | null;
  priceNote?: string | null;
  /** Seed/reference figure that still needs model-page confirmation. */
  referencePrice?: ReferencePrice | null;

  weights: WeightRecord[];
  /**
   * Weights that exist in the brief or an earlier source but could not be confirmed
   * on the product page. Kept separate from `weights` so the verified-weight count
   * cannot be inflated by them — the same reason `referencePrice` exists.
   */
  referenceWeights?: WeightRecord[] | null;
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