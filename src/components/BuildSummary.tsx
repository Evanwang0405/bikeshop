"use client";

import type { CompatibilityResult, Component } from "@/types";

type BuildSummaryProps = { components: Component[]; results: CompatibilityResult[]; subtotal: number; weight: number; onSave: () => void };

const icons = { compatible: "✓", warning: "!", incompatible: "×" };

export function BuildSummary({ components, results, subtotal, weight, onSave }: BuildSummaryProps) {
  const completed = components.length;
  return <aside className="summary-panel">
    <div className="summary-top"><span className="eyebrow">03 / 当前配置</span><span className="build-id">配置 001</span></div>
    <div className="progress-copy"><strong>整车配置</strong><span>已选 {completed} / 14</span></div>
    <div className="progress-track"><span style={{ width: `${Math.max(8, completed / 14 * 100)}%` }} /></div>
    <div className="summary-items">
      {components.length ? components.map((component) => <div className="summary-item" key={component.id}><span>{component.category}</span><strong>{component.brand} {component.model}</strong><b>${component.price.toLocaleString()}</b></div>) : <p className="empty-summary">先选择一个车架，开始配置你的自行车。</p>}
    </div>
    <div className="compatibility"><div className="summary-label"><span>兼容性检查</span><span className="status-dot" /></div>{results.map((result) => <div className={`compatibility-row ${result.status}`} key={result.rule}><span className="compat-icon">{icons[result.status]}</span><span>{result.message}</span></div>)}</div>
    <div className="totals"><div><span>零件小计</span><strong>${subtotal.toLocaleString()}</strong></div><div><span>预计重量</span><strong>{(weight / 1000).toFixed(2)} kg</strong></div></div>
    <button className="save-button" onClick={onSave}>保存当前配置 <span>↗</span></button>
  </aside>;
}
