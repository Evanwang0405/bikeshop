"use client";

import { useState } from "react";
import { parseBikeQuery, type BikeQuery } from "@/lib/recommendation/parseBikeQuery";
import { rankBikes, type RankedCatalogBike } from "@/lib/recommendation/rankBikes";
import { displayName } from "@/lib/catalog";
import { bicyclePriceDisplay, bicycleWeightDisplay } from "@/lib/partsDisplay";
import type { Bicycle } from "@/types/catalog";

const EXAMPLES = [
  "预算2万，我想要爬坡车",
  "预算2万，我想要平路快一点，喜欢气动车",
  "第一辆公路车，5000预算，不要太激进",
  "瑞豹有没有适合爬坡的",
];

const INTENT_LABELS: Record<BikeQuery["intent"], string> = {
  climbing: "爬坡性能",
  aero: "气动效率",
  endurance: "舒适耐力",
  beginner: "入门价值",
  gravel: "砾石与混合路面",
  "all-round": "综合性能",
};

function priceLabel(bike: RankedCatalogBike): string {
  return bicyclePriceDisplay(bike.price).text;
}

/** Caption says whether the figure is a China MSRP or a converted foreign one. */
function priceCaption(bike: RankedCatalogBike): string {
  return bicyclePriceDisplay(bike.price).caption;
}

function weightLabel(bike: RankedCatalogBike): string {
  const weight = bike.weights[0];
  return weight ? bicycleWeightDisplay(weight) : "重量暂无官方数据";
}

export function BikeRecommendations({ onSelect }: { onSelect: (bike: Bicycle) => void }) {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState<BikeQuery>();
  const [results, setResults] = useState<RankedCatalogBike[]>([]);

  const submit = (value = query) => {
    const parsed = parseBikeQuery(value);
    setQuery(value);
    setSubmittedQuery(parsed);
    setResults(rankBikes(undefined, parsed));
  };

  return (
    <section className="recommendation-section" id="complete-bikes">
      <div className="recommendation-heading">
        <div>
          <span className="eyebrow">00 / 整车推荐</span>
          <h2>
            让我替你
            <br />
            <em>先选一辆。</em>
          </h2>
        </div>
        <p>
          推荐按预算匹配度 + 骑行风格 + 几何定位 + 重量 + 套件 + 轮组 + 经验水平 + 性价比综合打分。
          价格只是其中一项，不是唯一排序标准。
        </p>
      </div>

      <form
        className="recommendation-search"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="告诉我你的预算和需求，比如：预算2万，我想要爬坡车"
          aria-label="输入预算和骑行需求"
        />
        <button type="submit">
          帮我选车 <span>↗</span>
        </button>
      </form>

      <div className="recommendation-examples">
        <span>试试看：</span>
        {EXAMPLES.map((example) => (
          <button key={example} type="button" onClick={() => submit(example)}>
            {example}
          </button>
        ))}
      </div>

      {submittedQuery ? (
        <div className="recommendation-results">
          <div className="result-intro">
            <span>你告诉我：</span>
            <strong>“{submittedQuery.raw}”</strong>
            <p>
              我会优先考虑：{submittedQuery.preferences.join(" / ")} · {INTENT_LABELS[submittedQuery.intent]}
              {submittedQuery.budget
                ? ` · 预算 ${submittedQuery.budgetCurrency === "USD" ? "US$" : "¥"}${submittedQuery.budget.toLocaleString()}`
                : ""}
              {submittedQuery.wantsRelaxedPosition ? " · 不激进几何优先" : ""}
            </p>
          </div>

          {results.length ? (
            <div className="bike-grid">
              {results.map((bike, index) => (
                <article className="bike-card" key={bike.id}>
                  {bike.image?.sourceType === "official" ? (
                    <div className="bike-card-image" style={{ backgroundImage: `url(${bike.image.url})` }}>
                      <span>0{index + 1}</span>
                      <strong>{bike.label}</strong>
                    </div>
                  ) : (
                    <div className="bike-card-image">
                      <span>0{index + 1}</span>
                      <strong>{bike.label}</strong>
                    </div>
                  )}
                  <div className="bike-card-body">
                    <div>
                      <span className="bike-brand">
                        {bike.brand} {bike.brandCN ? `· ${bike.brandCN}` : ""}
                      </span>
                      <h3>{displayName(bike)}</h3>
                    </div>
                    <div className="recommendation-why">
                      <b>适合你，因为</b>
                      <p>{bike.reason}</p>
                    </div>
                    <div className="bike-meta">
                      <span>{priceLabel(bike)}</span>
                      {priceCaption(bike) ? <span className="bike-price-caption">{priceCaption(bike)}</span> : null}
                      <span>{weightLabel(bike)}</span>
                      <span>{bike.groupset ?? "套件未公布"}</span>
                    </div>
                    <div className="score-breakdown">
                      <span>预算匹配 {bike.breakdown.budgetFit.toFixed(0)}</span>
                      <span>风格匹配 {bike.breakdown.styleMatch.toFixed(0)}</span>
                      <span>几何定位 {bike.breakdown.positioning.toFixed(0)}</span>
                      <span>零件水平 {bike.breakdown.components.toFixed(0)}</span>
                      <span>性价比 {bike.breakdown.value.toFixed(0)}</span>
                    </div>
                    <div className="bike-meta bike-meta-tags">
                      {bike.recommendationTags.slice(0, 5).map((tag) => (
                        <span className="catalog-tag" key={tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="recommendation-tradeoff">
                      <b>需要考虑</b>
                      <p>{bike.tradeoff}</p>
                    </div>
                    <div className="bike-actions">
                      <button className="choose-bike" onClick={() => onSelect(bike)}>
                        用这辆车开始选配 <span>↗</span>
                      </button>
                      <a href={bike.source.productUrl} target="_blank" rel="noreferrer">
                        查看官方来源
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="catalog-empty">
              目前没有可推荐的整车记录。推荐只会使用带有原厂配置数据的整车，避免推荐一辆无法载入零件的空车架。
            </p>
          )}
        </div>
      ) : null}
    </section>
  );
}
