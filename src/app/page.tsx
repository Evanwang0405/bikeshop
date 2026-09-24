"use client";

import { useEffect, useMemo, useState } from "react";
import { BikeVisualizer } from "@/components/BikeVisualizer";
import { BikeRecommendations } from "@/components/BikeRecommendations";
import { BrandDirectory } from "@/components/BrandDirectory";
import { BuildSummary } from "@/components/BuildSummary";
import { CatalogExplorer } from "@/components/CatalogExplorer";
import { DataQualityReport } from "@/components/DataQualityReport";
import { ProductSelector } from "@/components/ProductSelector";
import { products } from "@/data/products";
import { catalog } from "@/data/catalog";
import { toWorkshopBuild, displayName, derivedComponents } from "@/lib/catalog";
import { catalogComponents } from "@/lib/catalog/componentAdapters";
import { mergePartSources } from "@/lib/catalog/componentAdapters";
import { bicyclePriceDisplay } from "@/lib/partsDisplay";
import { checkCompatibility } from "@/lib/compatibility";
import { calculatePrice } from "@/lib/pricing";
import { componentCategories, type BikeBuild, type Component, type ComponentCategory } from "@/types";
import type { Bicycle } from "@/types/catalog";

const categories: ComponentCategory[] = [...componentCategories];
const initialBuild: BikeBuild = { mode: "custom-build", selections: {}, sizes: {}, factorySelections: {} };

export default function Home() {
  const [build, setBuild] = useState<BikeBuild>(() => {
    if (typeof window === "undefined") return initialBuild;
    const stored = window.localStorage.getItem("bike-shop-build");
    return stored ? { ...initialBuild, ...(JSON.parse(stored) as BikeBuild) } : initialBuild;
  });
  const [saved, setSaved] = useState(false);
  const [selectedBike, setSelectedBike] = useState<Bicycle>();
  /** Components synthesized from a catalog product's factory build. */
  const [factoryComponents, setFactoryComponents] = useState<Component[]>([]);
  const [loadNotice, setLoadNotice] = useState<string>();

  /**
   * The part picker draws from four sets with clearly different standing:
   *   · derivedComponents — real OEM parts read off manufacturer spec tables,
   *                         deliberately with no published price/weight
   *   · catalogComponents — parts and groupsets with their own catalog identity and
   *                         an explicit price/weight provenance
   *   · factoryComponents — synthesized from the bicycle the user just loaded
   *   · products          — illustrative sample parts, labelled demo
   *
   * They are merged with an explicit precedence rather than concatenated. Sample
   * data must never shadow a sourced figure: a fabricated price that wins on
   * collision looks exactly like a verified one, so the merge ranks the sources and
   * reports every collision instead of rendering both.
   */
  const { components: allComponents, report: partSourceReport } = useMemo(
    () =>
      mergePartSources([
        ["derived", derivedComponents],
        ["factory", factoryComponents],
        ["catalog", catalogComponents],
        ["sample", products],
      ]),
    [factoryComponents],
  );

  const selected = useMemo(
    () =>
      categories
        .map((category) =>
          allComponents.find((product) => product.category === category && product.id === build.selections[category]),
        )
        .filter((product): product is NonNullable<typeof product> => product !== undefined)
        .map((product) => ({
          ...product,
          weight:
            product.weightBySize?.[build.sizes?.[product.category] ?? product.sizeOptions?.[0] ?? ""] ?? product.weight,
        })),
    [allComponents, build],
  );

  const frame = selected.find((item) => item?.category === "frame");
  const wheelset = selected.find((item) => item?.category === "wheelset");
  const groupset = selected.find((item) => item?.category === "groupset");
  const tires = selected.find((item) => item?.category === "tires");
  const handlebar = selected.find((item) => item?.category === "handlebar");
  const saddle = selected.find((item) => item?.category === "saddle");
  /**
   * Base bike price comes from the catalog price record. When the manufacturer does
   * not publish a price it is null and we do NOT substitute a converted or guessed
   * figure — the summary shows the base price as unknown instead. A converted
   * foreign reference is carried separately so the summary can caption it.
   */
  const baseBikePrice = build.mode === "complete-bike" ? (selectedBike?.price.rmb ?? 0) : 0;
  const basePriceKnown = build.mode !== "complete-bike" || selectedBike?.price.rmb !== null;
  const basePriceCaption =
    build.mode === "complete-bike" && selectedBike ? bicyclePriceDisplay(selectedBike.price).caption : "";
  const basePriceReference =
    build.mode === "complete-bike" && selectedBike?.price.rmb === null && selectedBike.referencePrice
      ? bicyclePriceDisplay(selectedBike.referencePrice)
      : null;
  const summary = calculatePrice(selected, baseBikePrice, build.factorySelections);
  const results = checkCompatibility(frame, wheelset, groupset, selected);

  /**
   * Collisions are never silent. Rendering both records would show the same part
   * twice; rendering only the winner would hide that a source disagrees. Logging the
   * full set makes the discrepancy actionable.
   */
  useEffect(() => {
    if (partSourceReport.collisions.length) {
      console.warn(
        "零件来源 id 冲突（已按优先级取用）：",
        partSourceReport.collisions.map((c) => `${c.id}: ${c.winner} 取代 ${c.losers.join(", ")}`),
      );
    }
    if (partSourceReport.droppedSamples.length) {
      console.warn("示例零件与真实零件 id 重复，已丢弃示例条目：", partSourceReport.droppedSamples);
    }
    if (partSourceReport.internalDuplicates.length) {
      console.error("同一来源内部存在重复 id（优先级无法解决）：", partSourceReport.internalDuplicates);
    }
  }, [partSourceReport]);

  const choose = (category: ComponentCategory, id: string) =>
    setBuild((current) => ({ ...current, selections: { ...current.selections, [category]: id } }));
  const chooseSize = (category: ComponentCategory, size: string) =>
    setBuild((current) => ({ ...current, sizes: { ...current.sizes, [category]: size } }));
  const restore = (category: ComponentCategory) => {
    const factoryId = build.factorySelections?.[category];
    if (factoryId) choose(category, factoryId);
  };

  /**
   * Load a catalog bicycle into the Workshop with its ORIGINAL factory components.
   * The bicycle must never become an empty frame.
   */
  const startFromCatalogBike = (bike: Bicycle) => {
    // Never carry a selection from a different bicycle into the new build.
    const load = toWorkshopBuild(bike);
    setSelectedBike(bike);
    setFactoryComponents(load.components);
    setBuild({
      mode: "complete-bike",
      baseBikeId: bike.id,
      selections: load.selections,
      sizes: {},
      factorySelections: load.selections,
    });
    setLoadNotice(
      `已载入 ${load.loadedSlots.length} 项原厂零件` +
        (load.missingSlots.length ? `，${load.missingSlots.length} 项官方未公布` : ""),
    );
    window.setTimeout(() => document.getElementById("workshop")?.scrollIntoView({ behavior: "smooth" }), 0);
  };

  const save = () => {
    window.localStorage.setItem("bike-shop-build", JSON.stringify(build));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  return (
    <main>
      <header className="site-header">
        <a className="wordmark" href="#top">
          WORKSHOP<span>/</span>
        </a>
        <nav>
          <a className="active" href="#frame">
            开始配置
          </a>
          <a href="#complete-bikes">整车推荐</a>
          <a href="#catalog">车型数据库</a>
          <a href="#data-quality">数据质量</a>
        </nav>
        <button className="header-action" onClick={save}>
          {saved ? "已保存" : "保存配置"}
          <span>↗</span>
        </button>
      </header>

      <div className="workshop-shell" id="top">
        <div className="intro">
          <div>
            <span className="eyebrow">你的骑行 / 个性配置</span>
            <h1>
              打造一辆
              <br />
              <em>值得骑的车。</em>
            </h1>
          </div>
          <p>共 {catalog.length} 条中国公路车记录。选择零件，细节交给我们帮你检查。</p>
        </div>

        <BikeRecommendations onSelect={startFromCatalogBike} />
        <CatalogExplorer onSelect={startFromCatalogBike} />
        <BrandDirectory />

        {selectedBike ? (
          <div className="recommendation-picked">
            <span>已载入整车</span>
            <strong>
              {displayName({ brand: selectedBike.brand, family: selectedBike.family, tier: selectedBike.tier, trim: selectedBike.trim })}
            </strong>
            <span>
              {selectedBike.modelYear ? `${selectedBike.modelYear} 年款 · ` : ""}
              {selectedBike.groupset ?? "套件未公布"} · {loadNotice}
            </span>
          </div>
        ) : null}

        <div className="workshop-grid" id="workshop">
          <div className="visual-column">
            <BikeVisualizer
              frame={frame}
              wheelset={wheelset}
              groupset={groupset}
              tires={tires}
              handlebar={handlebar}
              saddle={saddle}
              factoryImage={build.mode === "complete-bike" ? selectedBike?.image?.url : undefined}
            />
            <div className="visual-caption">
              <span>{frame?.model ?? "等待选择车架"}</span>
              <span>{wheelset?.model ?? "等待选择轮组"}</span>
              <span>{groupset?.model ?? "等待选择套件"}</span>
            </div>
            {/*
              Source conflicts are surfaced rather than hidden. A silent collision is
              how a sample price ends up displacing a sourced one, so the count stays
              visible in the UI until it reaches zero.
            */}
            {partSourceReport.collisions.length || partSourceReport.droppedSamples.length || partSourceReport.internalDuplicates.length ? (
              <p className="parts-collision-note">
                零件来源冲突：id 冲突 {partSourceReport.collisions.length} 项、
                示例零件被真实数据取代 {partSourceReport.droppedSamples.length} 项
                {partSourceReport.internalDuplicates.length
                  ? `、同源重复 id ${partSourceReport.internalDuplicates.length} 项`
                  : ""}
                。已按「原厂件 &gt; 原厂配置 &gt; 已编目零件 &gt; 示例零件」取用，明细见控制台。
              </p>
            ) : null}
          </div>
          <BuildSummary
            components={selected}
            results={results}
            factorySelections={build.factorySelections ?? {}}
            subtotal={summary.partsSubtotal}
            weight={summary.totalWeight}
            baseBikePrice={baseBikePrice}
            baseBikeCurrency={selectedBike?.price.sourceCurrency ?? "CNY"}
            basePriceKnown={basePriceKnown}
            basePriceCaption={basePriceCaption}
            basePriceReference={basePriceReference?.text ?? null}
            modificationSpend={summary.modificationSpend}
            onSave={save}
          />
        </div>

        <div className="selection-area">
          <div className="selection-intro">
            <span className="eyebrow">02 / 配置流程</span>
            <h2>
              {build.mode === "complete-bike" ? (
                <>
                  从原厂配置，
                  <br />
                  <em>开始改装。</em>
                </>
              ) : (
                <>
                  先从
                  <br />
                  <em>核心零件开始。</em>
                </>
              )}
            </h2>
            <p>
              {build.mode === "complete-bike"
                ? `${selectedBike?.brand ?? ""} ${selectedBike?.family ?? ""} 原厂配置已载入。替换任意零件即可开始定制。`
                : "先确定车架、轮组和套件，再逐步完成剩余配置。每次选择都会立即更新上方整车。"}
            </p>
          </div>
          <div className="selectors">
            {categories.map((category) => (
              <ProductSelector
                key={category}
                category={category}
                products={allComponents.filter((product) => product.category === category)}
                selectedId={build.selections[category]}
                selectedSize={build.sizes?.[category]}
                factoryId={build.factorySelections[category]}
                onSelect={(id) => choose(category, id)}
                onSizeChange={(size) => chooseSize(category, size)}
                onRestore={() => restore(category)}
              />
            ))}
          </div>
        </div>

        <DataQualityReport />
      </div>

      <footer>
        <span>WORKSHOP / 2026</span>
        <span>为更远的路而造</span>
      </footer>
    </main>
  );
}