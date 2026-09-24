import type { Component } from "@/types/bike";

/**
 * Display helpers for money and weight.
 *
 * The Workshop mixes three honest states, and they must never look alike:
 *   1. a real figure from a manufacturer page,
 *   2. a sample figure (present, but illustrative),
 *   3. no figure at all.
 *
 * Rendering (3) as "¥0" is the failure mode this module exists to prevent: a zero
 * reads as "free", not as "unknown".
 */

export type MoneyDisplay = {
  text: string;
  /** What the number actually is, so callers can style or annotate it. */
  kind: "verified" | "included" | "estimated" | "unknown";
};

/** Format a CNY amount. The part catalogue is CNY-only — see products.ts. */
export function formatCny(amount: number): string {
  return `¥${amount.toLocaleString("zh-CN")}`;
}

export function priceDisplay(component: Component): MoneyDisplay {
  const basis = component.priceBasis ?? "unknown";

  if (basis === "included") return { text: "原厂配置", kind: "included" };
  if (basis === "unknown" || component.price <= 0) return { text: "价格未知", kind: "unknown" };
  if (basis === "estimated") return { text: `${formatCny(component.price)} 示例`, kind: "estimated" };

  return { text: formatCny(component.price), kind: "verified" };
}

export type WeightDisplay = {
  text: string;
  kind: "official" | "estimated" | "unknown";
};

export function weightDisplay(component: Component, gramsOverride?: number): WeightDisplay {
  const basis = component.weightBasis ?? "unknown";
  const grams = gramsOverride ?? component.weight;

  if (basis === "unknown" || grams <= 0) return { text: "重量未公布", kind: "unknown" };
  if (basis === "estimated") return { text: `${grams.toLocaleString()} g 示例`, kind: "estimated" };
  return { text: `${grams.toLocaleString()} g`, kind: "official" };
}

/** Short badge used in the parts list so provenance is visible at a glance. */
export function provenanceBadge(component: Component): { text: string; className: string } {
  if (component.specifications?.原厂件 === "是") {
    return { text: "原厂件", className: "prov-real" };
  }
  if (component.dataQuality === "demo") {
    return { text: "示例零件", className: "prov-demo" };
  }
  if (component.dataQuality === "official" || component.dataQuality === "verified") {
    return { text: "已核实", className: "prov-verified" };
  }
  return { text: "部分数据", className: "prov-partial" };
}

/**
 * Whether a build total is meaningful.
 *
 * A total that silently treats unknown prices as zero is a lie: the number looks
 * like a quote. When any selected part has no published price we report the total
 * as incomplete instead.
 */
export function totalDisplay(components: Component[], total: number): {
  text: string;
  complete: boolean;
  unknownCount: number;
} {
  const unknown = components.filter((component) => (component.priceBasis ?? "unknown") === "unknown" || component.price <= 0);
  if (unknown.length) {
    return {
      text: `${formatCny(total)} + ${unknown.length} 项价格未知`,
      complete: false,
      unknownCount: unknown.length,
    };
  }
  const estimated = components.filter((component) => component.priceBasis === "estimated");
  if (estimated.length) {
    return { text: `${formatCny(total)}（含示例价格）`, complete: false, unknownCount: 0 };
  }
  return { text: formatCny(total), complete: true, unknownCount: 0 };
}