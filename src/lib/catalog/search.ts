import { catalog, brandAliases, families } from "@/data/catalog";
import type { Bicycle, BicycleCategory, BicycleFamily, ProductType } from "@/types/catalog";
import { normalizeSearchTerm, scoreTerm, tokenizeQuery, displayName, type SearchTokens } from "./normalize";
import { hasLoadableFactoryBuild } from "./stats";

export type CatalogFilters = {
  query?: string;
  brand?: string;
  family?: string;
  category?: BicycleCategory;
  productType?: ProductType;
  /** Only products whose identity within the family is fully known. */
  currentOnly?: boolean;
  /** Upper bound on verified price, in the product's own currency. */
  maxPrice?: number;
  currency?: "CNY" | "USD" | "EUR";
};

export type ScoredBicycle = {
  bike: Bicycle;
  score: number;
  /** Which level the query matched, for explaining results in the UI. */
  matchedOn: "brand" | "family" | "tier" | "trim" | "alias" | "id" | "all";
};

/**
 * Score a single bicycle against a query.
 *
 * Identity fields (brand / family / tier / trim) are weighted above aliases, so a
 * query for "TCR Advanced" prefers the real TCR Advanced records over anything
 * that merely mentions TCR in an alias list.
 */
export function scoreBicycle(bike: Bicycle, tokens: SearchTokens): { score: number; matchedOn: ScoredBicycle["matchedOn"] } {
  const identityCandidates: [string, number, ScoredBicycle["matchedOn"]][] = [
    [bike.brand, 1.2, "brand"],
    [bike.brandCN ?? "", 1.2, "brand"],
    [bike.family, 1.15, "family"],
    [bike.generation ?? "", 0.9, "family"],
    [bike.tier ?? "", 1.05, "tier"],
    [bike.trim ?? "", 1.0, "trim"],
    [bike.id, 0.6, "id"],
  ];

  let best = 0;
  let matchedOn: ScoredBicycle["matchedOn"] = "all";

  for (const [candidate, weight, level] of identityCandidates) {
    if (!candidate) continue;
    const score = scoreTerm(candidate, tokens, weight);
    if (score > best) {
      best = score;
      matchedOn = level;
    }
  }

  for (const alias of bike.aliases) {
    const score = scoreTerm(alias, tokens, 0.95);
    if (score > best) {
      best = score;
      matchedOn = "alias";
    }
  }

  // A combined phrase match on the full display name catches "捷安特TCR ADV".
  const combined = scoreTerm(displayName(bike), tokens, 0.8);
  if (combined > best) {
    best = combined;
    matchedOn = "all";
  }

  return { score: best, matchedOn };
}

/** Brand-level alias resolution so 锐豹 lands on Pardus without creating a duplicate. */
export function resolveBrandFromQuery(query: string): string | undefined {
  const normalized = normalizeSearchTerm(query);
  if (!normalized) return undefined;
  for (const [brand, aliases] of Object.entries(brandAliases)) {
    for (const alias of [brand, ...aliases]) {
      const normalizedAlias = normalizeSearchTerm(alias);
      if (normalizedAlias && normalized.includes(normalizedAlias)) return brand;
    }
  }
  return undefined;
}

export function searchCatalog(filters: CatalogFilters = {}): ScoredBicycle[] {
  const raw = filters.query?.trim() ?? "";
  const tokens = tokenizeQuery(raw);
  const brandHint = raw ? resolveBrandFromQuery(raw) : undefined;

  const results: ScoredBicycle[] = [];

  for (const bike of catalog) {
    if (filters.brand && bike.brand !== filters.brand) continue;
    if (filters.family && normalizeSearchTerm(bike.family) !== normalizeSearchTerm(filters.family)) continue;
    if (filters.category && bike.category !== filters.category) continue;
    if (filters.productType && bike.productType !== filters.productType) continue;
    if (filters.currentOnly && bike.productStatus !== "current") continue;
    if (filters.currency) {
      if (!bike.price || bike.price.currency !== filters.currency) continue;
      if (filters.maxPrice !== undefined && bike.price.amount > filters.maxPrice) continue;
    }

    if (!raw) {
      results.push({ bike, score: 0, matchedOn: "all" });
      continue;
    }

    const { score, matchedOn } = scoreBicycle(bike, tokens);
    // A brand alias hit is enough to keep the record in the result set.
    const brandBoost = brandHint && bike.brand === brandHint ? 25 : 0;
    const total = score + brandBoost;
    if (total > 0) results.push({ bike, score: total, matchedOn: brandBoost > score ? "brand" : matchedOn });
  }

  if (!raw) return results;

  return results.sort((left, right) => {
    if (right.score !== left.score) return right.score - left.score;
    // Prefer complete bikes over framesets on a tie: a rider searching a model
    // name almost always wants the bike, not the bare frame.
    if (left.bike.productType !== right.bike.productType) return left.bike.productType === "complete-bike" ? -1 : 1;
    // Then prefer current products.
    if (left.bike.productStatus !== right.bike.productStatus) return left.bike.productStatus === "current" ? -1 : 1;
    // Then products a rider can actually load into the Workshop.
    const leftLoadable = hasLoadableFactoryBuild(left.bike) ? 0 : 1;
    const rightLoadable = hasLoadableFactoryBuild(right.bike) ? 0 : 1;
    if (leftLoadable !== rightLoadable) return leftLoadable - rightLoadable;
    // Then cheapest, but only among prices quoted in the same currency.
    if (left.bike.price && right.bike.price && left.bike.price.currency === right.bike.price.currency) {
      return left.bike.price.amount - right.bike.price.amount;
    }
    if (left.bike.price && !right.bike.price) return -1;
    if (!left.bike.price && right.bike.price) return 1;
    return 0;
  });
}

/** Brand → family → variant browsing without requiring all three levels. */
export type FamilyBrowseNode = {
  family: BicycleFamily;
  products: Bicycle[];
};

export function browseByBrand(brand?: string): Record<string, FamilyBrowseNode[]> {
  const grouped: Record<string, FamilyBrowseNode[]> = {};
  const source = brand ? families.filter((family) => family.brand === brand) : families;
  for (const family of source) {
    const products = catalog.filter(
      (bike) => bike.brand === family.brand && normalizeSearchTerm(bike.family) === normalizeSearchTerm(family.family),
    );
    grouped[family.brand] = [...(grouped[family.brand] ?? []), { family, products }];
  }
  return grouped;
}

export function getBicycle(id: string): Bicycle | undefined {
  return catalog.find((bike) => bike.id === id);
}

export function bicyclesByFamily(brand: string, family: string): Bicycle[] {
  return catalog.filter(
    (bike) => bike.brand === brand && normalizeSearchTerm(bike.family) === normalizeSearchTerm(family),
  );
}

export type { SearchTokens };