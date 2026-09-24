# 中国公路车数据目录（China road bicycle catalog）

本目录存放**按厂商拆分的真实车型记录**。每条记录都保留官方来源 URL、来源等级与抓取日期。

## 目录结构

```
src/types/catalog.ts         归一化后的数据模型（Bicycle / BrandRecord / BicycleFamily / ...）
src/data/catalog/
  taxonomy.ts                品牌与「品牌 → 车系 → 性能层级」分类，含搜索别名
  giant.ts                   GIANT 中国站 — 生成文件，勿手改
  giant-framesets.ts         GIANT 全球站车架组（Tier 2，USD）
  merida.ts  pardus.ts  camp.ts  xds.ts  seka.ts  winspace.ts
  rejected.ts                因数据不足而拒绝导入的产品与原因
  helpers.ts                 catalogId() / source() 等构造工具
  index.ts                   汇总为单一 `catalog` 数组
src/lib/catalog/
  normalize.ts               搜索归一化（全角、大小写、空格、连字符、缩写、查询覆盖率）
  search.ts                  搜索、品牌解析、品牌 → 车系 → 配置浏览
  stats.ts                   数据质量与覆盖范围统计
  workshopLoad.ts            整车原厂配置 → Workshop 零件
scripts/
  ingest-giant-cn.mjs        抓取 GIANT 中国站 → scripts/.giant-cn-raw.json
  generate-giant.mjs          把缓存转成 src/data/catalog/giant.ts
  verify-catalog.ts           目录不变量校验（可接入 CI）
```

## 抓取（scraping）

**先试 `Invoke-WebRequest -UseBasicParsing`。** 很多中国厂商官网是服务端渲染的，
只是看起来像 JS 驱动。`giant.com.cn` 就是这种情况 —— 一开始判断它「被屏蔽」是错的，
真实原因是 URL 猜错了。

只有纯 HTTP 取不到时，才用无头浏览器（`open_browser_page` + 运行 Playwright 代码）
先枚举出真实产品 URL，再回头用普通 HTTP 抓取这些 URL。

GIANT 中国站的真实端点：
```
列表：https://www.giant.com.cn/index.php/index/bike_finder.html?surface=3   （surface=3 = 铺设路面 ROAD）
详情：https://www.giant.com.cn/index.php/index/bike_view.html?id=<id>
```
详情页包含 建议售价（MSRP）、规格 `<table>` 原厂配置、官方产品图。
`giant.ts` 由 `scripts/generate-giant.mjs` 生成，不要手改；要更新就重跑这两个脚本。

**长任务注意**：脚本输出请重定向到文件。`| Select-Object -First N` 会提前结束进程，
把输出文件和后续逻辑一起截断。

## 核心规则

1. **名称绝不作为单一字符串存储。**
   身份由 `brand + family + tier + trim + modelYear (+ generation)` 组成。
   `Advanced` / `Advanced Pro` / `Advanced SL` 是**性能层级**，不是车系。
2. **不确定就不写。** 价格、重量、规格无法确认时保存为 `null`，并可选地在
   `referencePrice` / `priceNote` 里说明「有一个数字但尚未核实」。
3. **重量必须带定义。** 每条重量都有 `kind`（整车 / 裸车架 / 未涂装车架 / 车架+前叉）
   以及尺寸与是否含漆。裸车架实验室重量永远不会被当作整车重量使用。
4. **价格保留原币种。** 官方商店报价 USD 就存 USD，不做汇率换算。
5. **车架组与整车分开。** `productType: "complete-bike" | "frameset"`。
6. **同名不同车型年不合并。** 例如 `REACTO 6000 25'` 与 `REACTO 6000 CN 27'` 是两条记录。
7. **数据来源优先级**：官方中国产品页 → 官方全球产品页 → 官方商城 → 授权官方店铺 → 其他。
8. **搜索别名**是必需的，不是可选项。中文昵称、缩写、甚至常见错别字（锐豹 → 瑞豹）
   都存进 `aliases`，搜索时统一归一，不会产生重复条目。

## 新增一个品牌

1. 在 `src/data/catalog/` 新建 `yourbrand.ts`，导出 `Bicycle[]`。
   如果来源站点可抓取，优先写 `scripts/ingest-yourbrand.mjs` + `generate-yourbrand.mjs`，
   让记录由脚本生成而不是手抄。
2. 在 `index.ts` 里展开该数组。
3. 在 `taxonomy.ts` 的 `brands` 与 `families` 中登记品牌与车系。
4. 在 `rejectedProducts` 里登记被排除的产品与原因（童车、计时车、城市车等）。
5. 运行校验：

```bash
npm run verify:catalog
npm run typecheck
```

校验脚本会检查：必需搜索词是否都能解析、是否存在重复身份组合、
是否有缺少定义的重量、ADV 是否被错误当作车系等等。**任何一条失败都会让脚本以非零状态退出。**

## 已在 `/data-quality` 页面暴露的数据质量指标

导入品牌 · 未来导入品牌 · 车系 · 整车 · 车架组 · 已核实价格 · 仅参考价 ·
已核实重量 · 可载入原厂配置 · 完整原厂配置 · 官方图片 · 被拒记录。

"可载入原厂配置"指点击「用这辆车开始选配」后 Workshop 能载入真实原厂零件；
"完整原厂配置"指官方公布到套件 / 轮组 / 外胎 / 操控组件级别，可完整复现整车。
两个数字分开统计，避免夸大覆盖度。