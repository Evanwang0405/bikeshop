"use client";

import type { Component, ComponentCategory } from "@/types";

type ProductSelectorProps = { category: ComponentCategory; products: Component[]; selectedId?: string; selectedSize?: string; factoryId?: string; onSelect: (id: string) => void; onSizeChange: (size: string) => void; onRestore?: () => void };

export function ProductSelector({ category, products, selectedId, selectedSize, factoryId, onSelect, onSizeChange, onRestore }: ProductSelectorProps) {
  const categoryLabels: Record<ComponentCategory, string> = { frame: "车架", fork: "前叉", wheelset: "轮组", tires: "外胎", groupset: "套件", crankset: "牙盘", cassette: "飞轮", chain: "链条", brakes: "刹车系统", handlebar: "车把", stem: "把立", saddle: "坐垫", seatpost: "座管", pedals: "脚踏" };
  const title = categoryLabels[category];
  const selectedProduct = products.find((product) => product.id === selectedId);
  return (
    <section className="selector-section" id={category}>
      <div className="section-heading"><div><span className="eyebrow">02 / 零件选择</span><h2>{title}</h2></div><span className="section-count">{products.length} 个选项</span></div>
      {selectedProduct?.sizeOptions?.length ? <label className="size-control">尺寸 / 重量 <select value={selectedSize ?? selectedProduct.sizeOptions[0]} onChange={(event) => onSizeChange(event.target.value)}>{selectedProduct.sizeOptions.map((size) => <option key={size} value={size}>{size} · {(selectedProduct.weightBySize?.[size] ?? selectedProduct.weight).toLocaleString()}g</option>)}</select></label> : null}
      {factoryId && selectedId !== factoryId ? <div className="factory-change"><span>原厂：{products.find((product) => product.id === factoryId)?.model ?? factoryId}</span><button type="button" onClick={onRestore}>恢复原厂配置</button></div> : null}
      <div className="product-list">
        {products.map((product) => {
          const isSelected = product.id === selectedId;
          return <button className={`product-row ${isSelected ? "is-selected" : ""}`} key={product.id} onClick={() => onSelect(product.id)} aria-pressed={isSelected}>
            <span className={`product-swatch ${product.image}`} aria-label={`${product.brand} ${product.model} 缩略图`} />
            <span className="product-main"><strong>{product.brand}</strong><span>{product.model}</span></span>
            <span className="product-spec">{product.specifications[category === "frame" ? "Material" : category === "wheelset" ? "Rim" : "Speeds"]}</span>
            <span className="product-weight">{product.weight.toLocaleString()}g</span>
            <span className="product-price">${product.price.toLocaleString()}</span>
            <span className="select-dot">{isSelected ? "✓" : ""}</span>
          </button>;
        })}
      </div>
    </section>
  );
}
