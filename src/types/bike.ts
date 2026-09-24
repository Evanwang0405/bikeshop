export const componentCategories = [
  "frame",
  "fork",
  "wheelset",
  "tires",
  "groupset",
  "crankset",
  "cassette",
  "chain",
  "brakes",
  "handlebar",
  "stem",
  "saddle",
  "seatpost",
  "pedals",
] as const;

export type ComponentCategory = (typeof componentCategories)[number];

export type BuildMode = "complete-bike" | "custom-build";

export type Money = {
  amount: number;
  currency: "USD" | "CNY" | "EUR";
  region?: string;
};

export type ProductImage = {
  url: string;
  sourceUrl: string;
  sourceType: "official" | "fallback";
  alt: string;
};

export type ProductSource = {
  manufacturer: string;
  productUrl: string;
  region?: string;
  sourceCurrency?: string;
  retrievedAt: string;
  /** Data-source tier (1 = official China page, 2 = official global page, ...). */
  sourceTier?: number;
};

export type ComponentReference = {
  productId: string;
  label?: string;
};

export type FactoryBuild = Partial<Record<ComponentCategory, ComponentReference>>;

export type CompatibilityAttributes = {
  wheelSize?: string;
  axleStandard?: string;
  tireWidth?: number;
  tireClearance?: number;
  drivetrainSpeed?: number;
  groupsetFamily?: string;
  brakeType?: "disc" | "rim";
  bottomBracket?: string;
  freehub?: string;
  clampDiameter?: number;
  seatpostDiameter?: number;
};

export type Component = {
  id: string;
  brand: string;
  model: string;
  category: ComponentCategory;
  price: number;
  weight: number;
  /**
   * How the price figure was obtained.
   *   verified  — read from a manufacturer page
   *   included  — factory part, already paid for inside the complete-bike price
   *   estimated — illustrative sample value, NOT a real quote
   *   unknown   — no price available
   */
  priceBasis?: "verified" | "included" | "estimated" | "unknown";
  /**
   * Which kind of figure the price is. A China MSRP and a converted foreign
   * reference answer different questions, so the caption differs even though both
   * are `verified` figures.
   */
  priceProvenance?: "china-msrp" | "foreign-reference" | "retailer" | "historical" | "unknown";
  /**
   * Where the weight figure comes from.
   *   official  — published by the manufacturer
   *   estimated — illustrative sample value, NOT a published figure
   *   unknown   — no weight available (manufacturers rarely publish part weights)
   */
  weightBasis?: "official" | "estimated" | "unknown";
  /** Bicycles in the catalog whose factory build uses this exact part. */
  usedOnBikeIds?: string[];
  sizeOptions?: string[];
  weightBySize?: Record<string, number>;
  image: string;
  description: string;
  specifications: Record<string, string>;
  compatibility: CompatibilityAttributes;
  dataQuality?: "official" | "verified" | "partial" | "demo";
  source?: ProductSource;
  productImage?: ProductImage;
};

export type BikeBuild = {
  mode: BuildMode;
  baseBikeId?: string;
  selections: Partial<Record<ComponentCategory, string>>;
  sizes: Partial<Record<ComponentCategory, string>>;
  factorySelections: Partial<Record<ComponentCategory, string>>;
};

export type CompleteBike = {
  id: string;
  brand: string;
  model: string;
  price: number;
  weight: number;
  category: "climbing" | "all-round" | "sprint" | "aero" | "budget";
  description: string;
  groupset: string;
  subCategory?: "race" | "aero" | "endurance" | "gravel" | "mtb";
  frameMaterial?: "carbon" | "aluminum" | "steel";
  wheelset?: string;
  ridingStyle?: string[];
  tags?: string[];
  officialUrl?: string;
  year?: number;
  brandId?: string;
  family?: string;
  trim?: string;
  msrp?: Money;
  productImage?: ProductImage;
  source?: ProductSource;
  dataQuality?: "official" | "verified" | "partial" | "demo";
  factoryBuild?: FactoryBuild;
};

export type BrandDirectoryItem = {
  name: string;
  officialUrl: string;
  models: string[];
};
export type CompatibilityStatus = "compatible" | "warning" | "incompatible";

export type CompatibilityResult = {
  status: CompatibilityStatus;
  message: string;
  rule: string;
};
