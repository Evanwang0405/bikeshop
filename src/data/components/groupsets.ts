import { availabilityTypes, type AvailabilityType, type SourceQuality } from "@/types/sourcing";

/**
 * Groupset catalog.
 *
 * WHY EXACT GENERATIONS MATTER
 * "105" and "Ultegra" are not products — they are series names spanning mechanical
 * and electronic generations with very different weights, prices and compatibility.
 * Every entry here carries an exact generation (`R7170`, `R8170`, `E1`) so a build
 * cannot accidentally be configured with a group that does not exist.
 *
 * Weights depend on configuration (crank length, chainrings, cassette, rotor size,
 * power meter, bottom bracket, chain length), so each entry records the layout and
 * whether a power meter is included. Comparing two groupset weights without
 * exposing that context would be misleading.
 */

export type GroupsetLayout = "1x12" | "2x12" | "1x13" | "2x10" | "2x9";
export type Shifting = "electronic" | "electronic-wireless" | "mechanical";
export type Braking = "hydraulic-disc" | "mechanical-disc" | "rim";

export type GroupsetSpec = {
  /** Exact generation identity, e.g. "R7170" or "E1". */
  generation: string;
  layout: GroupsetLayout;
  shifting: Shifting;
  braking: Braking;
  /** Multi-chainring support, when the manufacturer sells both. */
  supportedLayouts?: GroupsetLayout[];
  /** Cassette range, when a single option is the factory configuration. */
  cassette?: string;
  /** XPLR / Eagle 13-speed groups require a UDH frame. */
  requiresUDH?: boolean;
  weightGrams?: number;
  weightWithPowerMeterGrams?: number;
  weightWithoutPowerMeterGrams?: number;
  priceRmb?: number;
  priceWithPowerMeterRmb?: number;
  priceWithoutPowerMeterRmb?: number;
  priceType?: "china-msrp" | "retailer-reference" | "fx-converted-reference";
  productStatus: "current" | "legacy";
  availability?: AvailabilityType;
  sourceQuality?: SourceQuality;
};

export type GroupsetEntry = {
  id: string;
  brand: "Shimano" | "SRAM";
  family: string;
  model: string;
  spec: GroupsetSpec;
};

// ---------------------------------------------------------------------------
// SRAM
// ---------------------------------------------------------------------------

export const sramGroupsets: GroupsetEntry[] = [
  // --- current electronic road -------------------------------------------------
  {
    id: "sram-red-axs-e1-road",
    brand: "SRAM",
    family: "RED AXS",
    model: "RED AXS E1 Road",
    spec: {
      generation: "E1",
      layout: "2x12",
      supportedLayouts: ["1x12", "2x12"],
      shifting: "electronic-wireless",
      braking: "hydraulic-disc",
      weightGrams: 2496,
      productStatus: "current",
      availability: "retail",
    },
  },
  {
    id: "sram-force-axs-e1-road",
    brand: "SRAM",
    family: "Force AXS",
    model: "Force AXS E1 Road",
    spec: {
      generation: "E1",
      layout: "2x12",
      shifting: "electronic-wireless",
      braking: "hydraulic-disc",
      weightWithPowerMeterGrams: 2776,
      priceWithPowerMeterRmb: 19074,
      priceWithoutPowerMeterRmb: 16322,
      priceType: "retailer-reference",
      productStatus: "current",
      availability: "retail",
    },
  },
  {
    id: "sram-rival-axs-e1-road",
    brand: "SRAM",
    family: "Rival AXS",
    model: "Rival AXS E1 Road",
    spec: {
      generation: "E1",
      layout: "2x12",
      shifting: "electronic-wireless",
      braking: "hydraulic-disc",
      weightWithPowerMeterGrams: 2993,
      priceWithPowerMeterRmb: 12946,
      priceWithoutPowerMeterRmb: 11839,
      priceType: "retailer-reference",
      productStatus: "current",
      availability: "retail",
    },
  },

  // --- current XPLR 13-speed electronic ----------------------------------------
  {
    id: "sram-red-xplr-axs-e1",
    brand: "SRAM",
    family: "RED XPLR AXS",
    model: "RED XPLR AXS E1",
    spec: {
      generation: "E1",
      layout: "1x13",
      cassette: "10-46",
      shifting: "electronic-wireless",
      braking: "hydraulic-disc",
      requiresUDH: true,
      weightWithPowerMeterGrams: 2499,
      weightWithoutPowerMeterGrams: 2398,
      priceWithPowerMeterRmb: 26704,
      priceWithoutPowerMeterRmb: 23684,
      priceType: "retailer-reference",
      productStatus: "current",
      availability: "retail",
    },
  },
  {
    id: "sram-force-xplr-axs",
    brand: "SRAM",
    family: "Force XPLR AXS",
    model: "Force XPLR AXS",
    spec: {
      generation: "current",
      layout: "1x13",
      cassette: "10-46",
      shifting: "electronic-wireless",
      braking: "hydraulic-disc",
      requiresUDH: true,
      weightWithPowerMeterGrams: 2686,
      weightWithoutPowerMeterGrams: 2648,
      priceWithPowerMeterRmb: 15825,
      priceWithoutPowerMeterRmb: 14450,
      priceType: "retailer-reference",
      productStatus: "current",
      availability: "retail",
    },
  },
  {
    id: "sram-rival-xplr-axs",
    brand: "SRAM",
    family: "Rival XPLR AXS",
    model: "Rival XPLR AXS",
    spec: {
      generation: "current",
      layout: "1x13",
      cassette: "10-46",
      shifting: "electronic-wireless",
      braking: "hydraulic-disc",
      requiresUDH: true,
      weightWithPowerMeterGrams: 2961,
      weightWithoutPowerMeterGrams: 2923,
      priceWithPowerMeterRmb: 11698,
      priceWithoutPowerMeterRmb: 10490,
      priceType: "retailer-reference",
      productStatus: "current",
      availability: "retail",
    },
  },

  // --- Apex electronic ---------------------------------------------------------
  {
    id: "sram-apex-xplr-axs",
    brand: "SRAM",
    family: "Apex AXS",
    model: "Apex XPLR AXS",
    spec: {
      generation: "current",
      layout: "1x12",
      shifting: "electronic-wireless",
      braking: "hydraulic-disc",
      weightGrams: 2976,
      priceRmb: 8020,
      priceType: "retailer-reference",
      productStatus: "current",
      availability: "retail",
    },
  },
  {
    id: "sram-apex-eagle-axs",
    brand: "SRAM",
    family: "Apex AXS",
    model: "Apex Eagle AXS",
    spec: {
      generation: "current",
      layout: "1x12",
      shifting: "electronic-wireless",
      braking: "hydraulic-disc",
      weightGrams: 3267,
      priceRmb: 8684,
      priceType: "retailer-reference",
      productStatus: "current",
      availability: "retail",
    },
  },

  // --- Apex mechanical (SRAM still sells a current cable 12-speed Apex) --------
  {
    id: "sram-apex-xplr-mechanical",
    brand: "SRAM",
    family: "Apex",
    model: "Apex XPLR Mechanical",
    spec: {
      generation: "current",
      layout: "1x12",
      shifting: "mechanical",
      braking: "hydraulic-disc",
      weightGrams: 2872,
      priceRmb: 6624,
      priceType: "retailer-reference",
      productStatus: "current",
      availability: "retail",
    },
  },
  {
    id: "sram-apex-eagle-mechanical",
    brand: "SRAM",
    family: "Apex",
    model: "Apex Eagle Mechanical",
    spec: {
      generation: "current",
      layout: "1x12",
      shifting: "mechanical",
      braking: "hydraulic-disc",
      weightGrams: 3062,
      priceRmb: 6517,
      priceType: "retailer-reference",
      productStatus: "current",
      availability: "retail",
    },
  },

  // --- legacy mechanical -------------------------------------------------------
  // Kept because older bicycles in the catalog are built with them. They must NOT
  // appear as current-generation SRAM products by default.
  ...(
    [
      ["red-22", "RED 22", "2x11"],
      ["force-22", "Force 22", "2x11"],
      ["rival-22", "Rival 22", "2x11"],
      ["force-1", "Force 1", "1x11"],
      ["rival-1", "Rival 1", "1x11"],
      ["apex-1", "Apex 1", "1x11"],
    ] as const
  ).map(([slug, model]) => ({
    id: `sram-${slug}`,
    brand: "SRAM" as const,
    family: model.split(" ")[0],
    model,
    spec: {
      generation: "legacy",
      layout: "2x11" as GroupsetLayout,
      shifting: "mechanical" as Shifting,
      braking: "rim" as Braking,
      productStatus: "legacy" as const,
      availability: "unknown" as AvailabilityType,
    },
  })),
];

// ---------------------------------------------------------------------------
// Shimano
// ---------------------------------------------------------------------------

export const shimanoGroupsets: GroupsetEntry[] = [
  {
    id: "shimano-dura-ace-r9270-di2",
    brand: "Shimano",
    family: "Dura-Ace",
    model: "Dura-Ace R9270 Di2",
    spec: {
      generation: "R9270",
      layout: "2x12",
      shifting: "electronic",
      braking: "hydraulic-disc",
      weightGrams: 2438,
      priceRmb: 29818,
      priceType: "retailer-reference",
      productStatus: "current",
      availability: "retail",
    },
  },
  {
    id: "shimano-ultegra-r8170-di2",
    brand: "Shimano",
    family: "Ultegra",
    model: "Ultegra R8170 Di2",
    spec: {
      generation: "R8170",
      layout: "2x12",
      shifting: "electronic",
      braking: "hydraulic-disc",
      weightGrams: 2617,
      priceRmb: 21755,
      priceType: "retailer-reference",
      productStatus: "current",
      availability: "retail",
    },
  },
  {
    id: "shimano-105-r7170-di2",
    brand: "Shimano",
    family: "105",
    model: "105 R7170 Di2",
    spec: {
      generation: "R7170",
      layout: "2x12",
      shifting: "electronic",
      braking: "hydraulic-disc",
      weightGrams: 2996,
      priceRmb: 14126,
      priceType: "retailer-reference",
      productStatus: "current",
      availability: "retail",
    },
  },
  {
    id: "shimano-105-r7120-mechanical",
    brand: "Shimano",
    family: "105",
    model: "105 R7120 Mechanical",
    spec: {
      generation: "R7120",
      layout: "2x12",
      shifting: "mechanical",
      braking: "hydraulic-disc",
      weightGrams: 2845,
      priceRmb: 9032,
      priceType: "retailer-reference",
      productStatus: "current",
      availability: "retail",
    },
  },
  {
    id: "shimano-tiagra-4720",
    brand: "Shimano",
    family: "Tiagra",
    model: "Tiagra 4720",
    spec: {
      generation: "4720",
      layout: "2x10",
      shifting: "mechanical",
      braking: "hydraulic-disc",
      weightGrams: 2826,
      priceRmb: 5765,
      priceType: "retailer-reference",
      productStatus: "current",
      availability: "retail",
    },
  },
  {
    id: "shimano-sora-r3000",
    brand: "Shimano",
    family: "Sora",
    model: "Sora R3000",
    spec: {
      generation: "R3000",
      layout: "2x9",
      shifting: "mechanical",
      braking: "rim",
      weightGrams: 2660,
      priceRmb: 4053,
      priceType: "retailer-reference",
      productStatus: "current",
      availability: "retail",
    },
  },
  // GRX is sold as separate 1x and 2x configurations with different weights, so
  // they are two entries rather than one ambiguous "GRX RX820".
  {
    id: "shimano-grx-rx820-1x12",
    brand: "Shimano",
    family: "GRX",
    model: "GRX RX820 (1x12)",
    spec: {
      generation: "RX820",
      layout: "1x12",
      shifting: "mechanical",
      braking: "hydraulic-disc",
      weightGrams: 2720,
      priceRmb: 10355,
      priceType: "retailer-reference",
      productStatus: "current",
      availability: "retail",
    },
  },
  {
    id: "shimano-grx-rx820-2x12",
    brand: "Shimano",
    family: "GRX",
    model: "GRX RX820 (2x12)",
    spec: {
      generation: "RX820",
      layout: "2x12",
      shifting: "mechanical",
      braking: "hydraulic-disc",
      weightGrams: 2962,
      priceRmb: 10637,
      priceType: "retailer-reference",
      productStatus: "current",
      availability: "retail",
    },
  },
];

export const groupsetEntries: GroupsetEntry[] = [...shimanoGroupsets, ...sramGroupsets];

/**
 * Shimano drivetrain SKUs that must be identified exactly.
 * 11-34 and 11-36 are different cassettes and must never be merged.
 */
export type DrivetrainSku = {
  model: string;
  type: "crankset" | "cassette";
  gearing: string;
  claimedWeightGrams?: number;
};

export const shimano105DrivetrainSkus: DrivetrainSku[] = [
  { model: "FC-R7100", type: "crankset", gearing: "50/34", claimedWeightGrams: 754 },
  { model: "CS-R7100-12", type: "cassette", gearing: "11-34", claimedWeightGrams: 361 },
  { model: "CS-HG710-12", type: "cassette", gearing: "11-36" },
];

/**
 * Brake groups, modelled as exact components.
 *
 * "Shimano 105 hydraulic brake — ¥xxx" is not a product: a hydraulic road brake
 * system can mean one caliper, a caliper pair, levers + calipers, or a complete
 * front/rear system with rotors. Each of those has a different price, so the
 * variant is recorded explicitly.
 */
export type BrakeGroup = {
  family: string;
  generation: string;
  shifterBrakeLever: string;
  caliper: string;
  rotor?: string;
  leverPairWeightGrams?: number;
  caliperPairWeightGrams?: number;
  priceRmb?: number;
  priceType?: "china-msrp" | "retailer-reference" | "fx-converted-reference";
};

export const brakeGroups: BrakeGroup[] = [
  {
    family: "105",
    generation: "R7170",
    shifterBrakeLever: "ST-R7170",
    caliper: "BR-R7170",
    rotor: "SM-RT70",
  },
  {
    family: "105",
    generation: "R7120",
    shifterBrakeLever: "ST-R7120",
    caliper: "BR-R7170",
    rotor: "SM-RT70",
    leverPairWeightGrams: 612,
    caliperPairWeightGrams: 267,
  },
  { family: "Tiagra", generation: "4720", shifterBrakeLever: "ST-4720", caliper: "BR-4770" },
  { family: "Ultegra", generation: "R8170", shifterBrakeLever: "ST-R8170", caliper: "BR-R8170", rotor: "SM-RT800" },
  { family: "Dura-Ace", generation: "R9270", shifterBrakeLever: "ST-R9270", caliper: "BR-R9270", rotor: "SM-RT900" },
];

/** A human description of what a brake group contains, for display next to a price. */
export function brakeGroupContents(group: BrakeGroup): string {
  const parts = [`刹把 ${group.shifterBrakeLever}`, `夹器 ${group.caliper}`];
  if (group.rotor) parts.push(`碟盘 ${group.rotor}`);
  return `${parts.join(" + ")}（整套前/后刹车系统）`;
}

export { availabilityTypes };
export type { AvailabilityType };