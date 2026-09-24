import { groupsetEntries, shimano105DrivetrainSkus, brakeGroups } from "./groupsets";
import { wheelsetEntries, wheelsetIngestionTargets, wheelsetTargetFamilies } from "./wheelsets";
import { giantCadexComponents } from "./giant-cadex";

/**
 * Component catalog registry.
 *
 * The Workshop's part picker draws from three sources and each row declares which:
 *   · `derivedComponents`  — real OEM parts read off manufacturer spec tables
 *   · `products`           — illustrative sample parts (dataQuality: "demo")
 *   · this registry        — components with their own catalog identity, carrying
 *                            explicit price and weight provenance
 *
 * A component here always knows what its price IS (China MSRP, converted foreign
 * reference, retailer figure) and what its weight IS (a wheelset weight is not a
 * bike weight). Nothing is fabricated to fill a gap: `priceType: "unknown"` and a
 * null RMB figure are valid, final answers.
 */

export type ComponentCatalogKind = "groupset" | "wheelset" | "saddle" | "stem" | "seatpost" | "tire" | "handlebar";

export type ComponentCatalogEntry = {
  id: string;
  kind: ComponentCatalogKind;
  brand: string;
  model: string;
};

/** Groupsets, keyed by their exact generation identity. */
export const groupsetCatalog = groupsetEntries.map((entry) => ({
  id: entry.id,
  kind: "groupset" as const,
  brand: entry.brand,
  model: entry.model,
  spec: entry.spec,
}));

export const wheelsetCatalog = wheelsetEntries.map((entry) => ({
  id: entry.id,
  kind: "wheelset" as const,
  brand: entry.brand,
  model: entry.model,
  category: entry.category,
  depthMm: entry.depthMm ?? entry.rimDepthFrontMm ?? null,
  weightGrams: entry.weightGrams ?? null,
  price: entry.price,
  availability: entry.availability,
  productStatus: entry.productStatus,
  notes: entry.notes ?? [],
}));

export const componentCatalog = giantCadexComponents.map((entry) => ({
  id: entry.id,
  kind: entry.category as ComponentCatalogKind,
  brand: entry.brand,
  model: entry.model,
  weightGrams: entry.weightGrams ?? null,
  price: entry.price,
  availability: entry.availability,
  priceUnit: entry.priceUnit ?? null,
  productStatus: entry.productStatus,
}));

/** Drivetrain SKUs that must stay distinct (11-34 is not 11-36). */
export const drivetrainSkus = shimano105DrivetrainSkus;

/** Brake groups modelled as exact components rather than an ambiguous "brake". */
export const exactBrakeGroups = brakeGroups;

export {
  wheelsetIngestionTargets,
  wheelsetTargetFamilies,
  groupsetEntries,
  wheelsetEntries,
  giantCadexComponents,
};

export const componentCatalogStats = () => ({
  groupsets: groupsetCatalog.length,
  wheelsets: wheelsetCatalog.length,
  components: componentCatalog.length,
  drivetrainSkus: drivetrainSkus.length,
  brakeGroups: exactBrakeGroups.length,
  wheelsetIngestionTargets: wheelsetIngestionTargets.length,
});