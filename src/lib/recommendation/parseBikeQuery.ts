export type BikeIntent = "climbing" | "aero" | "endurance" | "beginner" | "all-round" | "gravel";

export type BikeQuery = {
  raw: string;
  budget?: number;
  budgetCurrency: "CNY" | "USD";
  intent: BikeIntent;
  preferences: string[];
  /** True when the rider explicitly asked for a low-aggression position. */
  wantsRelaxedPosition: boolean;
};

const CHINESE_NUMERALS: Record<string, number> = {
  一: 1, 二: 2, 两: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9, 十: 10,
};

export function parseBudget(query: string): { amount?: number; currency: "CNY" | "USD" } {
  // 万 = 10,000 — the most common way Chinese riders quote a budget.
  const chineseTenThousands = query.match(/([一二两三四五六七八九十])\s*万/);
  if (chineseTenThousands) return { amount: (CHINESE_NUMERALS[chineseTenThousands[1]] ?? 0) * 10000, currency: "CNY" };

  const tenThousands = query.match(/(\d+(?:\.\d+)?)\s*万/);
  if (tenThousands) return { amount: Number(tenThousands[1]) * 10000, currency: "CNY" };

  const thousands = query.match(/(\d+(?:\.\d+)?)\s*[kK](?![a-zA-Z])/);
  if (thousands) return { amount: Number(thousands[1]) * 1000, currency: "CNY" };

  const usd = query.match(/\$\s*(\d[\d,]*(?:\.\d+)?)/);
  if (usd) return { amount: Number(usd[1].replaceAll(",", "")), currency: "USD" };

  const cny = query.match(/[¥￥]\s*(\d[\d,]*(?:\.\d+)?)/);
  if (cny) return { amount: Number(cny[1].replaceAll(",", "")), currency: "CNY" };

  const bare = query.match(/(?:预算|大约|左右|约|最多|以内|不超过)\s*(\d[\d,]*(?:\.\d+)?)/);
  if (bare) return { amount: Number(bare[1].replaceAll(",", "")), currency: "CNY" };

  return { currency: "CNY" };
}

const INTENT_KEYWORDS: Record<BikeIntent, string[]> = {
  climbing: ["爬坡", "爬山", "轻量", "山路", "坡多", "climbing", "climb", "lightweight", "上坡"],
  aero: ["气动", "平路", "巡航", "速度", "冲刺", "破风", "aero", "fast", "竞速", "sprint"],
  endurance: ["舒服", "舒适", "长途", "耐力", "骑很久", "不激进", "通勤", "endurance", "comfort"],
  beginner: ["新手", "第一辆", "入门", "初学", "beginner", "性价比", "好维护", "预算有限", "学生"],
  gravel: ["砾石", "碎石", "gravel", "越野", "冒险", "旅行"],
  "all-round": ["综合", "全能", "全面", "all-round", "均衡"],
};

/** Order matters: more specific intents are checked first. */
const INTENT_ORDER: BikeIntent[] = ["gravel", "beginner", "climbing", "aero", "endurance", "all-round"];

const RELAXED_MARKERS = ["不激进", "舒适", "别太激进", "不要太激进", "耐力几何", "放松"];

export function parseBikeQuery(raw: string): BikeQuery {
  const query = raw.trim().toLowerCase();
  const { amount, currency } = parseBudget(query);

  let intent: BikeIntent = "all-round";
  let preferences: string[] = [];
  for (const candidate of INTENT_ORDER) {
    const hits = INTENT_KEYWORDS[candidate].filter((keyword) => query.includes(keyword));
    if (hits.length) {
      intent = candidate;
      preferences = hits;
      break;
    }
  }

  if (!preferences.length) preferences = ["综合表现"];

  return {
    raw,
    budget: amount,
    budgetCurrency: currency,
    intent,
    preferences,
    wantsRelaxedPosition: RELAXED_MARKERS.some((marker) => query.includes(marker)),
  };
}
