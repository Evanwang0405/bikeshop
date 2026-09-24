import type { Component } from "@/types";

export type ProductSort =
  | "default"
  | "brand-asc"
  | "brand-desc"
  | "price-asc"
  | "price-desc"
  | "weight-asc"
  | "weight-desc";

function compareKnownNumbers(left: number | null | undefined, right: number | null | undefined, direction: 1 | -1): number {
  const leftKnown = typeof left === "number" && Number.isFinite(left);
  const rightKnown = typeof right === "number" && Number.isFinite(right);
  if (!leftKnown && !rightKnown) return 0;
  if (!leftKnown) return 1;
  if (!rightKnown) return -1;
  return (left - right) * direction;
}

export function sortProducts(products: Component[], sort: ProductSort): Component[] {
  if (sort === "default") return [...products];

  return [...products].sort((left, right) => {
    if (sort === "brand-asc" || sort === "brand-desc") {
      const brandResult = left.brand.localeCompare(right.brand, "zh-CN", { sensitivity: "base" });
      if (brandResult !== 0) return sort === "brand-asc" ? brandResult : -brandResult;
      const modelResult = left.model.localeCompare(right.model, "zh-CN", { sensitivity: "base" });
      return sort === "brand-asc" ? modelResult : -modelResult;
    }

    if (sort === "price-asc" || sort === "price-desc") {
      return compareKnownNumbers(left.price, right.price, sort === "price-asc" ? 1 : -1);
    }

    return compareKnownNumbers(left.weight, right.weight, sort === "weight-asc" ? 1 : -1);
  });
}
