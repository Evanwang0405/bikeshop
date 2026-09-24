import { RETRIEVED_AT } from "./helpers";
import type { RejectedProduct } from "@/types/catalog";

/**
 * Products that were considered for import and rejected because the data was not
 * sufficient to store honestly.
 *
 * This matters: the brief explicitly asks for the count of items rejected rather
 * than being told "N products imported" and stopping there. Keeping the reasons
 * here documents why the catalogue is smaller than it could be, and what to fetch
 * next.
 *
 * RESOLVED (2026-09-24): the earlier GIANT "blocked site" entries were removed.
 * `giant.com.cn` turned out to be server-rendered — the original failure was
 * guessed URL patterns, not JS rendering. All 53 GIANT road models now carry a
 * page-verified 建议售价, and the MSRPs match the ones the brief supplied.
 */
export const rejectedProducts: RejectedProduct[] = [
  {
    brand: "Giant",
    label: "FastRoad 16 / 20 / 24 JR 童车",
    reason: "官方车查找器收录，但属于 16–24 英寸童车，不属于成人公路车目录。",
    attemptedUrl: "https://www.giant.com.cn/index.php/index/bike_finder.html?surface=3",
    retrievedAt: RETRIEVED_AT,
  },
  {
    brand: "Giant",
    label: "Trinity Advanced SL 0 / 1 / 2（计时 / 铁三车）",
    reason:
      "官方收录且价格可核实（¥83,800 / ¥55,800 / ¥45,800），但属于 TT / 铁三定位，本目录的 category 枚举尚无对应值，需先扩展分类再导入。",
    attemptedUrl: "https://www.giant.com.cn/index.php/index/bike_view.html?id=3516",
    retrievedAt: RETRIEVED_AT,
  },
  {
    brand: "Giant",
    label: "Speeder / Amplify / PRE / PRE PRO（城市休闲车）",
    reason: "官方收录且价格可核实，但定位为城市通勤 / 休闲，不是公路车，故不纳入本目录。",
    attemptedUrl: "https://www.giant.com.cn/index.php/index/bike_finder.html?surface=3",
    retrievedAt: RETRIEVED_AT,
  },
  {
    brand: "Giant",
    label: "车架几何表（尺寸、Stack / Reach 等）",
    reason:
      "GIANT 中国站的车架几何表由 Vue 客户端渲染，纯 HTTP 抓取取不到，因此几何数值未导入。53 条记录中只有 6 条能从官方组件规格文本中读到尺寸列表，其余 sizes 保持 null。",
    attemptedUrl: "https://www.giant.com.cn/index.php/index/bike_view.html?id=3470",
    retrievedAt: RETRIEVED_AT,
  },
  {
    brand: "Giant",
    label: "整车重量",
    reason:
      "GIANT 中国站产品页不公布整车重量，因此 53 条记录的 weights 全部为空。按需求不用估算值填充。",
    attemptedUrl: "https://www.giant.com.cn/index.php/index/bike_view.html?id=3470",
    retrievedAt: RETRIEVED_AT,
  },
  {
    brand: "Merida",
    label: "REACTO 10K（第五代）",
    reason: "第五代发布资料提及 REACTO 10K 的重量与风洞数据，但中国目录未列出该型号产品页，缺少可核实的配置记录。",
    attemptedUrl: "https://www.merida.cn/index/bike/chexitese?slug=reacto",
    retrievedAt: RETRIEVED_AT,
  },
  {
    brand: "Merida",
    label: "SCULTURA CARBON 24'",
    reason: "官方目录条目缺少套件与刹车等关键规格，仅能确认材质与速别，信息不足以构成完整整车记录。",
    attemptedUrl: "https://www.merida.cn/zh-tw/bikefinder?category_id=92",
    retrievedAt: RETRIEVED_AT,
  },
  {
    brand: "Pardus",
    label: "ROBIN EVO 各世代、SPKG4 EVO、SUPER 具体整车",
    reason:
      "官方 Pardus 站点（parduscycling.com / pardus.com.cn / pardus.cn）在抓取时未返回可读产品内容；缺价格、原厂零件清单与可核实的车型年，仅保留车系层级记录。",
    attemptedUrl: "https://www.parduscycling.com/",
    retrievedAt: RETRIEVED_AT,
  },
  {
    brand: "Camp",
    label: "ACE / SR / RADON 全部整车与车架组的官方规格",
    reason:
      "campbike.cn 未返回可读产品内容；campbike.com 与 campbikes.com 为域名停放页，属不可用来源。缺少官方主源，故仅保留 referencePrice 与结构记录。",
    attemptedUrl: "https://www.campbike.cn/",
    retrievedAt: RETRIEVED_AT,
  },
  {
    brand: "XDS",
    label: "RT 系列、RC 系列、极速系列具体车款",
    reason:
      "官方旗舰分类已按需求映射到推荐标签，但目录页未提供这些系列可核实的单车型年价格与规格，故不生成产品记录。",
    attemptedUrl: "https://www.xidesheng.com/goods",
    retrievedAt: RETRIEVED_AT,
  },
  {
    brand: "XDS",
    label: "AD9 整车（中国国家冠军版整车，¥26,980 与车架组 ¥21,800 之外的标准整车）",
    reason: "官方目录同一卡片同时呈现整车礼遇与车架组两种商品形态，价格指向不唯一，未强行归并。",
    attemptedUrl: "https://www.xidesheng.com/goods",
    retrievedAt: RETRIEVED_AT,
  },
  {
    brand: "SEKA",
    label: "SPEAR / EXCEED 整车",
    reason: "官方以车架组、车把与零配件为主，未公布整车配置与整车重量，无法构成完整整车记录。",
    attemptedUrl: "https://www.sekabikes.com/spear/",
    retrievedAt: RETRIEVED_AT,
  },
  {
    brand: "Winspace",
    label: "T1600 / M6 / Agile / G5 等其它平台",
    reason: "官方商店明确在售，但本次批次优先覆盖需求点名的 T1550 Gen 2 / SLC3.0 / C5 Aero / G3 四个平台，其余留待后续批次。",
    attemptedUrl: "https://www.winspace.cc/collections/aero-performance",
    retrievedAt: RETRIEVED_AT,
  },
  {
    brand: "SAVA / JAVA / Twitter / Trinx 等 15 个未来品牌",
    label: "全部车款",
    reason:
      "按需求列为后续导入目标，仅登记品牌记录与官网地址，刻意不生成任何虚构产品目录。",
    attemptedUrl: "https://www.xidesheng.com/goods",
    retrievedAt: RETRIEVED_AT,
  },
];