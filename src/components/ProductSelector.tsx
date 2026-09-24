"use client";

import { useMemo, useState } from "react";
import type { Component, ComponentCategory } from "@/types";
import { priceDisplay, weightDisplay, provenanceBadge } from "@/lib/partsDisplay";

type ProductSelectorProps = { category: ComponentCategory; products: Component[]; selectedId?: string; selectedSize?: string; factoryId?: string; onSelect: (id: string) => void; onSizeChange: (size: string) => void; onRestore?: () => void };

export function ProductSelector({ category, products, selectedId, selectedSize, factoryId, onSelect, onSizeChange, onRestore }: ProductSelectorProps) {
  const categoryLabels: Record<ComponentCategory, string> = { frame: "车架", fork: "前叉", wheelset: "轮组", tires: "外胎", groupset: "套件", crankset: "牙盘", cassette: "飞轮", chain: "链条", brakes: "刹车系统", handlebar: "车把", stem: "把立", saddle: "坐垫", seatpost: "座管", pedals: "脚踏" };
  const title = categoryLabels[category];
  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState("全部品牌");
  const selectedProduct = products.find((product) => product.id === selectedId);
  const brands = ["全部品牌", ...Array.from(new Set(products.map((product) => product.brand)))];
  const visibleProducts = useMemo(() => products.filter((product) => {
    const searchable = `${product.brand} ${product.model} ${Object.values(product.specifications).join(" ")}`.toLowerCase();
    return (brand === "全部品牌" || product.brand === brand) && searchable.includes(query.trim().toLowerCase());
  }), [brand, products, query]);
  return (
    <section className="selector-section" id={category}>
      <div className="section-heading"><div><span className="eyebrow">02 / 零件选择</span><h2>{title}</h2></div><span className="section-count">{products.length} 个选项</span></div>
      {selectedProduct?.sizeOptions?.length ? <label className="size-control">尺寸 / 重量 <select value={selectedSize ?? selectedProduct.sizeOptions[0]} onChange={(event) => onSizeChange(event.target.value)}>{selectedProduct.sizeOptions.map((size) => <option key={size} value={size}>{size} · {weightDisplay({ ...selectedProduct, weight: selectedProduct.weightBySize?.[size] ?? selectedProduct.weight }).text}</option>)}</select></label> : null}
      {factoryId && selectedId !== factoryId ? <div className="factory-change"><span>原厂：{products.find((product) => product.id === factoryId)?.model ?? factoryId}</span><button type="button" onClick={onRestore}>恢复原厂配置</button></div> : null}
      <div className="catalog-tools"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`搜索${title}、品牌或型号`} aria-label={`搜索${title}`} /><span>{visibleProducts.length} 个结果</span></div>
      <div className="brand-filters">{brands.map((option) => <button type="button" key={option} className={option === brand ? "active" : ""} onClick={() => setBrand(option)}>{option}</button>)}</div>
      <p className="parts-legend">
        零件列表同时包含<strong>原厂件</strong>（读取自厂商官方规格表，官方未公布单价与重量）与
        <strong>示例零件</strong>（名称真实、价格重量为示例值）。每一项都会标明来源。
      </p>
      <div className="product-list">
        {visibleProducts.map((product) => {
          const isSelected = product.id === selectedId;
          const price = priceDisplay(product);
          const weight = weightDisplay(product);
          const badge = provenanceBadge(product);
          const usedOn = product.usedOnBikeIds?.length ?? 0;
          return <button className={`product-row ${isSelected ? "is-selected" : ""}`} key={product.id} onClick={() => onSelect(product.id)} aria-pressed={isSelected}>
            <span className={`product-swatch ${product.image}`} aria-label={`${product.brand} ${product.model} 缩略图`} />
            <span className="product-main">
              <span className="product-brand-row">
                <strong>{product.brand}</strong>
                <em className={`prov-badge ${badge.className}`}>{badge.text}</em>
              </span>
              <span>{product.model}</span>
              {usedOn ? <small className="product-used">装配于 {usedOn} 款整车</small> : null}
            </span>
            <span className="product-spec">{product.specifications[category === "frame" ? "Material" : category === "wheelset" ? "Rim" : "Speeds"]}</span>
            <span className={`product-weight weight-${weight.kind}`}>{weight.text}</span>
            <span className={`product-price price-${price.kind}`}>{price.text}</span>
            <span className="select-dot">{isSelected ? "✓" : ""}</span>
          </button>;
        })}
      </div>
    </section>
  );
}
