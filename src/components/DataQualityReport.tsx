import { buildCatalogReport } from "@/lib/catalog";
import { rejectedProducts } from "@/data/catalog";
import { catalogComponentStats } from "@/lib/catalog/componentAdapters";
import { componentCatalogStats } from "@/data/components";

/**
 * Data coverage / quality report.
 *
 * Deliberately answers the ten questions the brief asks for instead of printing a
 * bare import count, and lists the rejected products with reasons so the gaps are
 * auditable.
 */
export function DataQualityReport() {
  const report = buildCatalogReport();
  const parts = catalogComponentStats();
  const registry = componentCatalogStats();

  const headline = [
    { label: "导入品牌", value: report.brandsImported, hint: `另有 ${report.brandsQueued} 个品牌列为未来导入目标` },
    { label: "车系（family）", value: report.familiesImported, hint: "含仅登记分类的未来车系" },
    { label: "整车记录", value: report.completeBikes, hint: "productType = complete-bike" },
    { label: "车架组记录", value: report.framesets, hint: "与整车分开存储，不合并" },
    { label: "已核实价格", value: report.verifiedPrices, hint: "price 字段有值，且标注价格类型（中国建议零售价 / 折算参考价）" },
    { label: "仅参考价（未核实）", value: report.referencePricesOnly, hint: "存入 referencePrice，不进入 price" },
    { label: "已核实重量", value: report.verifiedWeights, hint: "每条重量都带重量定义（整车 / 裸车架 / 轮组）" },
    { label: "可载入原厂配置", value: report.loadableFactoryBuilds, hint: "点击「用这辆车开始选配」会载入真实原厂零件，而不是空车架" },
    { label: "完整原厂配置", value: report.completeFactoryBuilds, hint: "官方公布到套件 / 轮组 / 外胎 / 操控组件级别，可完整复现" },
    { label: "官方图片", value: report.officialImages, hint: "仅保存官方产品页图片，并保留图片出处" },
    { label: "仅结构记录（无价格/重量/配置）", value: report.structureOnly, hint: "为了让车系与别名搜索可用而保留，不计入产品覆盖度" },
    { label: "因数据不足被拒", value: report.rejected, hint: "原因见下方清单" },
  ];

  /**
   * The component catalogues are reported separately from bicycle coverage: a
   * groupset count is not a bike count, and mixing them would overstate how much of
   * the bicycle market is covered.
   */
  const componentRows = [
    { label: "套件（精确世代）", value: registry.groupsets, hint: "R7170 / R8170 / E1 等世代分开存储，不合并为「105」" },
    { label: "轮组", value: registry.wheelsets, hint: "重量标为轮组重量；OEM 专供轮组不带零售价" },
    { label: "零件（Giant / CADEX）", value: registry.components, hint: "Contact / Contact SL / SLR 等为独立产品" },
    { label: "传动 SKU", value: registry.drivetrainSkus, hint: "11-34 与 11-36 飞轮、50/34 牙盘各自独立" },
    { label: "制动组（手变+卡钳+碟片）", value: registry.brakeGroups, hint: "制动按组成件建模，不合并为一个模糊的「刹车」" },
    { label: "轮组导入目标品牌", value: registry.wheelsetIngestionTargets, hint: "已登记、尚未取得官方数据的品牌，用于诚实报告覆盖缺口" },
  ];

  const pricedComponents = parts.withPrice;
  const weightedComponents = parts.withWeight;

  return (
    <section className="quality-report" id="data-quality">
      <div className="quality-heading">
        <div>
          <span className="eyebrow">数据质量与覆盖范围</span>
          <h2>
            有多少数据，
            <br />
            <em>以及缺了哪些。</em>
          </h2>
        </div>
        <p>
          我们不使用随机博客、论坛或电商经销商描述作为技术规格的主要来源。价格或重量无法确认时保存为{" "}
          <code>null</code>，而不是编造一个看起来合理的数字。
          <br />
          <br />
          总记录数里包含 <strong>{report.structureOnly}</strong> 条<strong>仅结构记录</strong>
          （来自 Pardus、Camp 等官方站点当前无法访问的品牌）。它们只承载车系与搜索别名，
          让搜索能正确定位，但不含任何价格、重量或原厂配置，因此单独列出，不计入产品覆盖度。
        </p>
      </div>

      <div className="quality-grid">
        {headline.map((item) => (
          <div className="quality-card" key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <small>{item.hint}</small>
          </div>
        ))}
      </div>

      <div className="quality-table-wrap">
        <div className="quality-table-title">
          <h3>零件与套件目录</h3>
          <span>
            共 {parts.total} 项，其中 {pricedComponents} 项有价格来源、{weightedComponents} 项有重量来源
          </span>
        </div>
        <div className="quality-grid">
          {componentRows.map((item) => (
            <div className="quality-card" key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <small>{item.hint}</small>
            </div>
          ))}
        </div>
      </div>

      <div className="quality-table-wrap">
        <div className="quality-table-title">
          <h3>按厂商分列</h3>
          <span>共 {report.totalRecords} 条产品记录</span>
        </div>
        <table className="quality-table">
          <thead>
            <tr>
              <th>厂商</th>
              <th>来源等级</th>
              <th>车系</th>
              <th>整车</th>
              <th>车架组</th>
              <th>已核实价格</th>
              <th>仅参考价</th>
              <th>已核实重量</th>
              <th>可载入原厂配置</th>
              <th>完整原厂配置</th>
              <th>官方图片</th>
              <th>仅结构记录</th>
              <th>部分数据</th>
            </tr>
          </thead>
          <tbody>
            {report.byManufacturer.map((row) => (
              <tr key={row.manufacturer}>
                <td>
                  <strong>{row.manufacturer}</strong>
                </td>
                <td>Tier {row.sourceTier}{row.sourceTier > 1 ? "（含官方全球页）" : ""}</td>
                <td>{row.families}</td>
                <td>{row.completeBikes}</td>
                <td>{row.framesets}</td>
                <td>{row.verifiedPrices}</td>
                <td>{row.referencePricesOnly}</td>
                <td>{row.verifiedWeights}</td>
                <td>{row.loadableFactoryBuilds}</td>
                <td>{row.completeFactoryBuilds}</td>
                <td>{row.officialImages}</td>
                <td>{row.structureOnly}</td>
                <td>{row.partialRecords}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="quality-sources">
        <h3>各厂商使用的来源网址</h3>
        {report.byManufacturer.map((row) => (
          <div className="quality-source-group" key={row.manufacturer}>
            <strong>
              {row.manufacturer} <span>数据来源等级 Tier {row.sourceTier}</span>
            </strong>
            <ul>
              {row.sourceUrls.map((url) => (
                <li key={url}>
                  <a href={url} target="_blank" rel="noreferrer">
                    {url}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="quality-rejections">
        <h3>因数据不足而拒绝导入的产品（{rejectedProducts.length}）</h3>
        <div className="quality-rejection-list">
          {rejectedProducts.map((item) => (
            <div className="quality-rejection" key={`${item.brand}-${item.label}`}>
              <div>
                <strong>{item.brand}</strong>
                <span>{item.label}</span>
              </div>
              <p>{item.reason}</p>
              <a href={item.attemptedUrl} target="_blank" rel="noreferrer">
                尝试来源 ↗
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

