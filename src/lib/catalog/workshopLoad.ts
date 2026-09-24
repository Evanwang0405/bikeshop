import type { Bicycle, FactoryBuildSlots } from "@/types/catalog";
import { componentCategories } from "@/types/bike";
import type { Component, ComponentCategory, FactoryBuild } from "@/types/bike";
import { factoryBuildSlotCount } from "./stats";
import { factoryBuildSlots } from "@/types/catalog";

/**
 * Bridge between the normalized catalog and the Workshop configurator.
 *
 * Requirement: clicking "用这辆车开始选配" must load the *original factory
 * components*, never an empty frame. To do that we synthesize `Component` records
 * from each catalog product's factory build. The synthesized components:
 *   · keep the source URL, region and retrieval date of the bicycle,
 *   · inherit frame standards (BB, axles, clearance, seatpost) so the existing
 *     compatibility engine can still run,
 *   · carry `dataQuality: "official" | "verified" | "partial"` instead of "demo".
 *
 * Prices of factory parts are intentionally 0: they are already paid for inside
 * the complete-bike price, and inventing per-part prices would be fabrication.
 */

/** Map a catalog factory-build slot onto a Workshop component category. */
export const SLOT_TO_CATEGORY: Partial<Record<keyof FactoryBuildSlots, ComponentCategory>> = {
  frame: "frame",
  fork: "fork",
  groupset: "groupset",
  shifters: "groupset",
  frontDerailleur: "groupset",
  rearDerailleur: "groupset",
  crankset: "crankset",
  cassette: "cassette",
  chain: "chain",
  brakes: "brakes",
  rotors: "brakes",
  bottomBracket: "frame",
  wheelset: "wheelset",
  tires: "tires",
  handlebar: "handlebar",
  stem: "stem",
  integratedCockpit: "handlebar",
  seatpost: "seatpost",
  saddle: "saddle",
};

const CATEGORY_LABELS: Record<ComponentCategory, string> = {
  frame: "车架",
  fork: "前叉",
  wheelset: "轮组",
  tires: "外胎",
  groupset: "套件",
  crankset: "牙盘",
  cassette: "飞轮",
  chain: "链条",
  brakes: "刹车系统",
  handlebar: "车把",
  stem: "把立",
  saddle: "坐垫",
  seatpost: "座管",
  pedals: "脚踏",
};

export function splitBrandModel(value: string): { brand: string; model: string } {
  const trimmed = value.trim();
  const spaceIndex = trimmed.indexOf(" ");
  if (spaceIndex === -1) return { brand: "", model: trimmed };
  return { brand: trimmed.slice(0, spaceIndex), model: trimmed.slice(spaceIndex + 1) };
}

/** Synthesized factory-part ids are suffixed with the slot they came from. */
export function factoryComponentId(bikeId: string, slot: keyof FactoryBuildSlots): string {
  return `${bikeId}__${slot}`;
}

function componentId(bike: Bicycle, slot: keyof FactoryBuildSlots): string {
  return factoryComponentId(bike.id, slot);
}

export type WorkshopLoadResult = {
  bike: Bicycle;
  /** Component records synthesized from the factory build, in category order. */
  components: Component[];
  /** category → component id, ready for `BikeBuild.selections`. */
  selections: Partial<Record<ComponentCategory, string>>;
  /** Slot names that were populated, for UI copy ("已载入 12 项原厂零件"). */
  loadedSlots: (keyof FactoryBuildSlots)[];
  /** Slots the manufacturer does not publish for this product. */
  missingSlots: (keyof FactoryBuildSlots)[];
};

export function toWorkshopBuild(bike: Bicycle): WorkshopLoadResult {
  const build = bike.factoryBuild ?? {};
  const perCategory = new Map<ComponentCategory, Component[]>();
  const loadedSlots: (keyof FactoryBuildSlots)[] = [];

  const slotEntries = Object.entries(build) as [keyof FactoryBuildSlots, string | null | undefined][];

  for (const [slot, value] of slotEntries) {
    if (typeof value !== "string" || value.trim().length === 0) continue;
    const category = SLOT_TO_CATEGORY[slot];
    if (!category) continue;

    loadedSlots.push(slot);
    const { brand, model } = splitBrandModel(value);
    const specs = bike.frameSpecs ?? {};

    const component: Component = {
      id: componentId(bike, slot),
      brand: brand || bike.brand,
      model: model || value,
      category,
      // Factory parts are already paid for inside the complete-bike price, so the
      // part itself has no separate price. GIANT also does not publish part weights.
      price: 0,
      priceBasis: "included",
      weight: 0,
      weightBasis: "unknown",
      image: `factory-${category}`,
      description: `${bike.brand} ${bike.family} ${bike.tier ?? ""} ${bike.trim ?? ""}`.trim() + ` 原厂${CATEGORY_LABELS[category]}：${value}`,
      specifications: {
        来源: "整车原厂配置",
        车型: `${bike.brand} ${bike.family}`,
        ...(bike.modelYear ? { 车型年: String(bike.modelYear) } : {}),
        ...(bike.generation ? { 世代: bike.generation } : {}),
      },
      compatibility:
        category === "frame"
          ? {
              wheelSize: specs.wheelSize ?? "700c",
              axleStandard: specs.axleRear ?? undefined,
              tireClearance: specs.tireClearanceMm ?? undefined,
              bottomBracket: specs.bottomBracket ?? undefined,
              seatpostDiameter: specs.seatpostDiameterMm ?? undefined,
              brakeType: "disc",
            }
          : category === "wheelset"
            ? { wheelSize: specs.wheelSize ?? "700c", axleStandard: specs.axleRear ?? undefined }
            : category === "tires"
              ? { wheelSize: specs.wheelSize ?? "700c" }
              : category === "groupset"
                ? { brakeType: "disc", bottomBracket: specs.bottomBracket ?? undefined }
                : {},
      dataQuality: bike.dataQuality,
      source: {
        manufacturer: bike.source.manufacturer,
        productUrl: bike.source.productUrl,
        region: bike.source.region,
        sourceCurrency: bike.price.sourceCurrency ?? undefined,
        retrievedAt: bike.source.retrievedAt,
      },
    };

    perCategory.set(category, [...(perCategory.get(category) ?? []), component]);
  }

  // One component per Workshop category; multiple slots collapse into a summary
  // (shifters + derailleurs → groupset, brakes + rotors → brakes).
  const components: Component[] = [];
  const selections: Partial<Record<ComponentCategory, string>> = {};

  for (const category of componentCategories) {
    const candidates = perCategory.get(category);
    if (!candidates?.length) continue;
    const merged =
      candidates.length === 1
        ? candidates[0]
        : {
            ...candidates[0],
            model: candidates.map((candidate) => candidate.model).join(" / "),
            specifications: {
              ...candidates[0].specifications,
              原厂零件: candidates.map((candidate) => `${CATEGORY_LABELS[category]}：${candidate.model}`).join("；"),
            },
          };
    components.push(merged);
    selections[category] = merged.id;
  }

  return { bike, components, selections, loadedSlots, missingSlots: missingFactorySlots(bike) };
}

/**
 * Slots the manufacturer does not publish for this product.
 *
 * Computed against the full slot vocabulary rather than only the keys present in
 * the object, so a slot that was simply never written is counted as missing
 * instead of silently disappearing from the total.
 */
export function missingFactorySlots(bike: Bicycle): (keyof FactoryBuildSlots)[] {
  const build = bike.factoryBuild ?? {};
  return factoryBuildSlots.filter((slot) => {
    const value = build[slot];
    return !(typeof value === "string" && value.trim().length > 0);
  });
}

/** Convenience for the UI: how much of the original build can be loaded. */
export function factoryBuildSummary(bike: Bicycle): { loaded: number; total: number; complete: boolean } {
  const loaded = factoryBuildSlotCount(bike);
  const total = factoryBuildSlots.length;
  return { loaded, total, complete: loaded >= 5 && bike.productType === "complete-bike" };
}

export type { FactoryBuild };