export type BikeIntent = "climbing" | "aero" | "endurance" | "beginner" | "all-round";

export type BikeQuery = {
  raw: string;
  budget?: number;
  intent: BikeIntent;
  preferences: string[];
};

function parseBudget(query: string): number | undefined {
  const chineseNumbers: Record<string, number> = { 一: 1, 二: 2, 两: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9, 十: 10 };
  const chineseTenThousands = query.match(/([一二两三四五六七八九十])\s*万/);
  if (chineseTenThousands) return (chineseNumbers[chineseTenThousands[1]] ?? 0) * 10000;
  const tenThousands = query.match(/(\d+(?:\.\d+)?)\s*万/);
  if (tenThousands) return Number(tenThousands[1]) * 10000;
  const budgetMatch = query.match(/(?:预算|大约|左右|约|最多|以内)?\s*[$¥￥]?\s*(\d[\d,]*(?:\.\d+)?)/);
  if (!budgetMatch) return undefined;
  return Number(budgetMatch[1].replaceAll(",", ""));
}

const intentKeywords: Record<Exclude<BikeIntent, "all-round">, string[]> = {
  climbing: ["爬坡", "轻量", "山路", "爬山", "climbing", "lightweight"],
  aero: ["气动", "平路", "巡航", "速度", "冲刺", "aero", "fast", "竞速"],
  endurance: ["舒服", "舒适", "长途", "骑很久", "耐力", "endurance", "不激进", "通勤"],
  beginner: ["新手", "第一辆", "入门", "beginner", "性价比", "好维护"],
};

export function parseBikeQuery(raw: string): BikeQuery {
  const query = raw.trim().toLowerCase();
  const matched = (Object.entries(intentKeywords) as [Exclude<BikeIntent, "all-round">, string[]][]).find(([, keywords]) => keywords.some((keyword) => query.includes(keyword)));
  const intent = matched?.[0] ?? (query.includes("综合") || query.includes("全能") || query.includes("all-round") ? "all-round" : "all-round");
  const preferences = matched ? matched[1].filter((keyword) => query.includes(keyword)) : ["综合表现"];
  return { raw, budget: parseBudget(query), intent, preferences };
}
