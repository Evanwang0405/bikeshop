"use client";

import { useMemo, useState } from "react";
import { BikeVisualizer } from "@/components/BikeVisualizer";
import { BikeRecommendations } from "@/components/BikeRecommendations";
import { BrandDirectory } from "@/components/BrandDirectory";
import { BuildSummary } from "@/components/BuildSummary";
import { ProductSelector } from "@/components/ProductSelector";
import { completeBikes, products } from "@/data/products";
import { checkCompatibility } from "@/lib/compatibility";
import { calculatePrice } from "@/lib/pricing";
import { componentCategories, type BikeBuild, type ComponentCategory } from "@/types";
import type { CompleteBike } from "@/types";

const categories: ComponentCategory[] = [...componentCategories];
const initialBuild: BikeBuild = { mode: "custom-build", selections: {}, sizes: {}, factorySelections: {} };

export default function Home() {
  const [build, setBuild] = useState<BikeBuild>(() => {
    if (typeof window === "undefined") return initialBuild;
    const stored = window.localStorage.getItem("bike-shop-build");
    return stored ? { ...initialBuild, ...JSON.parse(stored) as BikeBuild } : initialBuild;
  });
  const [saved, setSaved] = useState(false);
  const [recommendedBike, setRecommendedBike] = useState<CompleteBike>();
  const selected = useMemo(() => categories.map((category) => products.find((product) => product.category === category && product.id === build.selections[category])).filter((product): product is NonNullable<typeof product> => product !== undefined).map((product) => ({ ...product, weight: product.weightBySize?.[build.sizes?.[product.category] ?? product.sizeOptions?.[0] ?? ""] ?? product.weight })), [build]);
  const frame = selected.find((item) => item?.category === "frame");
  const wheelset = selected.find((item) => item?.category === "wheelset");
  const groupset = selected.find((item) => item?.category === "groupset");
  const tires = selected.find((item) => item?.category === "tires");
  const handlebar = selected.find((item) => item?.category === "handlebar");
  const saddle = selected.find((item) => item?.category === "saddle");
  const baseBike = build.baseBikeId ? completeBikes.find((bike) => bike.id === build.baseBikeId) : undefined;
  const summary = calculatePrice(selected, baseBike?.price ?? 0, build.factorySelections);
  const results = checkCompatibility(frame, wheelset, groupset, selected);
  const choose = (category: ComponentCategory, id: string) => setBuild((current) => ({ ...current, selections: { ...current.selections, [category]: id } }));
  const chooseSize = (category: ComponentCategory, size: string) => setBuild((current) => ({ ...current, sizes: { ...current.sizes, [category]: size } }));
  const restore = (category: ComponentCategory) => { const factoryId = build.factorySelections?.[category]; if (factoryId) choose(category, factoryId); };
  const startFromBike = (bike: CompleteBike) => { const factorySelections = Object.fromEntries(Object.entries(bike.factoryBuild ?? {}).map(([category, reference]) => [category, reference.productId])) as Partial<Record<ComponentCategory, string>>; setRecommendedBike(bike); setBuild({ mode: "complete-bike", baseBikeId: bike.id, selections: factorySelections, sizes: {}, factorySelections }); window.setTimeout(() => document.getElementById("workshop")?.scrollIntoView({ behavior: "smooth" }), 0); };
  const save = () => { window.localStorage.setItem("bike-shop-build", JSON.stringify(build)); setSaved(true); window.setTimeout(() => setSaved(false), 1800); };
  return <main><header className="site-header"><a className="wordmark" href="#top">WORKSHOP<span>/</span></a><nav><a className="active" href="#frame">开始配置</a><a href="#complete-bikes">整车推荐</a><a href="#groupset">零件目录</a></nav><button className="header-action" onClick={save}>{saved ? "已保存" : "保存配置"}<span>↗</span></button></header>
    <div className="workshop-shell" id="top"><div className="intro"><div><span className="eyebrow">你的骑行 / 个性配置</span><h1>打造一辆<br /><em>值得骑的车。</em></h1></div><p>选择零件，细节交给我们帮你检查。</p></div>
      <BikeRecommendations onSelect={startFromBike} />
      <BrandDirectory />
      {recommendedBike ? <div className="recommendation-picked"><span>推荐起点</span><strong>{recommendedBike.brand} {recommendedBike.model}</strong><span>${recommendedBike.price.toLocaleString()} · {(recommendedBike.weight / 1000).toFixed(2)} kg · {recommendedBike.groupset}</span></div> : null}
      <div className="workshop-grid" id="workshop"><div className="visual-column"><BikeVisualizer frame={frame} wheelset={wheelset} groupset={groupset} tires={tires} handlebar={handlebar} saddle={saddle} factoryImage={build.mode === "complete-bike" ? baseBike?.productImage?.url : undefined} /><div className="visual-caption"><span>{frame?.model ?? "等待选择车架"}</span><span>{wheelset?.model ?? "等待选择轮组"}</span><span>{groupset?.model ?? "等待选择套件"}</span></div></div><BuildSummary components={selected} results={results} factorySelections={build.factorySelections ?? {}} subtotal={summary.partsSubtotal} weight={summary.totalWeight} baseBikePrice={baseBike?.price ?? 0} modificationSpend={summary.modificationSpend} onSave={save} /></div>
      <div className="selection-area"><div className="selection-intro"><span className="eyebrow">01 / 配置流程</span><h2>{build.mode === "complete-bike" ? <>从原厂配置，<br /><em>开始改装。</em></> : <>先从<br /><em>核心零件开始。</em></>}</h2><p>{build.mode === "complete-bike" ? `${baseBike?.brand} ${baseBike?.model} 原厂配置已载入。替换任意零件即可开始定制。` : "先确定车架、轮组和套件，再逐步完成剩余配置。每次选择都会立即更新上方整车。"}</p></div><div className="selectors">{categories.map((category) => <ProductSelector key={category} category={category} products={products.filter((product) => product.category === category)} selectedId={build.selections[category]} selectedSize={build.sizes?.[category]} factoryId={build.factorySelections[category]} onSelect={(id) => choose(category, id)} onSizeChange={(size) => chooseSize(category, size)} onRestore={() => restore(category)} />)}</div></div>
    </div><footer><span>WORKSHOP / 2026</span><span>为更远的路而造</span></footer>
  </main>;
}
