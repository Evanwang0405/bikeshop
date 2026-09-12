import { brandDirectory } from "@/data/products";

export function BrandDirectory() {
  return <section className="brand-directory" id="brands">
    <div className="directory-heading"><span className="eyebrow">品牌目录</span><h2>从品牌，找到<br /><em>你的那一辆。</em></h2><p>以下型号和分类来自品牌官网目录。点击品牌名查看最新配置、尺寸和官方图片。</p></div>
    <div className="brand-list">{brandDirectory.map((brand) => <a className="brand-row" href={brand.officialUrl} target="_blank" rel="noreferrer" key={brand.name}><strong>{brand.name}</strong><span>{brand.models.join(" · ")}</span><b>官网 ↗</b></a>)}</div>
  </section>;
}
