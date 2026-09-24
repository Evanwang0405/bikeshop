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
    price: { rmb: null, priceType: "unknown", note: "SEKA 中国官网未公布车架组 MSRP。" },
    /**
     * FX-converted reference only: this is a foreign MSRP converted at the
     * 2026-09-24 rate, NOT a China price. The weight list below mixes a bare-frame
     * development target with a painted frame figure, so both are labelled.
     */
    referencePrice: {
      rmb: 20127,
      priceType: "fx-converted-reference",
      sourcePrice: 2999,
      sourceCurrency: "USD",
      referencePriceRmb: 20127,
      fxDate: "2026-09-24",
      note: "海外官方参考价折算，不是中国官方建议零售价。",
    },
    weights: [
      {
        grams: 685,
        weightType: "bare-frame",
        size: "M",
        paintIncluded: false,
        hardwareIncluded: false,
        sourceQuality: "manufacturer",
        note: "官方 RDC 裸车架开发目标约 685 g，不含漆、不含五金。裸车架实验室重量，既不是车架组重量，也不是整车重量。",
      },
      {
        grams: 729,
        weightType: "frame",
        size: "M",
        paintIncluded: true,
        toleranceGrams: 35,
        sourceQuality: "manufacturer",
        note: "Shadow Black 涂装 M 码车架约 729 g ±35 g，含漆。",
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
      "685 g 是裸车架开发目标值，绝不可当作车架组或整车重量显示。",
      "729 g ±35 g 为 Shadow Black 涂装 M 码车架，含漆。",
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
    price: { rmb: null, priceType: "unknown", note: "SEKA 中国官网未公布车架组 MSRP。" },
    /** FX-converted reference only — never a China MSRP. */
    referencePrice: {
      rmb: 16772,
      priceType: "fx-converted-reference",
      sourcePrice: 2499,
      sourceCurrency: "USD",
      referencePriceRmb: 16772,
      fxDate: "2026-09-24",
      note: "海外官方参考价折算，不是中国官方建议零售价。",
    },
    weights: [
      {
        grams: 775,
        weightType: "bare-frame",
        size: "M",
        toleranceGrams: 30,
        sourceQuality: "manufacturer",
        note: "官方 EXCEED RDC M 码裸车架约 775 g ±30 g。裸车架重量，不等于车架组或整车重量。",
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