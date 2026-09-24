import { catalog, families, brands, brandAliases, rejectedProducts } from "@/data/catalog";
import { factoryBuildSlots } from "@/types/catalog";
import type { Bicycle } from "@/types/catalog";

export type ManufacturerCoverage = {
  manufacturer: string;
  sourceTier: number;
  families: number;
  completeBikes: number;
  framesets: number;
  verifiedPrices: number;
  referencePricesOnly: number;
  verifiedWeights: number;
  /** Factory builds detailed enough to reproduce end to end. */
  completeFactoryBuilds: number;
  /** Factory builds detailed enough for the Workshop to open pre-loaded. */
  loadableFactoryBuilds: number;
  officialImages: number;
  /** Records carrying taxonomy but no price, weight or build (see isStructureOnly). */
  structureOnly: number;
  partialRecords: number;
  sourceUrls: string[];
};

export type CatalogReport = {
  brandsImported: number;
  brandsQueued: number;
  familiesImported: number;
  completeBikes: number;
  framesets: number;
  verifiedPrices: number;
  referencePricesOnly: number;
  verifiedWeights: number;
  completeFactoryBuilds: number;
  /** Factory builds detailed enough for the Workshop to open pre-loaded. */
  loadableFactoryBuilds: number;
  officialImages: number;
  /** Records carrying taxonomy but no price, weight or build (see isStructureOnly). */
  structureOnly: number;
  rejected: number;
  byManufacturer: ManufacturerCoverage[];
  totalRecords: number;
  totalProductsWithFactoryBuild: number;
};

/**
 * Factory-build completeness.
 *
 * A bicycle needs enough populated slots that the Workshop can load a real
 * original spec rather than an empty frame. Two thresholds are reported:
 *
 *   LOADABLE  — enough slots to start from the real factory bike (frame + a few
 *               named parts). This is the requirement behind
 *               "用这辆车开始选配".
 *   COMPLETE  — the manufacturer actually publishes the drivetrain, wheels,
 *               tires and cockpit, i.e. the build can be reproduced end to end.
 *
 * Keeping both numbers prevents over-claiming: MERIDA publishes frame, fork,
 * groupset, brakes and rotors (loadable, not complete), while a few products
 * publish a full parts list.
 */
export const LOADABLE_BUILD_THRESHOLD = 3;
export const COMPLETE_BUILD_THRESHOLD = 8;

function slotCount(bike: Bicycle): number {
  const build = bike.factoryBuild;
  if (!build) return 0;
  return factoryBuildSlots.filter((slot) => {
    const value = build[slot];
    return typeof value === "string" && value.trim().length > 0;
  }).length;
}

export function factoryBuildSlotCount(bike: Bicycle): number {
  return slotCount(bike);
}

/** Enough slots for the Workshop to open with real factory parts loaded. */
export function hasLoadableFactoryBuild(bike: Bicycle): boolean {
  return bike.productType === "complete-bike" && slotCount(bike) >= LOADABLE_BUILD_THRESHOLD;
}

/** Published in enough detail to reproduce the build end to end. */
export function hasCompleteFactoryBuild(bike: Bicycle): boolean {
  return bike.productType === "complete-bike" && slotCount(bike) >= COMPLETE_BUILD_THRESHOLD;
}

/**
 * A record that carries the taxonomy but no verifiable product data at all: no
 * price, no weight and no factory build.
 *
 * These exist on purpose — they make family and alias search resolve correctly for
 * brands whose product pages could not be read (Pardus, Camp) — but they must NOT
 * be counted as "imported products" without qualification, or the coverage numbers
 * would overstate what is actually known.
 */
export function isStructureOnly(bike: Bicycle): boolean {
  const buildSlots = Object.keys(bike.factoryBuild ?? {}).length;
  return bike.price.rmb === null && bike.weights.length === 0 && buildSlots === 0;
}

export function hasVerifiedWeight(bike: Bicycle): boolean {
  return bike.weights.length > 0;
}

export function hasVerifiedPrice(bike: Bicycle): boolean {
  return bike.price.rmb !== null;
}

/**
 * Whether a price describes the China market rather than a converted foreign one.
 * A converted figure must be labelled as such wherever it is shown.
 */
export function isChinaPrice(bike: Bicycle): boolean {
  return bike.price.priceType === "china-msrp";
}

/** Bikes whose only figure is a converted, retailer or legacy reference. */
export function hasReferencePriceOnly(bike: Bicycle): boolean {
  return bike.price.rmb === null && Boolean(bike.referencePrice?.rmb);
}

export function buildCatalogReport(): CatalogReport {
  const ingested = brands.filter((brand) => brand.status === "ingested");
  const queued = brands.filter((brand) => brand.status === "ingestion-target");

  const sourceUrlsByManufacturer = new Map<string, Set<string>>();
  const manifestEntries = Object.keys(brandAliases);

  for (const bike of catalog) {
    const urls = sourceUrlsByManufacturer.get(bike.brand) ?? new Set<string>();
    urls.add(bike.source.productUrl);
    if (bike.source.catalogUrl) urls.add(bike.source.catalogUrl);
    sourceUrlsByManufacturer.set(bike.brand, urls);
  }

  const byManufacturer: ManufacturerCoverage[] = manifestEntries.map((manufacturer) => {
    const records = catalog.filter((bike) => bike.brand === manufacturer);
    const familyCount = families.filter((family) => family.brand === manufacturer).length;
    const urls = [...(sourceUrlsByManufacturer.get(manufacturer) ?? new Set<string>())].sort();
    return {
      manufacturer,
      sourceTier: Math.min(...records.map((bike) => bike.source.sourceTier), 9),
      families: familyCount,
      completeBikes: records.filter((bike) => bike.productType === "complete-bike").length,
      framesets: records.filter((bike) => bike.productType === "frameset").length,
      verifiedPrices: records.filter(hasVerifiedPrice).length,
      referencePricesOnly: records.filter(hasReferencePriceOnly).length,
      verifiedWeights: records.filter(hasVerifiedWeight).length,
      completeFactoryBuilds: records.filter(hasCompleteFactoryBuild).length,
      loadableFactoryBuilds: records.filter(hasLoadableFactoryBuild).length,
      officialImages: records.filter((bike) => bike.image?.sourceType === "official").length,
      structureOnly: records.filter(isStructureOnly).length,
      partialRecords: records.filter((bike) => bike.dataQuality === "partial").length,
      sourceUrls: urls,
    };
  });

  return {
    brandsImported: ingested.length,
    brandsQueued: queued.length,
    familiesImported: families.length,
    completeBikes: catalog.filter((bike) => bike.productType === "complete-bike").length,
    framesets: catalog.filter((bike) => bike.productType === "frameset").length,
    verifiedPrices: catalog.filter(hasVerifiedPrice).length,
    referencePricesOnly: catalog.filter(hasReferencePriceOnly).length,
    verifiedWeights: catalog.filter(hasVerifiedWeight).length,
    completeFactoryBuilds: catalog.filter(hasCompleteFactoryBuild).length,
    loadableFactoryBuilds: catalog.filter(hasLoadableFactoryBuild).length,
    officialImages: catalog.filter((bike) => bike.image?.sourceType === "official").length,
    structureOnly: catalog.filter(isStructureOnly).length,
    rejected: rejectedProducts.length,
    byManufacturer,
    totalRecords: catalog.length,
    totalProductsWithFactoryBuild: catalog.filter((bike) => factoryBuildSlotCount(bike) > 0).length,
  };
}