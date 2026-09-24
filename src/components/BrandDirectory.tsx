"use client";

import { useMemo, useState } from "react";
import { brands, catalog, familiesByBrand } from "@/data/catalog";
import type { Bicycle } from "@/types/catalog";

/**
 * Brand → Family → Variant browsing for the ingested China-market brands.
 *
 * All three levels are optional: you can read a brand's whole family list, or drill
 * straight into one family's variants without picking a tier first.
 */
export function BrandDirectory() {
  const [openBrand, setOpenBrand] = useState<string | undefined>();
  const [openFamily, setOpenFamily] = useState<string | undefined>();

  const ingested = useMemo(() => brands.filter((brand) => brand.status === "ingested"), []);
  const queued = useMemo(() => brands.filter((brand) => brand.status === "ingestion-target"), []);

  return (
    <section className="brand-directory" id="brands">
      <div className="directory-heading">
        <span className="eyebrow">品牌 → 车系 → 配置</span>
        <h2>
          从品牌，找到
          <br />
          <em>你的那一辆。</em>
        </h2>
        <p>
          大型品牌只按品牌筛选已经不够用。展开任意品牌可看到车系层级，以及车系内部的性能层级与配置。
        </p>
      </div>

      <div className="brand-list">
        {ingested.map((brand) => {
          const isOpen = openBrand === brand.name;
          const brandFamilies = familiesByBrand[brand.name] ?? [];
          const productCount = catalog.filter((bike) => bike.brand === brand.name).length;
          return (
            <div className={`brand-block ${isOpen ? "is-open" : ""}`} key={brand.name}>
              <button
                type="button"
                className="brand-row brand-row-button"
                onClick={() => {
                  setOpenBrand(isOpen ? undefined : brand.name);
                  setOpenFamily(undefined);
                }}
                aria-expanded={isOpen}
              >
                <strong>
                  {brand.name} {brand.nameCN ? <small>{brand.nameCN}</small> : null}
                </strong>
                <span>{brandFamilies.map((family) => family.family).join(" · ")}</span>
                <b>
                  {productCount} 个产品 {isOpen ? "−" : "+"}
                </b>
              </button>

              {isOpen ? (
                <div className="brand-families">
                  {brandFamilies.map((family) => {
                    const familyProducts = catalog.filter(
                      (bike) => bike.brand === brand.name && bike.family === family.family,
                    );
                    const isFamilyOpen = openFamily === family.family;
                    return (
                      <div className="family-block" key={family.family}>
                        <button
                          type="button"
                          className="family-row"
                          onClick={() => setOpenFamily(isFamilyOpen ? undefined : family.family)}
                          aria-expanded={isFamilyOpen}
                        >
                          <strong>{family.family}</strong>
                          <span>{family.positioning}</span>
                          <b>{familyProducts.length}</b>
                        </button>
                        {isFamilyOpen ? (
                          <div className="family-detail">
                            <div className="catalog-tier-row">
                              <span>性能层级</span>
                              <div>
                                {family.tiers.length ? (
                                  family.tiers.map((tier) => <span key={tier}>{tier}</span>)
                                ) : (
                                  <span>该车系未划分独立性能层级</span>
                                )}
                              </div>
                            </div>
                            {familyProducts.length ? (
                              <ul className="family-variants">
                                {familyProducts.map((bike) => (
                                  <li key={bike.id}>
                                    <span>{variantLabel(bike)}</span>
                                    <em>
                                      {bike.productType === "frameset" ? "车架组" : "整车"}
                                      {bike.modelYear ? ` · ${bike.modelYear} 年款` : ""}
                                    </em>
                                    <a href={bike.source.productUrl} target="_blank" rel="noreferrer">
                                      官方 ↗
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="catalog-empty catalog-empty-inline">
                                已登记车系与分类，尚未取得可核实的车型数据。
                              </p>
                            )}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}

        <div className="brand-queued">
          <span>未来导入目标（刻意不含虚构产品）</span>
          <div>
            {queued.map((brand) => (
              <a key={brand.name} href={brand.officialUrl} target="_blank" rel="noreferrer">
                {brand.name}
                {brand.nameCN ? ` · ${brand.nameCN}` : ""}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/** Variant label keeps the hierarchy visible: family · tier · trim · year. */
function variantLabel(bike: Bicycle): string {
  const parts = [bike.family];
  if (bike.tier && bike.tier !== bike.family) parts.push(bike.tier);
  if (bike.trim && bike.trim !== bike.tier) parts.push(bike.trim);
  return parts.join(" · ");
}
