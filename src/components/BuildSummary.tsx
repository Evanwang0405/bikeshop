"use client";

import type { CompatibilityResult, Component, ComponentCategory } from "@/types";
import { componentCategories as allComponentCategories } from "@/types";
import { priceDisplay, provenanceBadge, totalDisplay } from "@/lib/partsDisplay";

type BuildSummaryProps = {
  components: Component[];
  results: CompatibilityResult[];
  factorySelections: Partial<Record<Component["category"], string>>;
  subtotal: number;
  weight: number;
  baseBikePrice: number;
  modificationSpend: number;
  /** Currency the base bike price is quoted in, when one is published. */
  baseBikeCurrency?: "CNY" | "USD" | "EUR" | "GBP";
  /** False when the manufacturer publishes no price for the loaded bicycle. */
  basePriceKnown?: boolean;
  /** Says whether the base figure is a China MSRP, a retailer figure, etc. */
  basePriceCaption?: string;
  /** Converted foreign reference, shown only when there is no primary price. */
  basePriceReference?: string | null;
  onSave: () => void;
};

const icons = { compatible: "✓", warning: "!", incompatible: "×" };

/** Category list used only for the progress indicator. */
const componentCategoriesForDisplay: readonly ComponentCategory[] = allComponentCategories;

export function BuildSummary({
  components,
  results,
  factorySelections,
  subtotal,
  weight,
  baseBikePrice,
  modificationSpend,
  baseBikeCurrency = "CNY",
  basePriceKnown = true,
  basePriceCaption = "",
  basePriceReference = null,
  onSave,
}: BuildSummaryProps) {
  const completed = components.length;
  const currencyPrefix = baseBikeCurrency === "CNY" ? "¥" : baseBikeCurrency === "USD" ? "US$" : "€";
  const showBase = basePriceKnown && baseBikePrice > 0;
  // A total that treats unknown prices as zero looks like a quote. Report it as
  // incomplete instead, and say by how much.
  const partsTotal = totalDisplay(components, showBase ? modificationSpend : subtotal);
  const grand = totalDisplay(components, showBase ? baseBikePrice + modificationSpend : subtotal);
  return (
    <aside className="summary-panel">
      <div className="summary-top">
        <span className="eyebrow">03 / 当前配置</span>
        <span className="build-id">配置 001</span>
      </div>
      <div className="progress-copy">
        <strong>整车配置</strong>
        <span>已选 {completed} / {componentCategoriesForDisplay.length}</span>
      </div>
      <div className="progress-track">
        <span style={{ width: `${Math.max(8, (completed / componentCategoriesForDisplay.length) * 100)}%` }} />
      </div>
      <div className="summary-items">
        {components.length ? (
          components.map((component) => {
            const isModified = Boolean(
              factorySelections[component.category] && factorySelections[component.category] !== component.id,
            );
            return (
              <div className="summary-item" key={component.id}>
                <span>
                  {component.category}
                  {isModified ? <small>已改装</small> : null}
                  <em className={`prov-badge ${provenanceBadge(component).className}`}>{provenanceBadge(component).text}</em>
                </span>
                <strong>{component.brand} {component.model}</strong>
                <b className={`price-${priceDisplay(component).kind}`}>{priceDisplay(component).text}</b>
              </div>
            );
          })
        ) : (
          <p className="empty-summary">先从车型数据库载入一辆整车，或直接选择一个车架开始配置。</p>
        )}
      </div>
      <div className="compatibility">
        <div className="summary-label">
          <span>兼容性检查</span>
          <span className="status-dot" />
        </div>
        {results.map((result) => (
          <div className={`compatibility-row ${result.status}`} key={result.rule}>
            <span className="compat-icon">{icons[result.status]}</span>
            <span>{result.message}</span>
          </div>
        ))}
      </div>
      <div className="totals">
        {showBase ? (
          <div>
            <span>原厂整车价格</span>
            <strong>{currencyPrefix}{baseBikePrice.toLocaleString()}</strong>
            {basePriceCaption ? <small className="summary-price-caption">{basePriceCaption}</small> : null}
          </div>
        ) : null}
        {!basePriceKnown ? (
          <div>
            <span>原厂整车价格</span>
            <strong className="price-unknown">官方未公布</strong>
            {basePriceReference ? (
              <small className="summary-price-caption">参考价 {basePriceReference}（未计入总价）</small>
            ) : null}
          </div>
        ) : null}
        <div>
          <span>{showBase ? "新增改装花费" : "零件小计"}</span>
          <strong>{partsTotal.text}</strong>
        </div>
        <div>
          <span>当前购买成本</span>
          <strong>{basePriceKnown ? grand.text : "价格未知"}</strong>
        </div>
        {!grand.complete && partsTotal.unknownCount > 0 ? (
          <p className="total-caveat">
            合计不完整：{partsTotal.unknownCount} 项零件官方未公布价格，已按 ¥0 计入。
            真实总价会高于此数。
          </p>
        ) : null}
        <div>
          <span>预计重量</span>
          <strong>{weight > 0 ? `${(weight / 1000).toFixed(2)} kg` : "尚未公布"}</strong>
        </div>
      </div>
      <button className="save-button" onClick={onSave}>
        保存当前配置 <span>↗</span>
      </button>
    </aside>
  );
}
