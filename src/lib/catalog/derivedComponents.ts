import type { Bicycle, FactoryBuildSlots } from "@/types/catalog";
import type {
  Component,
  ComponentCategory,
  CompatibilityAttributes,
  FactoryBuild,
} from "@/types/bike";
import { catalog } from "@/data/catalog";
import { SLOT_TO_CATEGORY } from "./workshopLoad";
import { factoryBuildSlots } from "@/types/catalog";

/**
 * Real components derived from manufacturer-verified factory builds.
 *
 * WHY THIS EXISTS
 * The Workshop's part picker used to be filled with formula-generated sample parts
 * (`price: 899 + index * 115`) carrying real brand names. That is worse than a
 * placeholder: a plausible-looking number attached to a real product name invites a
 * reader to believe it. This module replaces that with parts that genuinely exist,
 * because they were read off the 规格 tables of the bicycles in `src/data/catalog`.
 *
 * WHAT IT PROMISES, AND WHAT IT DOES NOT
 *   · `priceBasis: "unknown"`  — manufacturers publish no per-part price for an OEM
 *     part, so `price` is 0 and the UI must show "价格未知" rather than ¥0.
 *   · `weightBasis: "unknown"` — checked across all 22 GIANT spec keys and every
 *     MERIDA spec table: neither publishes component weights. `weight` is 0 and the
 *     UI must show "重量未公布" rather than a fabricated gram count.
 *   · `source`                 — every part points at the bicycle page it was read
 *     from, so a part can always be traced back to its evidence.
 *   · `usedOnBikeIds`          — which catalog bikes this exact part appears on.
 *
 * Ordering is by `usedOnBikeIds.length` descending via `sortComponentsForBrowsing`,
 * so a GIANT P-R2 wheelset (fitted to many models) outranks a one-off part.
 */

/**
 * Extract the drivetrain *series* from a spec value so shifters, front and rear
 * derailleur collapse into one groupset entry.
 *
 * "SRAM RED AXS HRD, ED-RED-E1", "SRAM RED AXS FD-RED-E-E1" and
 * "SRAM RED AXS RD-RED-E-E1" are one product sold as a groupset, not three parts.
 */
function groupsetSeries(value: string): string | null {
  const shimano = value.match(/\b(Dura-?Ace|Ultegra|105|Tiagra|Claris|Sora|GRX)\b(?:\s*(Di2|R\d{4}|RX\d{3}))?/i);
  if (shimano) {
    const tier = shimano[1].replace(/\s+/g, "-").toLowerCase();
    const gen = shimano[2] ? ` ${shimano[2].toLowerCase()}` : "";
    return `shimano-${tier}${gen}`;
  }
  const sram = value.match(/\b(RED|Force|Rival|Apex)\b(?:\s*(AXS|eTap))?/i);
  if (sram) return `sram-${sram[1].toLowerCase()}${sram[2] ? ` ${sram[2].toLowerCase()}` : ""}`;

  const magene = value.match(/\b(PES|QED|TEO)\b/i);
  if (magene) return `magene-${magene[1].toLowerCase()}`;

  // 1x / Classified-style setups: fall back to a stable short signature.
  return null;
}

/**
 * Generic words that describe what a part *is* rather than which part it is.
 * Stripping them lets "Giant P-A2 (38mm with 21mm ID) Disc wheel set" and
 * "Giant P-A2" collapse into one wheelset instead of two entries.
 */
const GENERIC_TOKEN = /^(disc|wheel|wheelset|system|set|tubeless|folding|road|with|and|plus|for|brake|brakes|handlebar|stem|seatpost|saddle|chain|cassette|crankset|tire|tires|rim|hub|alloy|carbon)$/i;
const GENERIC_SUFFIX = /轮组|车把|座管|座垫|坐垫|齿盘|飞轮|链条|碟刹|刹车|把立|外胎|把手|把横|轴心|培林/i;
const UNIT_TOKEN = /^\d+(?:\.\d+)?\s*(?:mm|g|kg|t|s|c|sp|speed)$/i;

/**
 * The core model identifier of a spec value: the leading tokens before any generic
 * word, unit or qualifier. This is what decides whether two spec strings describe
 * the same product.
 */
function coreModel(value: string): string {
  const withoutParens = value.replace(/[（(][^）)]*[）)]/g, " ");
  const tokens = withoutParens.split(/[\s,;，；]+/).filter(Boolean);
  const kept: string[] = [];
  for (const token of tokens) {
    if (GENERIC_TOKEN.test(token) || GENERIC_SUFFIX.test(token) || UNIT_TOKEN.test(token)) break;
    kept.push(token);
    if (kept.length >= 4) break;
  }
  return normalizeKeyPart(kept.length ? kept.join(" ") : value);
}

/**
 * A coarse identity for a part, so that colour/size/regional variants of the same
 * product fold into a single entry while genuinely different products stay apart.
 */
function partIdentityFor(category: ComponentCategory, value: string): string {
  if (category === "groupset" || category === "brakes") {
    const series = groupsetSeries(value);
    if (series) return series;
  }
  if (category === "crankset" || category === "cassette") {
    // Keep the gear ratio: a 50/34 and an 11-34 are different products.
    const ratio = value.match(/\b(\d{2}\/\d{2})\b/)?.[1] ?? "";
    const range = value.match(/\b(\d{2}\s*[-x×]\s*\d{2,3})\b/)?.[1] ?? "";
    return `${coreModel(value)} ${range || ratio}`.trim();
  }
  if (category === "tires") {
    // Tread model plus size; 700x25 and 700x28 are different products.
    const size = value.match(/(\d{3}\s*[xX×]\s*\d{2,3}\s*[cC]?)/)?.[1] ?? "";
    return `${coreModel(value)} ${normalizeKeyPart(size)}`.trim();
  }
  return coreModel(value);
}

function normalizeKeyPart(value: string): string {
  return value
    .toLowerCase()
    .replace(/[（(][^）)]*[）)]/g, " ")
    .replace(/\b(xs|s|m|m\/l|ml|l|xl|2xl|3xs|xxs)\s*[:：]/g, " ")
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Shorten a spec value for display.
 *
 * GIANT's wheelset field folds in rim, hub and spoke detail, producing values like
 * "GIANT ALP30 铝合金轮组（轮圈 GIANT GL30 Disc,Tubeless ready,铝合金双层轮圈…）".
 * The full text is kept in `specifications.原厂规格`; the display name takes the part
 * before the parenthetical so a parts list stays readable.
 */
function shortenForDisplay(value: string): string {
  const head = value.split(/[（(]/)[0].trim();
  return head.length >= 3 ? head : value.trim();
}

/** Components that are actually bicycle-branded frames, not third-party parts. */
const FRAME_SLOTS: (keyof FactoryBuildSlots)[] = ["frame", "fork"];

/** Slots with no matching Workshop category — surfaced elsewhere or not at all. */
const SLOTS_WITHOUT_CATEGORY: (keyof FactoryBuildSlots)[] = ["bottomBracket", "powerMeter", "pedals"];

/**
 * Component brands we can recognise inside a spec value.
 *
 * Order matters: longer / more specific names first so "DT Swiss" is not read as a
 * part called "DT". This is a whitelist on purpose — guessing a brand from the first
 * word produced garbage like a brand called "50-34T".
 */
const BRAND_PATTERNS: [RegExp, string][] = [
  [/\bDT\s*Swiss\b/i, "DT Swiss"],
  [/\bShimano\b/i, "Shimano"],
  [/\bSRAM\b/i, "SRAM"],
  [/\bCADEX\b/i, "CADEX"],
  [/\bGIANT\b/i, "Giant"],
  [/\bMERIDA\b/i, "Merida"],
  [/\bContinental\b/i, "Continental"],
  [/\bSchwalbe\b/i, "Schwalbe"],
  [/\bMaxxis\b/i, "Maxxis"],
  [/\bVittoria\b/i, "Vittoria"],
  [/\bPirelli\b/i, "Pirelli"],
  [/\bReynolds\b/i, "Reynolds"],
  [/\bNovatec\b/i, "Novatec"],
  [/\bVISION\b/i, "Vision"],
  [/\bBRANTA\b/i, "BRANTA"],
  [/\bMEGA\b/i, "MEGA"],
  [/\bMagene\b/i, "Magene"],
  [/\bTektro\b/i, "Tektro"],
  [/\b彦豪\b/, "Tektro"],
  [/\bKMC\b/i, "KMC"],
  [/\bFSA\b/i, "FSA"],
  [/\bPRO\b/i, "PRO"],
  [/\bSR\b/, "SR"],
  [/\bSLR\b/i, "Giant"],
  [/\bTRP\b/i, "TRP"],
  [/\bHope\b/i, "Hope"],
  [/\bZipp\b/i, "Zipp"],
  [/\bRitchey\b/i, "Ritchey"],
  [/\bSpecialized\b/i, "Specialized"],
  [/\bRoval\b/i, "Roval"],
  [/\bFizik\b/i, "Fizik"],
  [/\bPrologo\b/i, "Prologo"],
  [/\bSelle\s*Italia\b/i, "Selle Italia"],
];

function detectBrand(value: string): string | null {
  for (const [pattern, canonical] of BRAND_PATTERNS) {
    if (pattern.test(value)) return canonical;
  }
  return null;
}

/**
 * Values that name a material, a size or a generic description rather than a product.
 * Keeping these would fill the parts list with entries like "铝合金" or "700X25C".
 */
const NON_PRODUCT_PATTERNS = [
  /^\s*[\d]+\s*[xX×*]\s*[\d]+\s*[cC]?\s*$/i, // 700X25C
  /^\s*\d+\s*(?:速|s|sp|speed)\s*$/i, // 10速 / 10S
  /^\s*\d+\s*[-/]\s*\d+\s*[tT]?\s*$/, // 50-34T
  /^\s*(?:铝合金|碳纤维|高碳钢|钢|铝|钛|锻造|平面式|平锁式|开口|机械|液压|油压|公路专用|舒适|运动|零后移|中空一体|一体式|直把|平把|车轮|轮组|座管|座垫|座垫杆)\s*$/,
];
const NON_PRODUCT_SUBSTRINGS = /^(?:铝合金|碳纤维|锻造铝腿|平面式|平锁式|开口外胎|机械碟刹|液压碟刹|油压碟刹)/;

function isUsablePartName(value: string): boolean {
  const text = value.trim();
  if (text.length < 4) return false;
  if (NON_PRODUCT_PATTERNS.some((pattern) => pattern.test(text))) return false;
  if (NON_PRODUCT_SUBSTRINGS.test(text)) return false;
  // A spoiler means no identifiable part name: "10S公路专用碟刹" carries no model.
  if (/公路专用|平锁式|平面式|内走线/.test(text)) return false;
  if (/^\s*\d+\s*[sS]\s*$/.test(text)) return false;
  // Must contain something that looks like a model token: letters plus a digit,
  // or a recognisable brand name.
  const hasModelToken = /[a-z]{1,}[-\s]?\d{2,}|\d{2,}[-\s]?[a-z]{1,}/i.test(text);
  if (!hasModelToken && !detectBrand(text)) return false;
  return true;
}

type Accumulated = {
  category: ComponentCategory;
  rawValues: Set<string>;
  bikeIds: Set<string>;
  compatibility: CompatibilityAttributes;
  /** Best display value: the shortest raw value, which is usually the bare part name. */
  display: string;
};

function compatibilityFor(
  category: ComponentCategory,
  bike: Bicycle,
): CompatibilityAttributes {
  const specs = bike.frameSpecs ?? {};
  switch (category) {
    case "frame":
      return {
        wheelSize: specs.wheelSize ?? "700c",
        axleStandard: specs.axleRear ?? undefined,
        tireClearance: specs.tireClearanceMm ?? undefined,
        bottomBracket: specs.bottomBracket ?? undefined,
        seatpostDiameter: specs.seatpostDiameterMm ?? undefined,
        brakeType: "disc",
      };
    case "wheelset":
      return { wheelSize: specs.wheelSize ?? "700c", axleStandard: specs.axleRear ?? undefined };
    case "tires": {
      // Read a fitted tyre width (700x28c / 700X25C / 700x32) when stated.
      const width = bike.tires?.match(/700\s*[x×]\s*(\d{2,3})/i)?.[1];
      return { wheelSize: specs.wheelSize ?? "700c", tireWidth: width ? Number(width) : undefined };
    }
    case "groupset":
      return { brakeType: "disc", bottomBracket: specs.bottomBracket ?? undefined };
    case "crankset":
      return { drivetrainSpeed: drivetrainSpeedFrom(bike), groupsetFamily: groupsetFamilyFrom(bike) };
    case "cassette":
      return { drivetrainSpeed: drivetrainSpeedFrom(bike), freehub: undefined };
    case "chain":
      return { drivetrainSpeed: drivetrainSpeedFrom(bike), groupsetFamily: groupsetFamilyFrom(bike) };
    case "brakes":
      return { brakeType: "disc" };
    case "handlebar":
    case "stem":
      return {};
    case "seatpost":
      return { seatpostDiameter: specs.seatpostDiameterMm ?? undefined };
    default:
      return {};
  }
}

function drivetrainSpeedFrom(bike: Bicycle): number | undefined {
  const text = [bike.groupset, bike.crankset, bike.cassette].filter(Boolean).join(" ");
  const match = text.match(/(\d{2})\s*(?:s|速|speed)/i);
  if (match) return Number(match[1]);
  if (/\bdi2\b|eTap|AXS/i.test(text)) return 12;
  return undefined;
}

function groupsetFamilyFrom(bike: Bicycle): string | undefined {
  const text = [bike.groupset, bike.crankset].filter(Boolean).join(" ");
  if (/shimano|dura-ace|ultegra|105|tiagra|claris|sora|grx/i.test(text)) return "shimano-road";
  if (/sram|rival|force|red|apex/i.test(text)) return "sram-road";
  if (/magene|campagnolo|microshift/i.test(text)) return "other-road";
  return undefined;
}

export type DerivedComponent = Component & {
  /** Human-readable note explaining what is and is not known about this part. */
  provenanceNote: string;
};

/**
 * A display name for a part: the spec value with any leading brand removed and
 * parenthetical detail dropped, so the list reads "Ultegra Di2" not
 * "Shimano Ultegra Di2 FD-R8150".
 */
function modelNameFor(value: string, brand: string): string {
  const short = stripSizeTail(shortenForDisplay(value).replace(/\s*\n\s*/g, " ")).trim();
  if (!brand) return short;
  const escaped = brand.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const stripped = short.replace(new RegExp(`^${escaped}\\s*`, "i"), "").trim();
  return stripped.length >= 3 ? stripped : short;
}

/** Canonical brand casing, keyed lowercase, so one brand never splits into two entries. */
const BRAND_CASING: Record<string, string> = {
  shimano: "Shimano",
  sram: "SRAM",
  giant: "Giant",
  merida: "Merida",
  cadex: "CADEX",
  kmc: "KMC",
  branta: "BRANTA",
  camp: "CAMP",
  continental: "Continental",
  "dt swiss": "DT Swiss",
  fsa: "FSA",
  magene: "Magene",
  maxxis: "Maxxis",
  mega: "MEGA",
  novatec: "Novatec",
  reynolds: "Reynolds",
  schwalbe: "Schwalbe",
  sr: "SR",
  tektro: "Tektro",
  vision: "Vision",
  winspace: "Winspace",
  xds: "XDS",
  pardus: "Pardus",
  seka: "SEKA",
};
function canonicalBrand(value: string): string {
  const key = value.trim().toLowerCase().replace(/\s+/g, " ");
  return BRAND_CASING[key] ?? value.trim();
}

/**
 * Trim the per-size tail GIANT appends to component specs, e.g.
 * "105 Di2, 36/52 XS:165mm, S:165mm, M:170mm, …" → "105 Di2, 36/52".
 * Also collapses a long comma list down to its identifying head.
 */
function stripSizeTail(value: string): string {
  return value
    .replace(/\s*(?:3XS|2XS|XXS|XS|S|M\/L|ML|M|L|XL|2XL)\s*[:：][^,;，；]*/gi, "")
    .replace(/[,\s;，；]+$/, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function buildDerivedComponents(): DerivedComponent[] {
  const byKey = new Map<string, Accumulated>();

  for (const bike of catalog) {
    const build = bike.factoryBuild;
    if (!build) continue;

    for (const slot of factoryBuildSlots) {
      const value = build[slot];
      if (typeof value !== "string" || !value.trim()) continue;
      const rawCategory = SLOT_TO_CATEGORY[slot];
      if (!rawCategory) continue;

      // Frames and forks are represented by the bicycle catalog itself; showing them
      // as buyable parts would duplicate that catalog with a price we do not have.
      // bottomBracket / powerMeter / pedals have no Workshop category of their own.
      if (FRAME_SLOTS.includes(slot) || SLOTS_WITHOUT_CATEGORY.includes(slot)) continue;

      // Drop fields that are not actually a part name (e.g. a bare "10速" gear count
      // or a size string like "700X25C").
      if (!isUsablePartName(value)) continue;

      const category: ComponentCategory = rawCategory;

      // Brand comes from a whitelist of real component brands found in the text, or
      // from the bicycle's own brand for its OEM parts. Never from the first word.
      const brandValue = detectBrand(value) ?? canonicalBrand(bike.brand);

      // Key on brand + a coarse part identity so regional/colour variants fold together.
      const partIdentity = partIdentityFor(category, value);
      const key = `${category}::${normalizeKeyPart(brandValue)}::${partIdentity}`;

      const existing = byKey.get(key);
      if (existing) {
        existing.rawValues.add(value.trim());
        existing.bikeIds.add(bike.id);
        const candidate = shortenForDisplay(value);
        if (candidate.length < existing.display.length) existing.display = candidate;
      } else {
        byKey.set(key, {
          category,
          rawValues: new Set([value.trim()]),
          bikeIds: new Set([bike.id]),
          compatibility: compatibilityFor(category, bike),
          display: shortenForDisplay(value),
        });
      }
    }
  }

  const components: DerivedComponent[] = [];
  const usedIds = new Set<string>();

  for (const [key, entry] of byKey) {
    const [categoryRaw, brandKey] = key.split("::");
    const category = categoryRaw as ComponentCategory;
    const variants = [...entry.rawValues];

    const firstBike = catalog.find((bike) => entry.bikeIds.has(bike.id));
    const brand = canonicalBrand(brandKey);
    const model = modelNameFor(entry.display, brand);

    // Deterministic but guaranteed-unique: a truncated slug could collide with a
    // sibling part and produce duplicate React keys.
    const slug = normalizeKeyPart(`${brand} ${model}`).replace(/ /g, "-");
    let id = `real-${category}-${slug}`;
    if (usedIds.has(id)) {
      let suffix = 2;
      while (usedIds.has(`${id}-${suffix}`)) suffix += 1;
      id = `${id}-${suffix}`;
    }
    usedIds.add(id);

    components.push({
      id,
      brand,
      model,
      category,
      // No manufacturer publishes an OEM part price or weight — see the module note.
      price: 0,
      priceBasis: "unknown",
      weight: 0,
      weightBasis: "unknown",
      image: `factory-${category}`,
      description: variants.length > 1 ? `${variants.length} 个原厂变体。${entry.display}` : entry.display,
      specifications: {
        原厂件: "是",
        变体数: String(variants.length),
        装配车型: `${entry.bikeIds.size} 款`,
        原厂规格: variants.join("；"),
      },
      compatibility: entry.compatibility,
      dataQuality: firstBike?.dataQuality ?? "partial",
      source: firstBike
        ? {
            manufacturer: firstBike.source.manufacturer,
            productUrl: firstBike.source.productUrl,
            region: firstBike.source.region,
            retrievedAt: firstBike.source.retrievedAt,
          }
        : undefined,
      usedOnBikeIds: [...entry.bikeIds],
      provenanceNote: `原厂件，读取自 ${firstBike?.brand ?? ""} ${firstBike?.family ?? ""} 官方产品页；官方未公布该零件单价与重量。`,
    });
  }

  return components;
}

/** Built once — the catalog is static data. */
export const derivedComponents: DerivedComponent[] = buildDerivedComponents();

export function getDerivedComponent(id: string): DerivedComponent | undefined {
  return derivedComponents.find((component) => component.id === id);
}

/** Parts actually fitted to a given bicycle, for "this bike's original spec" views. */
export function componentsForBike(bikeId: string): DerivedComponent[] {
  return derivedComponents
    .filter((component) => component.usedOnBikeIds?.includes(bikeId))
    .sort((a, b) => a.category.localeCompare(b.category));
}

/** How many distinct real parts were recovered, by category — for the coverage report. */
export function derivedComponentStats(): {
  total: number;
  byCategory: Record<string, number>;
  bikesCovered: number;
} {
  const byCategory: Record<string, number> = {};
  const bikes = new Set<string>();
  for (const component of derivedComponents) {
    byCategory[component.category] = (byCategory[component.category] ?? 0) + 1;
    for (const id of component.usedOnBikeIds ?? []) bikes.add(id);
  }
  return { total: derivedComponents.length, byCategory, bikesCovered: bikes.size };
}

export type { FactoryBuild };