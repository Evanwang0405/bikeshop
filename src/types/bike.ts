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
  sizeOptions?: string[];
  weightBySize?: Record<string, number>;
  image: string;
  photoUrl?: string;
  description: string;
  specifications: Record<string, string>;
  compatibility: CompatibilityAttributes;
  officialUrl?: string;
};

export type BikeBuild = {
  selections: Partial<Record<ComponentCategory, string>>;
  sizes: Partial<Record<ComponentCategory, string>>;
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
  photoUrl?: string;
  officialUrl?: string;
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
