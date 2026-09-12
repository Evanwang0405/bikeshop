import type { CompleteBike } from "@/types";
import type { BikeQuery } from "./parseBikeQuery";

export type RankedBike = CompleteBike & { score: number; reason: string; tradeoff: string; label: "最适合你" | "性价比选择" | "可以多看一眼" };

const intentTags: Record<BikeQuery["intent"], string[]> = {
  climbing: ["climbing", "lightweight", "race"],
  aero: ["aero", "sprint", "race"],
  endurance: ["endurance", "all-round"],
  beginner: ["beginner", "value", "endurance"],
  "all-round": ["all-round", "race", "endurance"],
};

function scoreBike(bike: CompleteBike, query: BikeQuery): number {
  const tags = new Set([...(bike.ridingStyle ?? []), ...(bike.tags ?? [])]);
  const purposeScore = intentTags[query.intent].reduce((score, tag) => score + (tags.has(tag) ? 20 : 0), 0);
  if (!query.budget) return purposeScore + (bike.frameMaterial === "carbon" ? 5 : 0);
  const difference = bike.price - query.budget;
  const budgetScore = difference <= 0 ? Math.max(0, 45 - Math.abs(difference) / query.budget * 30) : Math.max(-35, 35 - difference / query.budget * 80);
  return purposeScore + budgetScore + (bike.frameMaterial === "carbon" ? 5 : 0);
}

function reasonFor(bike: CompleteBike, query: BikeQuery): string {
  const budget = query.budget ? `预算约 $${query.budget.toLocaleString()}` : "没有设定固定预算";
  const intentReasons: Record<BikeQuery["intent"], string> = { climbing: "轻量和爬坡取向更符合山路需求", aero: "气动设计和高速效率更适合平路巡航与冲刺", endurance: "舒适几何和长途取向更适合持续骑行", beginner: "配置可靠、价格更克制，适合作为第一辆车", "all-round": "性能、舒适度和适用范围比较均衡" };
  return `${budget}，${intentReasons[query.intent]}。`;
}

function tradeoffFor(bike: CompleteBike, query: BikeQuery): string {
  if (query.budget && bike.price > query.budget) return `价格高于你的预算约 $${(bike.price - query.budget).toLocaleString()}。`;
  if (query.intent === "aero") return "气动车通常更重，低速爬坡和舒适性不是重点。";
  if (query.intent === "climbing") return "相对纯气动车，平路高速的空气动力学优势较少。";
  if (query.intent === "beginner") return "入门配置的重量和竞赛级零件不如高端车型。";
  return "如果你追求单一方向的极致表现，可以再看专门的气动或爬坡车型。";
}

export function rankBikes(bikes: CompleteBike[], query: BikeQuery): RankedBike[] {
  const ranked = bikes.map((bike) => ({ bike, score: scoreBike(bike, query) })).sort((a, b) => b.score - a.score);
  const chosen = ranked.slice(0, 3);
  return chosen.map(({ bike, score }, index) => ({ ...bike, score, reason: reasonFor(bike, query), tradeoff: tradeoffFor(bike, query), label: index === 0 ? "最适合你" : index === 1 ? "性价比选择" : "可以多看一眼" }));
}
