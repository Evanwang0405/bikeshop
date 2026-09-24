import type { Bicycle } from "@/types/catalog";

/**
 * GIANT — framesets sourced from the official *global* catalogue (Tier 2).
 *
 * Kept in its own module for two reasons:
 *   1. `giant.ts` is generated from the China site and must stay purely generated.
 *   2. Source provenance differs. These are Tier-2 (official global) records priced
 *      in USD, whereas `giant.ts` records are Tier-1 (official China) priced in CNY.
 *      Mixing them in one file would blur which page a number came from.
 *
 * Framesets and complete bikes are ALWAYS separate `productType` values, so a
 * frameset record can never be mistaken for a bike with missing parts.
 *
 * Prices are kept in their source currency. They are never converted to CNY.
 */

const US_ROAD = "https://www.giant-bicycles.com/us/bikes/road-bikes";
const RETRIEVED_AT = "2026-09-23";

const GIANT_SIZES = ["XS", "S", "M", "M/L", "L", "XL"];

export const giantFramesets: Bicycle[] = [
  {
    id: "giant-tcr-advanced-sl-frameset",
    brand: "Giant",
    brandCN: "捷安特",
    family: "TCR",
    generation: "2025 platform",
    tier: "Advanced SL",
    trim: "Frameset",
    modelYear: 2025,
    category: "all-round-road",
    productType: "frameset",
    productStatus: "unknown",
    ridingStyle: ["全能竞赛", "爬坡", "竞赛车架组"],
    recommendationTags: ["all-round", "climbing", "lightweight", "race", "premium"],
    price: { rmb: 4400, priceType: "manufacturer-msrp", sourceCurrency: "USD", market: "US" },
    priceNote: "US 官方 2025 目录价格 US$4,400，维持原币种，未转换为人民币。",
    weights: [],
    frameMaterial: "Advanced SL-Grade Composite",
    sizes: GIANT_SIZES,
    frameSpecs: { wheelSize: "700c", carbonGrade: "Advanced SL" },
    factoryBuild: {
      frame: "GIANT TCR Advanced SL-Grade Composite 车架",
      fork: "Advanced SL-Grade Composite 前叉",
    },
    aliases: ["TCR Advanced SL Frameset", "TCR ADV SL 车架组", "捷安特TCR SL车架组", "捷安特TCR车架"],
    source: {
      manufacturer: "Giant",
      productUrl: "https://www.giant-bicycles.com/us/bikes-tcr-advanced-sl-frameset-2025",
      catalogUrl: US_ROAD,
      region: "US",
      retrievedAt: RETRIEVED_AT,
      sourceTier: 2,
      modelPageVerified: true,
    },
    dataQuality: "official",
    notes: [
      "官方全球站（Tier 2）车架组记录，与中国站整车记录分列。",
      "车架组与整车是不同 productType，永不合并。",
    ],
  },
  {
    id: "giant-propel-advanced-pro-frameset-2027",
    brand: "Giant",
    brandCN: "捷安特",
    family: "Propel",
    generation: "2027 platform",
    tier: "Advanced Pro",
    trim: "Frameset",
    modelYear: 2027,
    category: "aero-road",
    productType: "frameset",
    productStatus: "current",
    ridingStyle: ["气动竞赛", "竞赛车架组"],
    recommendationTags: ["aero", "race", "speed", "premium"],
    price: { rmb: 3200, priceType: "manufacturer-msrp", sourceCurrency: "USD", market: "US" },
    priceNote: "US 官方 2027 目录价格 US$3,200，维持原币种。",
    weights: [],
    frameMaterial: "Advanced-Grade Composite（气动管型）",
    sizes: GIANT_SIZES,
    frameSpecs: { wheelSize: "700c", carbonGrade: "Advanced" },
    factoryBuild: {
      frame: "GIANT Propel Advanced-Grade Composite 气动车架",
      fork: "Advanced-Grade Composite 气动前叉",
    },
    aliases: ["Propel Advanced Pro Frameset", "Propel ADV Pro 车架组", "捷安特Propel车架组", "PP车架组"],
    source: {
      manufacturer: "Giant",
      productUrl: "https://www.giant-bicycles.com/us/bikes-propel-advanced-pro-frameset-2027",
      catalogUrl: US_ROAD,
      region: "US",
      retrievedAt: RETRIEVED_AT,
      sourceTier: 2,
      modelPageVerified: true,
    },
    dataQuality: "official",
    notes: ["官方目录中同时存在 2027 版与更早的车架组页面，此处按 modelYear 分开保存。"],
  },
  {
    id: "giant-propel-advanced-sl-frameset",
    brand: "Giant",
    brandCN: "捷安特",
    family: "Propel",
    generation: "2026 platform",
    tier: "Advanced SL",
    trim: "Frameset",
    modelYear: 2026,
    category: "aero-road",
    productType: "frameset",
    productStatus: "current",
    ridingStyle: ["气动竞赛", "顶级竞赛车架组"],
    recommendationTags: ["aero", "race", "speed", "premium"],
    price: { rmb: 4300, priceType: "manufacturer-msrp", sourceCurrency: "USD", market: "US" },
    priceNote: "US 官方目录价格 US$4,300，维持原币种。",
    referencePrice: { rmb: 25000, priceType: "historical", sourceCurrency: "CNY", market: "CN", note: "需求提及中国区 Advanced SL 车架组约 ¥25,000 级别、特别/队版约 ¥30,000；本次未在中国站核实到该车架组页面，故仅作参考。", },
    weights: [],
    frameMaterial: "Advanced SL-Grade Composite（气动管型）",
    sizes: GIANT_SIZES,
    frameSpecs: { wheelSize: "700c", carbonGrade: "Advanced SL" },
    factoryBuild: {
      frame: "GIANT Propel Advanced SL-Grade Composite 气动车架",
      fork: "Advanced SL-Grade Composite 气动前叉",
    },
    aliases: ["Propel Advanced SL Frameset", "Propel ADV SL 车架组", "捷安特PP SL车架组"],
    source: {
      manufacturer: "Giant",
      productUrl: "https://www.giant-bicycles.com/us/bikes-propel-advanced-sl-frameset",
      catalogUrl: US_ROAD,
      region: "US",
      retrievedAt: RETRIEVED_AT,
      sourceTier: 2,
      modelPageVerified: true,
    },
    dataQuality: "official",
  },
];