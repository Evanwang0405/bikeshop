import type { Bicycle } from "@/types/catalog";
import { catalog } from "@/data/catalog";
import { convertToRmb } from "@/types/sourcing";
import type { BikeQuery } from "./parseBikeQuery";

export type RankedCatalogBike = Bicycle & {
  score: number;
  reason: string;
  tradeoff: string;
  label: "最适合你" | "性价比选择" | "可以多看一眼";
  /** Score contributions, so the UI can explain *why* price was not the only factor. */
  breakdown: { budgetFit: number; styleMatch: number; positioning: number; components: number; value: number };
};

/** Tags the ranking engine looks for per intent. */
const INTENT_TAGS: Record<BikeQuery["intent"], string[]> = {
  climbing: ["climbing", "lightweight", "all-round", "race"],
  aero: ["aero", "speed", "flat-road", "sprint", "race"],
  endurance: ["endurance", "comfort", "long-distance"],
  beginner: ["beginner", "entry", "value", "comfort"],
  gravel: ["gravel", "adventure", "mixed-surface"],
  "all-round": ["all-round", "race", "endurance"],
};

/** Positioning words that mean "this is not a nervous race bike". */
const RELAXED_TAGS = ["comfort", "endurance", "long-distance", "beginner"];
/** Positioning words that mean "this bike is aggressive". */
const AGGRESSIVE_TAGS = ["aggressive", "sprint", "race", "aero"];

function candidatePool(): Bicycle[] {
  // Only complete bikes with a loadable factory build are recommendable: the whole
  // point is that "用这辆车开始选配" produces a full build, not an empty frame.
  return catalog.filter(
    (bike) => bike.productType === "complete-bike" && bike.factoryBuild && Object.keys(bike.factoryBuild).length > 0,
  );
}

/**
 * Rank bicycles against the parsed query.
 *
 * Price is ONE feature, never the verdict: a ¥30,000 bike is not automatically
 * better for every rider than a ¥15,000 one. The score is composed of budget fit,
 * riding-style/tag match, geometry positioning, component level and value, and the
 * breakdown is returned so the UI can show the reasoning.
 */
export function rankBikes(_legacyBikes: unknown[] | undefined, query: BikeQuery): RankedCatalogBike[] {
  const pool = candidatePool();
  const wanted = INTENT_TAGS[query.intent];

  const scored = pool.map((bike) => {
    const tags = new Set([...bike.recommendationTags, ...bike.ridingStyle]);

    // --- style match: how many of the intent's tags this product carries
    const styleMatch = wanted.reduce((score, tag) => score + (tags.has(tag) ? 12 : 0), 0);

    // --- positioning: honour an explicit request for a relaxed position
    let positioning = 0;
    if (query.wantsRelaxedPosition) {
      positioning += RELAXED_TAGS.filter((tag) => tags.has(tag)).length * 6;
      positioning -= AGGRESSIVE_TAGS.filter((tag) => tags.has(tag)).length * 4;
    } else if (query.intent === "aero" || query.intent === "climbing") {
      positioning += AGGRESSIVE_TAGS.filter((tag) => tags.has(tag)).length * 3;
    }

    // --- component level / completeness, not price
    const buildSlots = Object.values(bike.factoryBuild ?? {}).filter(Boolean).length;
    const components = Math.min(buildSlots, 12) * 0.8 + (bike.groupset?.toLowerCase().includes("di2") || bike.groupset?.toLowerCase().includes("axs") ? 6 : 0);

    // --- value: verified weight and known frame material are signals, price is not
    let value = 0;
    if (bike.frameMaterial) value += 3;
    if (bike.weights.length) value += 3;
    if (bike.dataQuality === "official") value += 2;
    if (tags.has("value")) value += 4;

    // --- budget fit: only runs against the RMB figure shown on the site.
    // A converted foreign price is still comparable once converted, so it counts;
    // an unknown price contributes nothing rather than defaulting to zero.
    let budgetFit = 0;
    const budgetRmb: number | undefined =
      query.budget === undefined
        ? undefined
        : query.budgetCurrency === "USD"
          ? (convertToRmb(query.budget, "USD") ?? undefined)
          : query.budget;
    const bikeRmb = bike.price.rmb;
    if (budgetRmb !== undefined && bikeRmb !== null) {
      const difference = bikeRmb - budgetRmb;
      budgetFit =
        difference <= 0
          ? Math.max(0, 45 - (Math.abs(difference) / budgetRmb) * 30)
          : Math.max(-35, 35 - (difference / budgetRmb) * 80);
    } else if (query.budget && bikeRmb === null) {
      // Unknown price: neutral, and never treated as free.
      budgetFit = 0;
    }

    const score = styleMatch + positioning + components + value + budgetFit;
    return { bike, score, breakdown: { budgetFit, styleMatch, positioning, components, value } };
  });

  return scored
    .sort((left, right) => right.score - left.score)
    .slice(0, 3)
    .map(({ bike, score, breakdown }, index) => ({
      ...bike,
      score,
      breakdown,
      reason: reasonFor(bike, query, breakdown),
      tradeoff: tradeoffFor(bike, query),
      label: index === 0 ? "最适合你" : index === 1 ? "性价比选择" : "可以多看一眼",
    }));
}

function reasonFor(
  bike: Bicycle,
  query: BikeQuery,
  breakdown: RankedCatalogBike["breakdown"],
): string {
  const budget = query.budget
    ? `预算约 ${query.budgetCurrency === "USD" ? "US$" : "¥"}${query.budget.toLocaleString()}`
    : "没有设定固定预算";
  const intentReasons: Record<BikeQuery["intent"], string> = {
    climbing: "车系定位为轻量全能与爬坡取向",
    aero: "车系定位为气动竞赛与平路高速取向",
    endurance: "车系定位为耐力舒适与长距离取向",
    beginner: "配置可靠、定位克制，适合作为第一辆公路车",
    gravel: "车系定位为砾石与混合路面",
    "all-round": "车系定位为综合全能，适用面较广",
  };
  const parts = [`${budget}，${intentReasons[query.intent]}。`];
  if (breakdown.value > 0) parts.push("同时具备可核实的材质或重量数据，属于有据可查的选择。");
  if (query.wantsRelaxedPosition && RELAXED_TAGS.some((tag) => bike.recommendationTags.includes(tag))) {
    parts.push("几何更偏舒适，符合你“不要太激进”的要求。");
  }
  return parts.join("");
}

function tradeoffFor(bike: Bicycle, query: BikeQuery): string {
  const unknown: string[] = [];
  if (bike.price.rmb === null) unknown.push("官方价格");
  if (!bike.weights.length) unknown.push("整车重量");
  const dataNote = unknown.length ? ` 该车系的${unknown.join("与")}尚未取得可核实数据，因此未参与价格或重量比较。` : "";

  const bikeRmb = bike.price.rmb;
  const budgetRmb: number | undefined =
    query.budget === undefined
      ? undefined
      : query.budgetCurrency === "USD"
        ? (convertToRmb(query.budget, "USD") ?? undefined)
        : query.budget;

  if (budgetRmb !== undefined && bikeRmb !== null && bikeRmb > budgetRmb) {
    return `价格高于你的预算约 ¥${(bikeRmb - budgetRmb).toLocaleString("zh-CN")}。${dataNote}`;
  }
  if (query.intent === "aero") return `气动车通常在低速爬坡和舒适性上会做取舍。${dataNote}`;
  if (query.intent === "climbing") return `相对纯气动车，平路高速的空气动力学优势较少。${dataNote}`;
  if (query.intent === "beginner") return `入门配置的重量与竞赛级零件不如高端车型。${dataNote}`;
  return `如果你追求单一方向的极致表现，可以再看更专门的气动或爬坡车系。${dataNote}`;
}
