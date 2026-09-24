"use client";

import { useMemo, useState } from "react";
import { brands, families, catalog } from "@/data/catalog";
import { searchCatalog, browseByBrand, isStructureOnly, type ScoredBicycle } from "@/lib/catalog";
import { normalizeSearchTerm } from "@/lib/catalog/normalize";
import { bicyclePriceDisplay, bicycleWeightDisplay } from "@/lib/partsDisplay";
import type { Bicycle } from "@/types/catalog";

const SEARCH_EXAMPLES = [
  "ADV",
  "TCR ADV",
  "捷安特ADV",
  "PP",
  "捷安特PP",
  "Propel",
  "斯特拉",
  "Scultura",
  "锐克多",
  "Reacto",
  "瑞豹",
  "锐豹",
  "Robin",
  "Spark",
  "坎普",
  "ACE",
  "SR9",
  "喜德盛AD",
  "XDS RS",
  "RT9",
  "SEKA Spear",
  "Exceed",
  "T1550",
  "SLC3",
];

const MATCHED_ON_LABELS: Record<ScoredBicycle["matchedOn"], string> = {
  brand: "品牌",
  family: "车系",
  tier: "性能层级",
  trim: "配置",
  alias: "别名",
  id: "编号",
  all: "全名",
};

const STATUS_LABELS: Record<Bicycle["productStatus"], string> = {
  current: "当前款",
  "previous-generation": "上一代",
  archived: "已归档",
  unknown: "状态未知",
  "historical-or-market-reference": "历史/市场参考",
};

const QUALITY_LABELS: Record<Bicycle["dataQuality"], string> = {
  official: "官方数据",
  verified: "已核对",
  partial: "部分数据",
};

export function CatalogExplorer({ onSelect }: { onSelect: (bike: Bicycle) => void }) {
  const [query, setQuery] = useState("");
  const [activeBrand, setActiveBrand] = useState<string | undefined>();
  const [activeFamily, setActiveFamily] = useState<string | undefined>();

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return searchCatalog({ query }).slice(0, 24);
  }, [query]);

  const grouped = useMemo(() => browseByBrand(activeBrand), [activeBrand]);

  const visibleFamilies = useMemo(() => {
    const entries = activeBrand ? grouped[activeBrand] ?? [] : Object.values(grouped).flat();
    return activeFamily ? entries.filter((entry) => entry.family.family === activeFamily) : entries;
  }, [activeBrand, activeFamily, grouped]);

  const showSearchResults = query.trim().length > 0;

  return (
    <section className="catalog-explorer" id="catalog">
      <div className="catalog-explorer-heading">
        <div>
          <span className="eyebrow">01 / 中国公路车数据库</span>
          <h2>
            品牌 → 车系 →
            <br />
            <em>配置与车型年.</em>
          </h2>
        </div>
        <p>
          每条记录都按 品牌 / 车系 / 世代 / 性能层级 / 配置 / 车型年 分列保存，并保留官方来源与抓取日期。
          找不到的价格或重量一律为 <code>null</code>，不做推测。
        </p>
      </div>

      <form
        className="catalog-search"
        onSubmit={(event) => {
          event.preventDefault();
          setActiveBrand(undefined);
          setActiveFamily(undefined);
        }}
      >
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜索车系、配置或昵称，例如：捷安特PP、锐豹、XDS RS、T1550"
          aria-label="搜索中国公路车数据库"
        />
        <button type="submit">搜索 <span>↗</span></button>
      </form>

      <div className="catalog-examples">
        <span>试试看：</span>
        {SEARCH_EXAMPLES.map((example) => (
          <button key={example} type="button" onClick={() => setQuery(example)}>
            {example}
          </button>
        ))}
      </div>

      {showSearchResults ? (
        <div className="catalog-results">
          <div className="catalog-results-intro">
            <span>“{query}” 匹配到 {results.length} 条记录</span>
            <span>别名与缩写会归一到同一产品，不会产生重复条目</span>
          </div>
          {results.length ? (
            <div className="catalog-result-list">
              {results.map(({ bike, matchedOn }) => (
                <CatalogRow key={bike.id} bike={bike} matchedOn={matchedOn} onSelect={onSelect} />
              ))}
            </div>
          ) : (
            <p className="catalog-empty">
              没有匹配的记录。该品牌可能尚未导入（见下方“未来导入目标”），我们宁可留空也不生成虚构产品。
            </p>
          )}
        </div>
      ) : (
        <div className="catalog-browse">
          <div className="catalog-brand-rail">
            <button
              type="button"
              className={activeBrand === undefined ? "active" : ""}
              onClick={() => {
                setActiveBrand(undefined);
                setActiveFamily(undefined);
              }}
            >
              全部品牌
              <b>{catalog.length}</b>
            </button>
            {brands
              .filter((brand) => brand.status === "ingested")
              .map((brand) => {
                const count = catalog.filter((bike) => bike.brand === brand.name).length;
                return (
                  <button
                    key={brand.name}
                    type="button"
                    className={activeBrand === brand.name ? "active" : ""}
                    onClick={() => {
                      setActiveBrand(brand.name);
                      setActiveFamily(undefined);
                    }}
                  >
                    {brand.name}
                    {brand.nameCN ? <small>{brand.nameCN}</small> : null}
                    <b>{count}</b>
                  </button>
                );
              })}
          </div>

          <div className="catalog-family-list">
            {activeBrand ? (
              <div className="catalog-family-filters">
                <button
                  type="button"
                  className={activeFamily === undefined ? "active" : ""}
                  onClick={() => setActiveFamily(undefined)}
                >
                  全部车系
                </button>
                {(grouped[activeBrand] ?? []).map((entry) => (
                  <button
                    key={entry.family.family}
                    type="button"
                    className={activeFamily === entry.family.family ? "active" : ""}
                    onClick={() => setActiveFamily(entry.family.family)}
                  >
                    {entry.family.family}
                  </button>
                ))}
              </div>
            ) : null}

            {visibleFamilies.map((entry) => (
              <article className="catalog-family" key={`${entry.family.brand}-${entry.family.family}`}>
                <header>
                  <div>
                    <span className="catalog-family-brand">
                      {entry.family.brand} {entry.family.brandCN ? `· ${entry.family.brandCN}` : ""}
                    </span>
                    <h3>{entry.family.family}</h3>
                  </div>
                  <span className="catalog-family-count">{entry.products.length} 个产品</span>
                </header>
                <p>{entry.family.positioning}</p>
                <div className="catalog-tag-row">
                  {entry.family.recommendationTags.map((tag) => (
                    <span className="catalog-tag" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
                {entry.family.tiers.length ? (
                  <div className="catalog-tier-row">
                    <span>性能层级 / 配置</span>
                    <div>
                      {entry.family.tiers.map((tier) => (
                        <span key={tier}>{tier}</span>
                      ))}
                    </div>
                  </div>
                ) : null}
                <div className="catalog-alias-row">
                  <span>搜索别名</span>
                  <div>
                    {entry.family.aliases.map((alias) => (
                      <button
                        key={alias}
                        type="button"
                        onClick={() => setQuery(alias)}
                        title={`用“${alias}”搜索`}
                      >
                        {alias}
                      </button>
                    ))}
                  </div>
                </div>
                {entry.products.length ? (
                  <div className="catalog-result-list catalog-result-list-tight">
                    {entry.products.map((bike) => (
                      <CatalogRow key={bike.id} bike={bike} onSelect={onSelect} />
                    ))}
                  </div>
                ) : (
                  <p className="catalog-empty catalog-empty-inline">
                    已登记车系分类与别名，但尚未取得可核实的车型数据，因此没有产品记录。
                  </p>
                )}
              </article>
            ))}
          </div>
        </div>
      )}

      <div className="catalog-future">
        <span className="eyebrow">未来导入目标</span>
        <p>
          以下品牌已登记官网地址与导入计划，但刻意没有生成任何产品记录：
        </p>
        <div>
          {brands
            .filter((brand) => brand.status === "ingestion-target")
            .map((brand) => (
              <span key={brand.name}>
                {brand.name}
                {brand.nameCN ? ` · ${brand.nameCN}` : ""}
              </span>
            ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Variant label keeps the full hierarchy visible: brand · family · tier · trim,
 * skipping levels that repeat the level above so nothing renders as
 * "XDS 龙吟 龙吟" or "Giant Giant TCR".
 */
function variantLabel(bike: Bicycle): string {
  const seen = new Set<string>();
  const parts: string[] = [];
  for (const candidate of [bike.brand, bike.family, bike.tier, bike.trim]) {
    if (!candidate) continue;
    const key = normalizeSearchTerm(candidate);
    if (seen.has(key)) continue;
    seen.add(key);
    parts.push(candidate);
  }
  return parts.join(" · ");
}

function CatalogRow({
  bike,
  matchedOn,
  onSelect,
}: {
  bike: Bicycle;
  matchedOn?: ScoredBicycle["matchedOn"];
  onSelect: (bike: Bicycle) => void;
}) {
  const price = bicyclePriceDisplay(bike.price);
  const weight = bike.weights[0];
  // The weight definition is always shown: a bare-frame figure is never presented
  // as if it were a complete-bike weight.
  const weightLabel = weight ? bicycleWeightDisplay(weight) : "重量暂无官方数据";
  // A figure that exists but is not the confirmed primary one is shown, but never
  // in the same style as a verified one.
  const referenceWeight = !weight ? bike.referenceWeights?.[0] : undefined;
  const referenceWeightLabel = referenceWeight ? `${bicycleWeightDisplay(referenceWeight)} 参考` : null;
  const referencePrice = bike.price.rmb === null ? bicyclePriceDisplay(bike.referencePrice ?? bike.price) : null;

  return (
    <div className="catalog-row">
      <div className="catalog-row-main">
        <strong>{variantLabel(bike)}</strong>
        <span>
          {bike.generation ? `${bike.generation} · ${bike.modelYear ? `${bike.modelYear} 年款` : "车型年未知"} · ` : bike.modelYear ? `${bike.modelYear} 年款 · ` : "车型年未知 · "}
          {bike.productType === "frameset" ? "车架组" : "整车"}
          {matchedOn && matchedOn !== "all" ? ` · 命中${MATCHED_ON_LABELS[matchedOn]}` : ""}
        </span>
      </div>
      <div className="catalog-row-meta">
        <span className={`catalog-badge quality-${bike.dataQuality}`}>{QUALITY_LABELS[bike.dataQuality]}</span>
        <span className={`catalog-badge status-${bike.productStatus}`}>{STATUS_LABELS[bike.productStatus]}</span>
        <span className={`catalog-row-price price-${price.kind}`}>{price.text}</span>
        {price.caption ? <span className="catalog-row-price-caption">{price.caption}</span> : null}
        <span className="catalog-row-weight">{weightLabel}</span>
        {referenceWeightLabel ? <span className="catalog-row-weight weight-reference">{referenceWeightLabel}</span> : null}
        <a href={bike.source.productUrl} target="_blank" rel="noreferrer">
          官方来源 ↗
        </a>
        <button
          type="button"
          className="catalog-row-choose"
          onClick={() => onSelect(bike)}
          disabled={bike.productType === "frameset" || !bike.factoryBuild}
          title={
            bike.productType === "frameset"
              ? "车架组没有完整原厂配置可载入"
              : bike.factoryBuild
                ? "载入原厂零件到配置器"
                : "暂无原厂配置数据"
          }
        >
          用这辆车开始选配
        </button>
      </div>
      {referencePrice ? (
        <p className="catalog-row-note">
          参考价 {referencePrice.text}（{referencePrice.caption}，未写入 price）：
          {bike.referencePrice?.note ?? bike.price.note}
        </p>
      ) : null}
      {bike.priceNote && bike.price.rmb === null ? <p className="catalog-row-note">{bike.priceNote}</p> : null}
      {/*
        Structure-only records get an explicit warning. This is derived from the data
        (no price, no weight, no build) rather than a hardcoded brand list, so it
        stays correct as brands are added and sources come online.
      */}
      {isStructureOnly(bike) ? (
        <p className="catalog-row-note catalog-row-note-warn">
          仅结构记录：{bike.source.manufacturer} 的官方来源当前无法访问，该条只保留车系与搜索别名，
          不含价格、重量或原厂配置（<code>modelPageVerified: false</code>）。
        </p>
      ) : null}
      {!isStructureOnly(bike) && !bike.price && bike.source.modelPageVerified === false ? (
        <p className="catalog-row-note catalog-row-note-warn">
          该条记录的官方产品页未能核实（<code>modelPageVerified: false</code>），价格与规格保持 null。
        </p>
      ) : null}
    </div>
  );
}

export function familyCount(): number {
  return families.length;
}