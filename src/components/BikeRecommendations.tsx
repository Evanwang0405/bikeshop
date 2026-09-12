"use client";

import { useState } from "react";
import { completeBikes } from "@/data/products";
import { parseBikeQuery, type BikeQuery } from "@/lib/recommendation/parseBikeQuery";
import { rankBikes, type RankedBike } from "@/lib/recommendation/rankBikes";
import type { CompleteBike } from "@/types";

const examples = ["$10,000 第一辆公路车", "$20,000 综合型公路车", "$30,000 平路速度优先", "$50,000 爬坡轻量", "没有严格预算，想要顶级竞赛车"];
const intentLabels: Record<BikeQuery["intent"], string> = { climbing: "爬坡性能", aero: "气动效率", endurance: "舒适耐力", beginner: "入门价值", "all-round": "综合性能" };

export function BikeRecommendations({ onSelect }: { onSelect: (bike: CompleteBike) => void }) {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState<BikeQuery>();
  const [results, setResults] = useState<RankedBike[]>([]);
  const submit = (value = query) => { const parsed = parseBikeQuery(value); setQuery(value); setSubmittedQuery(parsed); setResults(rankBikes(completeBikes, parsed)); };
  return <section className="recommendation-section" id="complete-bikes">
    <div className="recommendation-heading"><div><span className="eyebrow">00 / 整车推荐</span><h2>让我替你<br /><em>先选一辆。</em></h2></div><p>像和熟悉公路车的店员聊天一样，告诉我预算、用途和骑行偏好。我会给你三辆值得认真考虑的车。</p></div>
    <form className="recommendation-search" onSubmit={(event) => { event.preventDefault(); submit(); }}><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="告诉我你的预算和需求，比如：5万预算，我要一辆适合爬坡的公路车" aria-label="输入预算和骑行需求" /><button type="submit">帮我选车 <span>↗</span></button></form>
    <div className="recommendation-examples"><span>试试看：</span>{examples.map((example) => <button key={example} type="button" onClick={() => submit(example)}>{example}</button>)}</div>
    {submittedQuery && results.length ? <div className="recommendation-results"><div className="result-intro"><span>你告诉我：</span><strong>“{submittedQuery.raw}”</strong><p>我会优先考虑：{submittedQuery.preferences.join(" / ")} · {intentLabels[submittedQuery.intent]}</p></div><div className="bike-grid">{results.map((bike, index) => <article className="bike-card" key={bike.id}><div className="bike-card-image"><span>0{index + 1}</span><strong>{bike.label}</strong></div><div className="bike-card-body"><div><span className="bike-brand">{bike.brand}</span><h3>{bike.model}</h3></div><div className="recommendation-why"><b>适合你，因为</b><p>{bike.reason}</p></div><div className="bike-meta"><span>${bike.price.toLocaleString()}</span><span>{(bike.weight / 1000).toFixed(2)} kg</span><span>{bike.groupset}</span></div><div className="recommendation-tradeoff"><b>需要考虑</b><p>{bike.tradeoff}</p></div><div className="bike-actions"><button className="choose-bike" onClick={() => onSelect(bike)}>用这辆开始配置 <span>↗</span></button>{bike.officialUrl ? <a href={bike.officialUrl} target="_blank" rel="noreferrer">查看官网车型</a> : null}</div></div></article>)}</div></div> : null}
  </section>;
}
