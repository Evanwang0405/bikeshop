"use client";

import { useMemo, useState } from "react";
import { completeBikes } from "@/data/products";
import type { CompleteBike } from "@/types";

type RecommendationMode = "budget" | "climbing" | "sprint" | "aero";

const modes: { id: RecommendationMode; label: string; detail: string }[] = [
  { id: "budget", label: "预算优先", detail: "$2,000 以内" },
  { id: "climbing", label: "爬坡轻量", detail: "低重量" },
  { id: "sprint", label: "平路冲刺", detail: "刚性与加速" },
  { id: "aero", label: "气动车", detail: "高速巡航" },
];

export function BikeRecommendations({ onSelect }: { onSelect: (bike: CompleteBike) => void }) {
  const [mode, setMode] = useState<RecommendationMode>("budget");
  const recommendations = useMemo(() => completeBikes.filter((bike) => bike.category === mode).sort((a, b) => mode === "budget" ? a.price - b.price : a.weight - b.weight).slice(0, 3), [mode]);
  return <section className="recommendation-section" id="complete-bikes">
    <div className="recommendation-heading"><div><span className="eyebrow">00 / 整车推荐</span><h2>让我替你<br /><em>先选一辆。</em></h2></div><p>告诉我你最在意什么，先从整车方向开始。价格和重量是演示数据，购买前请以品牌官网为准。</p></div>
    <div className="recommendation-tabs">{modes.map((item) => <button key={item.id} className={item.id === mode ? "active" : ""} onClick={() => setMode(item.id)}><strong>{item.label}</strong><span>{item.detail}</span></button>)}</div>
      <div className="bike-grid">{recommendations.map((bike, index) => <article className="bike-card" key={bike.id}><div className="bike-card-image"><span>0{index + 1}</span><strong>{bike.category === "aero" ? "气动" : bike.category === "climbing" ? "爬坡" : bike.category === "sprint" ? "冲刺" : "全能"}</strong></div><div className="bike-card-body"><div><span className="bike-brand">{bike.brand}</span><h3>{bike.model}</h3></div><p>{bike.description}</p><div className="bike-meta"><span>{(bike.weight / 1000).toFixed(2)} kg</span><span>{bike.groupset}</span><strong>${bike.price.toLocaleString()}</strong></div><div className="bike-actions"><button className="choose-bike" onClick={() => onSelect(bike)}>用这辆开始配置 <span>↗</span></button>{bike.officialUrl ? <a href={bike.officialUrl} target="_blank" rel="noreferrer">查看官网车型</a> : null}</div></div></article>)}</div>
  </section>;
}
