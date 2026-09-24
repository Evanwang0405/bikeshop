import type { Bicycle } from "@/types/catalog";
import { giantBicycles } from "./giant";
import { giantFramesets } from "./giant-framesets";
import { meridaBicycles } from "./merida";
import { pardusBicycles } from "./pardus";
import { campBicycles } from "./camp";
import { xdsBicycles } from "./xds";
import { sekaBicycles } from "./seka";
import { winspaceBicycles } from "./winspace";

/**
 * The China-market road bicycle catalogue.
 *
 * Adding a brand is a one-line change here: drop a new module in
 * `src/data/catalog/`, export its array, and append it. Nothing else in the app
 * needs to know how many brands exist.
 */
export const catalog: Bicycle[] = [
  ...giantBicycles,
  ...giantFramesets,
  ...meridaBicycles,
  ...pardusBicycles,
  ...campBicycles,
  ...xdsBicycles,
  ...sekaBicycles,
  ...winspaceBicycles,
];

export { brands, brandByName, brandAliases, families, familiesByBrand, familyKey } from "./taxonomy";
export { rejectedProducts } from "./rejected";
export { RETRIEVED_AT } from "./helpers";

export { giantBicycles, meridaBicycles, pardusBicycles, campBicycles, xdsBicycles, sekaBicycles, winspaceBicycles };
export { giantFramesets };