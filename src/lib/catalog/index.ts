export {
  searchCatalog,
  browseByBrand,
  bicyclesByFamily,
  getBicycle,
  resolveBrandFromQuery,
  scoreBicycle,
  type CatalogFilters,
  type ScoredBicycle,
  type FamilyBrowseNode,
} from "./search";

export {
  normalizeSearchTerm,
  displayName,
  slugify,
  tokenizeQuery,
  type SearchTokens,
} from "./normalize";

export {
  buildCatalogReport,
  factoryBuildSlotCount,
  hasCompleteFactoryBuild,
  hasLoadableFactoryBuild,
  hasVerifiedWeight,
  hasVerifiedPrice,
  isStructureOnly,
  COMPLETE_BUILD_THRESHOLD,
  LOADABLE_BUILD_THRESHOLD,
  type CatalogReport,
  type ManufacturerCoverage,
} from "./stats";

export { toWorkshopBuild, missingFactorySlots, factoryBuildSummary, SLOT_TO_CATEGORY, splitBrandModel, type WorkshopLoadResult } from "./workshopLoad";

export {
  derivedComponents,
  derivedComponentStats,
  getDerivedComponent,
  componentsForBike,
  type DerivedComponent,
} from "./derivedComponents";