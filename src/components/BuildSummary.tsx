"use client";

import type { CompatibilityResult, Component, ComponentCategory } from "@/types";
import { componentCategories as allComponentCategories } from "@/types";

type BuildSummaryProps = {
  components: Component[];
  results: CompatibilityResult[];
  factorySelections: Partial<Record<Component["category"], string>>;
  subtotal: number;
  weight: number;
  baseBikePrice: number;
  modificationSpend: number;
  /** Currency the base bike price is quoted in, when one is published. */
  baseBikeCurrency?: "CNY" | "USD" | "EUR";
  /** False when the manufacturer publishes no price for the loaded bicycle. */
  basePriceKnown?: boolean;
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
  onSave,
}: BuildSummaryProps) {
  const completed = components.length;
  const currencyPrefix = baseBikeCurrency === "CNY" ? "¥" : baseBikeCurrency === "USD" ? "US$" : "€";
  const showBase = basePriceKnown && baseBikePrice > 0;
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
                </span>
                <strong>{component.brand} {component.model}</strong>
                <b>
                  {component.price === 0 && factorySelections[component.category] === component.id
                    ? "原厂配置"
                    : `${currencyPrefix}${component.price.toLocaleString()}`}
                </b>
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
          </div>
        ) : null}
        {!basePriceKnown ? (
          <div>
            <span>原厂整车价格</span>
            <strong>官方未公布</strong>
          </div>
        ) : null}
        <div>
          <span>{showBase ? "新增改装花费" : "零件小计"}</span>
          <strong>{currencyPrefix}{(showBase ? modificationSpend : subtotal).toLocaleString()}</strong>
        </div>
        <div>
          <span>当前购买成本</span>
          <strong>
            {basePriceKnown
              ? `${currencyPrefix}${(baseBikePrice + (showBase ? modificationSpend : subtotal)).toLocaleString()}`
              : "价格未知"}
          </strong>
        </div>
        <div>
          <span>预计重量</span>
          <strong>{weight > 0 ? `${(weight / 1000).toFixed(2)} kg` : "未取得可核实数据"}</strong>
        </div>
      </div>
      <button className="save-button" onClick={onSave}>
        保存当前配置 <span>↗</span>
      </button>
    </aside>
  );
}
