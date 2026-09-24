import type { CatalogSource, SourceTier } from "@/types/catalog";

/** Date every record in this seed batch was read from its manufacturer source. */
export const RETRIEVED_AT = "2026-09-23";

export function source(
  manufacturer: string,
  productUrl: string,
  options: {
    catalogUrl?: string;
    region?: string;
    sourceTier?: SourceTier;
    modelPageVerified?: boolean;
    retrievedAt?: string;
  } = {},
): CatalogSource {
  return {
    manufacturer,
    productUrl,
    catalogUrl: options.catalogUrl,
    region: options.region ?? "CN",
    sourceTier: options.sourceTier ?? 1,
    modelPageVerified: options.modelPageVerified ?? false,
    retrievedAt: options.retrievedAt ?? RETRIEVED_AT,
  };
}

/** Build a stable id from the identity tuple, keeping Chinese names readable. */
export function catalogId(...parts: (string | number | null | undefined)[]): string {
  return parts
    .filter((part): part is string | number => part !== null && part !== undefined && part !== "")
    .map((part) =>
      String(part)
        .toLowerCase()
        .replace(/['’]/g, "")
        .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
        .replace(/^-+|-+$/g, ""),
    )
    .join("-");
}