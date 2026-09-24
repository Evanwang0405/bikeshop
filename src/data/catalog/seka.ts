import type { Bicycle } from "@/types/catalog";
import { catalogId, source } from "./helpers";

/**
 * SEKA — high-end Chinese performance frameset brand.
 *
 * Sources: official China site, read 2026-09-23.
 *   · https://www.sekabikes.com/spear/
 *   · https://www.sekabikes.com/exceed/
 *
 * WEIGHT DISCIPLINE
 * SEKA publishes *bare-frame* development targets. Those are stored with
 * `kind: "bare-frame"` and `paintIncluded: false` so they can never be read as a
 * complete-bike weight. No complete-bike weight is asserted because none is
 * published.
 *
 * SEKA's China site publishes no MSRP, so `price` stays null.
 */

const SEKA_HOME = "https://www.sekabikes.com/";

export const sekaBicycles: Bicycle[] = [
  {
    id: catalogId("seka", "spear", "rdc-frameset"),
    brand: "SEKA",
    family: "SPEAR",
    generation: null,
    tier: "RDC",
    trim: "Frameset",
    modelYear: null,
    category: "aero-road",
    productType: "frameset",
    productStatus: "current",
    ridingStyle: ["气动全能竞赛", "轻量", "高性能"],
    recommendationTags: ["aero", "all-round", "lightweight", "race", "premium"],
    price: null,
    priceNote: "SEKA 中国官网未公布车架组 MSRP。",
    weights: [
      {
        grams: 685,
        kind: "bare-frame",
        size: "M",
        paintIncluded: false,
        note: "官方 RDC 裸车架开发目标约 685 g。裸车架实验室重量，不是整车重量。",
      },
    ],
    frameMaterial: "碳纤维（RDC 等级）",
    sizes: ["M"],
    frameSpecs: { wheelSize: "700c" },
    factoryBuild: {
      frame: "SEKA SPEAR RDC 车架",
    },
    aliases: ["SPEAR", "Spear", "SEKA Spear", "SPEAR RDC", "矛", "SEKA矛"],
    source: source("SEKA", "https://www.sekabikes.com/spear/", { catalogUrl: SEKA_HOME, modelPageVerified: true }),
    dataQuality: "official",
    notes: [
      "官方强调气动开发流程，包含 CFD 与风洞验证。",
      "官方对比数据：SPEAR RDC 相对 Exceed RDC 刚性重量比提升。",
      "裸车架约 685 g 为开发目标值，未按整车重量使用。",
    ],
  },
  {
    id: catalogId("seka", "exceed", "rdc-frameset"),
    brand: "SEKA",
    family: "EXCEED",
    generation: null,
    tier: "RDC",
    trim: "Frameset",
    modelYear: null,
    category: "all-round-road",
    productType: "frameset",
    productStatus: "current",
    ridingStyle: ["全能竞赛", "轻量", "性能"],
    recommendationTags: ["all-round", "lightweight", "race", "performance"],
    price: null,
    priceNote: "SEKA 中国官网未公布车架组 MSRP。",
    weights: [
      {
        grams: 775,
        kind: "bare-frame",
        size: "M",
        paintIncluded: false,
        note: "官方 EXCEED RDC M 码裸车架约 775 g。裸车架重量，不等于整车重量。",
      },
    ],
    frameMaterial: "碳纤维（RDC 等级）",
    sizes: ["M"],
    frameSpecs: { wheelSize: "700c" },
    factoryBuild: {
      frame: "SEKA EXCEED RDC 车架",
    },
    aliases: ["EXCEED", "Exceed", "SEKA Exceed", "EXCEED RDC", "超越", "SEKA超越"],
    source: source("SEKA", "https://www.sekabikes.com/exceed/", { catalogUrl: SEKA_HOME, modelPageVerified: true }),
    dataQuality: "official",
    notes: [
      "官方同时提供车架组型号、车把与零配件页面。",
      "车架重量与整车重量是不同字段，此记录只保存车架重量。",
    ],
  },
];