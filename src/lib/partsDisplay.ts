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

/**
 * How a bicycle price should be labelled.
 *
 * A converted foreign MSRP must never read like a China MSRP: the two answer
 * different questions and a buyer acting on the wrong one would be misled.
 */
export type PriceLabelKind = "china-msrp" | "foreign-reference" | "retailer" | "historical" | "unknown";

export function priceLabelKind(price: { rmb: number | null; priceType: string }): PriceLabelKind {
  if (price.rmb === null) return "unknown";
  switch (price.priceType) {
    case "china-msrp":
      return "china-msrp";
    case "fx-converted-reference":
      return "foreign-reference";
    case "retailer-reference":
      return "retailer";
    case "historical":
      return "historical";
    default:
      return "unknown";
  }
}

export const PRICE_LABEL_TEXT: Record<PriceLabelKind, string> = {
  "china-msrp": "中国官方建议零售价",
  "foreign-reference": "海外官方参考价折算",
  retailer: "经销商参考价",
  historical: "历史 / 市场参考价",
  unknown: "价格暂无可靠数据",
};

/** Rendered price plus the caption that says what kind of figure it is. */
export function bicyclePriceDisplay(price: {
  rmb: number | null;
  priceType: string;
  sourcePrice?: number | null;
  sourceCurrency?: string | null;
  fxDate?: string | null;
}): { text: string; caption: string; kind: PriceLabelKind } {
  const kind = priceLabelKind(price);
  if (kind === "unknown" || price.rmb === null) {
    return { text: PRICE_LABEL_TEXT.unknown, caption: "", kind };
  }
  const source =
    price.sourcePrice && price.sourceCurrency
      ? `（${price.sourceCurrency} ${price.sourcePrice.toLocaleString("en-US")}${price.fxDate ? ` · ${price.fxDate} 汇率` : ""}）`
      : "";
  return { text: formatCny(price.rmb), caption: PRICE_LABEL_TEXT[kind] + source, kind };
}

/** Human label for a weight type, so a bare-frame figure cannot be mistaken. */
export const WEIGHT_TYPE_TEXT: Record<string, string> = {
  "complete-bike": "整车",
  frameset: "车架组",
  "bare-frame": "裸车架",
  frame: "车架",
  wheelset: "轮组",
  groupset: "套件",
  component: "零件",
};

export function bicycleWeightDisplay(weight: {
  grams: number;
  weightType: string;
  size?: string | null;
  paintIncluded?: boolean | null;
}): string {
  const type = WEIGHT_TYPE_TEXT[weight.weightType] ?? weight.weightType;
  const size = weight.size ? ` ${weight.size} 码` : "";
  const paint = weight.paintIncluded === false ? "·不含漆" : weight.paintIncluded === true ? "·含漆" : "";
  return `${(weight.grams / 1000).toFixed(2)} kg（${type}${size}${paint}）`;
}

export function priceDisplay(component: Component): MoneyDisplay {
  const basis = component.priceBasis ?? "unknown";

  if (basis === "included") return { text: "原厂配置", kind: "included" };
  if (basis === "unknown" || component.price <= 0) return { text: "价格未知", kind: "unknown" };
  if (basis === "estimated") return { text: `${formatCny(component.price)} 示例`, kind: "estimated" };

  return { text: formatCny(component.price), kind: "verified" };
}

/**
 * Caption naming *what kind of figure* a price is.
 *
 * Both a China MSRP and a converted foreign reference are real numbers, so both
 * render as a value — but only one of them is the price a buyer in China would
 * actually pay. That difference is carried in the caption, never dropped.
 */
export function priceCaption(component: Component): string {
  if (component.priceBasis === "included") return "已含在整车价格内";
  if (component.priceBasis === "unknown" || component.price <= 0) return "官方未公布单独零售价";
  if (component.priceProvenance === "foreign-reference") return "海外官方参考价折算";
  if (component.priceProvenance === "retailer") return "经销商参考价";
  if (component.priceProvenance === "historical") return "历史 / 市场参考价";
  return "";
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