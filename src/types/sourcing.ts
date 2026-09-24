/**
 * Price and weight provenance.
 *
 * The catalog must never blur three different things:
 *   1. a China MSRP the manufacturer publishes,
 *   2. a foreign MSRP converted to RMB at a known rate,
 *   3. no figure at all.
 *
 * A single `price: number` cannot express that, so prices and weights carry their
 * classification explicitly. `null` means "no reliable data" and is a valid, final
 * answer — the UI says so rather than showing ¥0.
 */

// ---------------------------------------------------------------------------
// Price
// ---------------------------------------------------------------------------

export const priceTypes = [
  /** The manufacturer's official China suggested retail price. */
  "china-msrp",
  /** The manufacturer's official price in some other market, unconverted. */
  "manufacturer-msrp",
  /** A retailer's price, not the manufacturer's. */
  "retailer-reference",
  /** A foreign MSRP converted to RMB. Never present this as a China price. */
  "fx-converted-reference",
  /** A superseded price kept for older bicycles. */
  "historical",
  "unknown",
] as const;

export type PriceType = (typeof priceTypes)[number];

/**
 * FX snapshot used for any converted reference price.
 *
 * Kept as a dated constant rather than a live lookup so a displayed RMB figure can
 * always be explained: the rate is the one recorded here, on this date.
 */
export const FX_SNAPSHOTS = {
  "2026-09-24": { USD_CNY: 6.71135, EUR_CNY: 7.63612, GBP_CNY: 8.86982 },
} as const;

export type FxDate = keyof typeof FX_SNAPSHOTS;

export type CatalogPriceRecord = {
  /** RMB amount shown on the site. Null when no reliable figure exists. */
  rmb: number | null;
  priceType: PriceType;

  /** The original amount, before any conversion. */
  sourcePrice?: number | null;
  sourceCurrency?: "USD" | "EUR" | "GBP" | "CNY" | null;

  /** The RMB figure derived from `sourcePrice` via `fxDate`. */
  referencePriceRmb?: number | null;
  fxDate?: FxDate | string | null;

  market?: string | null;
  modelYear?: number | null;
  sourceUrl?: string | null;
  sourceName?: string | null;
  retrievedAt?: string | null;
  confidence?: Confidence | null;
  note?: string | null;
};

// ---------------------------------------------------------------------------
// Weight
// ---------------------------------------------------------------------------

/**
 * What a weight figure actually measures. A bare-frame figure is never a
 * complete-bike figure, and the type is what enforces that.
 */
export const weightTypes = [
  "complete-bike",
  "frameset",
  "bare-frame",
  "frame",
  "wheelset",
  "groupset",
  "component",
] as const;

export type WeightType = (typeof weightTypes)[number];

export type CatalogWeightRecord = {
  grams: number;
  weightType: WeightType;

  size?: string | null;
  modelYear?: number | null;
  market?: string | null;

  paintIncluded?: boolean | null;
  hardwareIncluded?: boolean | null;
  /** Manufacturer-stated tolerance, e.g. ±35 g. */
  toleranceGrams?: number | null;

  sourceQuality?: SourceQuality | null;
  sourceUrl?: string | null;
  sourceName?: string | null;
  confidence?: Confidence | null;
  retrievedAt?: string | null;
  note?: string | null;
};

// ---------------------------------------------------------------------------
// Shared provenance
// ---------------------------------------------------------------------------

export const sourceQualities = [
  "manufacturer",
  "manufacturer-global",
  "authorized-retailer",
  "verified-retailer",
  "verified-media",
  "verified-third-party",
  "retailer",
  "estimated",
] as const;

export type SourceQuality = (typeof sourceQualities)[number];

export type Confidence = "high" | "medium" | "low";

/** Whether a part can be bought on its own, only comes on a bike, or both. */
export const availabilityTypes = ["retail", "oem", "both", "unknown"] as const;
export type AvailabilityType = (typeof availabilityTypes)[number];

/**
 * A numeric field with its provenance attached.
 *
 * Use this where a value's origin genuinely matters to a purchasing decision
 * (complete-bike weight, MSRP, wheelset weight) and the field is not already
 * covered by CatalogPriceRecord / CatalogWeightRecord.
 */
export type SourcedValue<T> = {
  value: T;
  sourceUrl?: string;
  sourceName?: string;
  sourceType: SourceQuality;
  market?: string;
  modelYear?: number;
  retrievedAt: string;
  confidence: Confidence;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Convert a foreign amount to RMB using the recorded snapshot. */
export function convertToRmb(
  amount: number,
  currency: "USD" | "EUR" | "GBP",
  fxDate: FxDate | string = "2026-09-24",
): number | null {
  const snapshot = FX_SNAPSHOTS[fxDate as FxDate];
  if (!snapshot) return null;
  const rate = currency === "USD" ? snapshot.USD_CNY : currency === "EUR" ? snapshot.EUR_CNY : snapshot.GBP_CNY;
  return Math.round(amount * rate);
}

/** Build an FX-converted reference price, keeping the source amount intact. */
export function fxReference(
  sourcePrice: number,
  sourceCurrency: "USD" | "EUR" | "GBP",
  options: {
    fxDate?: FxDate | string;
    market?: string;
    modelYear?: number;
    note?: string;
    confidence?: Confidence;
  } = {},
): CatalogPriceRecord {
  const fxDate = options.fxDate ?? "2026-09-24";
  const referencePriceRmb = convertToRmb(sourcePrice, sourceCurrency, fxDate);
  return {
    rmb: referencePriceRmb,
    priceType: "fx-converted-reference",
    sourcePrice,
    sourceCurrency,
    referencePriceRmb,
    fxDate,
    market: options.market ?? null,
    modelYear: options.modelYear ?? null,
    confidence: options.confidence ?? "medium",
    note: options.note ?? "海外官方参考价折算，不是中国官方建议零售价。",
  };
}

/** Build a China MSRP. */
export function chinaMsrp(rmb: number, options: { market?: string; sourceName?: string; sourceUrl?: string; confidence?: Confidence } = {}): CatalogPriceRecord {
  return {
    rmb,
    priceType: "china-msrp",
    sourceCurrency: "CNY",
    market: options.market ?? "CN",
    sourceName: options.sourceName ?? null,
    sourceUrl: options.sourceUrl ?? null,
    confidence: options.confidence ?? "high",
  };
}

/** An explicitly unavailable price. Never substitute a number for this. */
export function noPrice(note: string): CatalogPriceRecord {
  return { rmb: null, priceType: "unknown", note };
}