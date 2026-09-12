import type { Component } from "@/types/bike";

export type PriceSummary = {
  partsSubtotal: number;
  totalWeight: number;
};

export function calculatePrice(components: Component[]): PriceSummary {
  return components.reduce(
    (summary, component) => ({
      partsSubtotal: summary.partsSubtotal + component.price,
      totalWeight: summary.totalWeight + component.weight,
    }),
    { partsSubtotal: 0, totalWeight: 0 },
  );
}
