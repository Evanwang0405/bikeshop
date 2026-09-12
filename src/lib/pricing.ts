import type { Component } from "@/types/bike";

export type PriceSummary = {
  partsSubtotal: number;
  totalWeight: number;
  baseBikePrice: number;
  modificationSpend: number;
};

export function calculatePrice(components: Component[], baseBikePrice = 0, factorySelections: Partial<Record<Component["category"], string>> = {}): PriceSummary {
  const totals = components.reduce(
    (summary, component) => ({
      partsSubtotal: summary.partsSubtotal + component.price,
      totalWeight: summary.totalWeight + component.weight,
    }),
    { partsSubtotal: 0, totalWeight: 0 },
  );
  const modificationSpend = components.reduce((total, component) => total + (factorySelections[component.category] === component.id ? 0 : component.price), 0);
  return { ...totals, baseBikePrice, modificationSpend };
}
