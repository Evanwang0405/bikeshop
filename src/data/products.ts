import type { Component, ComponentCategory } from "@/types/bike";

/**
 * LEGACY PART CATALOG (demo data)
 * -----------------------------------------------------------------------------
 * This module holds the *component* catalogue used by the Workshop's part picker.
 * Its prices, weights and compatibility values are illustrative sample data, not
 * manufacturer-verified figures, so every generated entry is stamped
 * `dataQuality: "demo"`.
 *
 * Real China-market *bicycles* live in `src/data/catalog/` and are the only
 * source used by search, family browsing, the data-quality report and the
 * recommendation engine. The fabricated complete-bike seed and the flat brand
 * directory that used to live here have been removed: the brief explicitly rejects
 * generating more fake products.
 */

/**
 * Convert a figure originally written in USD into CNY, rounded to the nearest ¥10.
 *
 * The sample prices in this file were authored in USD while the real bicycle
 * catalog is priced in CNY. Showing ¥ and $ on one screen invites people to add up
 * numbers that are not comparable, so the sample set is converted here.
 *
 * This does NOT make the numbers real. Every sample entry is stamped
 * `priceBasis: "estimated"` below, and the UI must label them as such.
 */
const USD_TO_CNY = 7.2;
const usdToCny = (usd: number): number => Math.round((usd * USD_TO_CNY) / 10) * 10;

const factoryReferenceProducts: Component[] = [
  { id: "canyon-ultimate-cf-slx-frame", brand: "Canyon", model: "Ultimate CF SLX Frame", category: "frame", price: 0, weight: 950, image: "frame-blue", description: "Canyon Ultimate CF SLX 原厂车架参考项。", specifications: { Material: "Carbon", "Wheel size": "700c" }, compatibility: { wheelSize: "700c", axleStandard: "12x142", tireClearance: 32, brakeType: "disc", seatpostDiameter: 27.2 }, dataQuality: "official", source: { manufacturer: "Canyon", productUrl: "https://www.canyon.com/en-us/road-bikes/race-bikes/ultimate/", region: "US", sourceCurrency: "USD", retrievedAt: "2026-09-12" } },
  { id: "canyon-ultimate-arc-1400", brand: "DT Swiss", model: "ARC 1400 DICUT 原厂轮组", category: "wheelset", price: 0, weight: 1520, image: "wheels-carbon", description: "Canyon Ultimate CF SLX 8 Di2 原厂轮组参考项。", specifications: { Rim: "Carbon", Freehub: "HG", Axles: "12x142 / 12x100" }, compatibility: { wheelSize: "700c", axleStandard: "12x142", freehub: "HG" }, dataQuality: "official", source: { manufacturer: "Canyon", productUrl: "https://www.canyon.com/en-us/road-bikes/race-bikes/ultimate/cf-slx/ultimate-cf-slx-8-di2/4372.html", region: "US", sourceCurrency: "USD", retrievedAt: "2026-09-12" } },
];

const baseProducts: Component[] = [
  {
    id: "canyon-endurace-cf-7",
    brand: "Canyon",
    model: "Endurace CF 7 Frame",
    category: "frame",
    price: 13670,
    weight: 1080,
    image: "frame-red",
    description: "A composed carbon endurance frame with room for fast, comfortable days.",
    specifications: { Material: "Carbon CF", "Wheel size": "700c", Clearance: "35mm", Axles: "12x142 / 12x100" },
    compatibility: { wheelSize: "700c", axleStandard: "12x142", tireClearance: 35, brakeType: "disc", bottomBracket: "BB86", seatpostDiameter: 27.2 },
  },
  {
    id: "trek-emonda-alr-frame",
    brand: "Trek",
    model: "Émonda ALR Frameset",
    category: "frame",
    price: 9350,
    weight: 1450,
    image: "frame-blue",
    description: "Lightweight alloy race geometry with a sharp, responsive feel.",
    specifications: { Material: "Alpha aluminum", "Wheel size": "700c", Clearance: "30mm", Axles: "12x142 / 12x100" },
    compatibility: { wheelSize: "700c", axleStandard: "12x142", tireClearance: 30, brakeType: "disc", bottomBracket: "T47", seatpostDiameter: 27.2 },
  },
  {
    id: "giant-defy-advanced-frame",
    brand: "Giant",
    model: "Defy Advanced Frameset",
    category: "frame",
    price: 15830,
    weight: 1190,
    image: "frame-sand",
    description: "All-road carbon comfort with generous clearance for changing roads.",
    specifications: { Material: "Advanced composite", "Wheel size": "700c", Clearance: "38mm", Axles: "12x142 / 12x100" },
    compatibility: { wheelSize: "700c", axleStandard: "12x142", tireClearance: 38, brakeType: "disc", bottomBracket: "Pressfit", seatpostDiameter: 27.2 },
  },
  {
    id: "dt-swiss-er-1600",
    brand: "DT Swiss",
    model: "ER 1600 Spline 32",
    category: "wheelset",
    price: 6470,
    weight: 1710,
    image: "wheels-deep",
    description: "Durable alloy wheels tuned for long rides and rougher roads.",
    specifications: { Rim: "Alloy, 32mm", Hub: "Ratchet EXP", Axles: "12x142 / 12x100", Freehub: "Shimano HG" },
    compatibility: { wheelSize: "700c", axleStandard: "12x142", freehub: "HG" },
  },
  {
    id: "zipp-303-firecrest",
    brand: "Zipp",
    model: "303 Firecrest Tubeless",
    category: "wheelset",
    price: 13680,
    weight: 1352,
    image: "wheels-carbon",
    description: "Deep-section carbon wheels that make every climb feel more intentional.",
    specifications: { Rim: "Carbon, 40mm", Hub: "ZR1 DB", Axles: "12x142 / 12x100", Freehub: "XDR" },
    compatibility: { wheelSize: "700c", axleStandard: "12x142", freehub: "XDR" },
  },
  {
    id: "fulcrum-racing-4",
    brand: "Fulcrum",
    model: "Racing 4 Disc",
    category: "wheelset",
    price: 4310,
    weight: 1725,
    image: "wheels-shallow",
    description: "A confident, easy-to-live-with alloy wheelset for everyday riding.",
    specifications: { Rim: "Alloy, 34mm", Hub: "Sealed bearing", Axles: "QR / 12x142", Freehub: "HG" },
    compatibility: { wheelSize: "700c", axleStandard: "QR", freehub: "HG" },
  },
  {
    id: "shimano-105-r7120",
    brand: "Shimano",
    model: "105 Di2 R7150 12-speed",
    category: "groupset",
    price: 10070,
    weight: 2850,
    image: "groupset-silver",
    description: "Electronic shifting with the calm, precise character of modern 105.",
    specifications: { Speeds: "12", Brakes: "Hydraulic disc", Crank: "50/34T", Cassette: "11-34T" },
    compatibility: { drivetrainSpeed: 12, groupsetFamily: "shimano-road", brakeType: "disc", bottomBracket: "BB86", freehub: "HG" },
  },
  {
    id: "sram-rival-axs",
    brand: "SRAM",
    model: "Rival eTap AXS 12-speed",
    category: "groupset",
    price: 10790,
    weight: 3100,
    image: "groupset-black",
    description: "Wireless shifting and wide-range simplicity for a modern road build.",
    specifications: { Speeds: "12", Brakes: "Hydraulic disc", Crank: "48/35T", Cassette: "10-36T" },
    compatibility: { drivetrainSpeed: 12, groupsetFamily: "sram-road", brakeType: "disc", bottomBracket: "DUB", freehub: "XDR" },
  },
  {
    id: "shimano-ultegra-r8100",
    brand: "Shimano",
    model: "Ultegra Di2 R8170",
    category: "groupset",
    price: 16550,
    weight: 2715,
    image: "groupset-ice",
    description: "Race-bred electronic shifting with refined ergonomics and low weight.",
    specifications: { Speeds: "12", Brakes: "Hydraulic disc", Crank: "52/36T", Cassette: "11-30T" },
    compatibility: { drivetrainSpeed: 12, groupsetFamily: "shimano-road", brakeType: "disc", bottomBracket: "BB86", freehub: "HG" },
  },
  {
    id: "canyon-grail-fork",
    brand: "Canyon",
    model: "Endurace Carbon Fork",
    category: "fork",
    price: 2870,
    weight: 420,
    image: "fork-carbon",
    description: "A precise carbon fork matched to modern 12mm road axles.",
    specifications: { Material: "Carbon", Axles: "12x100", Steerer: "Tapered" },
    compatibility: { wheelSize: "700c", axleStandard: "12x100", brakeType: "disc" },
  },
  {
    id: "continental-gp5000-s-tr",
    brand: "Continental",
    model: "Grand Prix 5000 S TR",
    category: "tires",
    price: 1210,
    weight: 560,
    image: "tires-black",
    description: "Fast tubeless road tires with a supple casing and dependable grip.",
    specifications: { Width: "32mm", Type: "Tubeless ready", Casing: "170 TPI" },
    compatibility: { wheelSize: "700c", tireWidth: 32 },
  },
  {
    id: "shimano-105-crankset",
    brand: "Shimano",
    model: "105 R7100 Crankset",
    category: "crankset",
    price: 1790,
    weight: 920,
    image: "crankset-silver",
    description: "A balanced 12-speed crankset with an approachable 50/34 pairing.",
    specifications: { Chainrings: "50/34T", Length: "172.5mm", Interface: "Hollowtech II" },
    compatibility: { drivetrainSpeed: 12, groupsetFamily: "shimano-road", bottomBracket: "BB86" },
  },
  {
    id: "shimano-105-cassette",
    brand: "Shimano",
    model: "105 CS-R7101 Cassette",
    category: "cassette",
    price: 600,
    weight: 340,
    image: "cassette-silver",
    description: "A wide-range 12-speed cassette for confident climbing.",
    specifications: { Range: "11-34T", Speeds: "12", Freehub: "HG" },
    compatibility: { drivetrainSpeed: 12, freehub: "HG" },
  },
  {
    id: "shimano-12-speed-chain",
    brand: "Shimano",
    model: "CN-M7100 Chain",
    category: "chain",
    price: 300,
    weight: 252,
    image: "chain-silver",
    description: "A quiet, durable chain for 12-speed road drivetrains.",
    specifications: { Speeds: "12", Finish: "Sil-Tec", Links: "126" },
    compatibility: { drivetrainSpeed: 12, groupsetFamily: "shimano-road" },
  },
  {
    id: "shimano-105-brakes",
    brand: "Shimano",
    model: "105 Hydraulic Disc Brakes",
    category: "brakes",
    price: 2090,
    weight: 610,
    image: "brakes-black",
    description: "Confident hydraulic control with easy modulation in every weather.",
    specifications: { Type: "Hydraulic disc", Rotors: "160 / 140mm", Mount: "Flat mount" },
    compatibility: { brakeType: "disc" },
  },
  {
    id: "zipp-service-course-sl-bar",
    brand: "Zipp",
    model: "Service Course SL Handlebar",
    category: "handlebar",
    price: 790,
    weight: 275,
    image: "bar-black",
    description: "A compact alloy bar with a comfortable, controlled shape.",
    specifications: { Width: "42cm", Clamp: "31.8mm", Material: "Alloy" },
    compatibility: { clampDiameter: 31.8 },
  },
  {
    id: "ritchey-wcs-stem",
    brand: "Ritchey",
    model: "WCS C220 Stem",
    category: "stem",
    price: 780,
    weight: 121,
    image: "stem-black",
    description: "A clean, stiff cockpit connection for precise steering.",
    specifications: { Length: "100mm", Clamp: "31.8mm", Rise: "6 degrees" },
    compatibility: { clampDiameter: 31.8 },
  },
  {
    id: "specialized-power-saddle",
    brand: "Specialized",
    model: "Power Expert Saddle",
    category: "saddle",
    price: 1150,
    weight: 233,
    image: "saddle-black",
    description: "A supportive short-nose saddle shaped for long hours in the drops.",
    specifications: { Width: "143mm", Rails: "Titanium", Base: "Carbon reinforced" },
    compatibility: {},
  },
  {
    id: "canyon-vcls-seatpost",
    brand: "Canyon",
    model: "S15 VCLS Seatpost",
    category: "seatpost",
    price: 1430,
    weight: 220,
    image: "seatpost-carbon",
    description: "A compliant carbon seatpost that takes the edge off rough roads.",
    specifications: { Diameter: "27.2mm", Material: "Carbon", Offset: "15mm" },
    compatibility: { seatpostDiameter: 27.2 },
  },
  {
    id: "shimano-pd-r8000",
    brand: "Shimano",
    model: "Ultegra PD-R8000 Pedals",
    category: "pedals",
    price: 1430,
    weight: 248,
    image: "pedals-silver",
    description: "A broad, efficient platform with a smooth, durable bearing system.",
    specifications: { Platform: "Carbon composite", System: "SPD-SL", Body: "3-bearing" },
    compatibility: {},
  },
];

const frameNames = [
  ["Specialized", "Allez Sprint Comp"], ["Specialized", "Roubaix SL8 Sport"], ["Trek", "Domane AL 5 Gen 4"], ["Trek", "Madone SL 6 Gen 8"],
  ["Giant", "Contend AR 1"], ["Giant", "TCR Advanced 2"], ["Cannondale", "Synapse Carbon 3"], ["Cannondale", "SuperSix EVO 4"],
  ["Scott", "Addict 30 Frameset"], ["Scott", "Speedster 20 Frameset"], ["BMC", "Roadmachine Five"], ["BMC", "Teammachine SLR Four"],
  ["Cervelo", "Caledonia-5 Frameset"], ["Cervelo", "Soloist Frameset"], ["Orbea", "Orca M30 Frameset"], ["Orbea", "Avant H40 Frameset"],
  ["Merida", "Scultura CF 3"],
] as const;

const wheelNames = [
  ["Shimano", "WH-RS100 Disc"], ["Shimano", "WH-RS710 C46"], ["DT Swiss", "PR 1600 Spline 32"], ["DT Swiss", "ERC 1400 Spline 45"],
  ["Zipp", "303 S Tubeless"], ["Zipp", "404 Firecrest"], ["ENVE", "Foundation 45"], ["ENVE", "SES 3.4 AR"],
  ["Hunt", "4 Season Disc"], ["Hunt", "Aerodynamicist 44"], ["Mavic", "Ksyrium 30 Disc"], ["Mavic", "Cosmic SL 45"],
  ["Fulcrum", "Racing 3 DB"], ["Fulcrum", "Wind 40 DB"], ["Campagnolo", "Shamal Carbon DB"], ["Campagnolo", "Bora WTO 45"],
  ["Bontrager", "Aeolus Elite 35"],
] as const;

const budgetFrameNames = [
  ["Triban", "RC120 Disc Frameset"], ["Decathlon", "Van Rysel NCR AF"], ["State", "4130 All-Road Frame"], ["Poseidon", "Triton Frameset"], ["Marin", "Gestalt Frameset"],
] as const;

const budgetWheelNames = [
  ["Alex", "Boondock 5 Disc"], ["Shimano", "RS171 Disc Wheelset"], ["Vision", "Team 30 Disc"], ["Novatec", "Jetfly Alloy Disc"], ["Origin8", "Orion Disc Wheelset"],
] as const;

const makeFrame = ([brand, model]: readonly [string, string], index: number): Component => ({
  id: `${brand.toLowerCase().replaceAll(" ", "-")}-${model.toLowerCase().replaceAll(" ", "-")}`,
  brand, model, category: "frame", price: usdToCny(899 + index * 115), weight: 1120 + (index % 6) * 55,
  priceBasis: "estimated", weightBasis: "estimated",
  image: ["frame-red", "frame-blue", "frame-sand"][index % 3], description: "A modern road frame ready for a fast, comfortable build.",
  specifications: { Material: index % 3 === 0 ? "Carbon" : "Aluminum", "Wheel size": "700c", Clearance: `${30 + index % 3 * 3}mm`, Axles: "12x142 / 12x100" },
  compatibility: { wheelSize: "700c", axleStandard: "12x142", tireClearance: 30 + index % 3 * 3, brakeType: "disc", bottomBracket: index % 2 ? "T47" : "BB86", seatpostDiameter: 27.2 },
});

const makeBudgetFrame = ([brand, model]: readonly [string, string], index: number): Component => ({
  id: `${brand.toLowerCase()}-${model.toLowerCase().replaceAll(" ", "-")}`, brand, model, category: "frame", price: usdToCny(399 + index * 75), weight: 1540 + index * 70,
  priceBasis: "estimated", weightBasis: "estimated",
  image: ["frame-blue", "frame-sand", "frame-red"][index % 3],
  description: "An affordable road-ready frame for building more and spending less.", specifications: { Material: index % 2 ? "Aluminum" : "Steel", "Wheel size": "700c", Clearance: "32mm", Axles: "12x142 / 12x100" },
  compatibility: { wheelSize: "700c", axleStandard: "12x142", tireClearance: 32, brakeType: "disc", bottomBracket: "BSA", seatpostDiameter: 27.2 },
});

const makeWheel = ([brand, model]: readonly [string, string], index: number): Component => ({
  id: `${brand.toLowerCase().replaceAll(" ", "-")}-${model.toLowerCase().replaceAll(" ", "-")}`,
  brand, model, category: "wheelset", price: usdToCny(499 + index * 85), weight: 1340 + (index % 7) * 62,
  priceBasis: "estimated", weightBasis: "estimated",
  image: ["wheels-deep", "wheels-carbon", "wheels-shallow"][index % 3], description: "A road wheelset balancing speed, durability, and everyday confidence.",
  specifications: { Rim: index % 2 ? "Carbon, 45mm" : "Alloy, 32mm", Hub: "Sealed bearing", Axles: "12x142 / 12x100", Freehub: index % 4 === 1 ? "XDR" : "HG" },
  compatibility: { wheelSize: "700c", axleStandard: "12x142", freehub: index % 4 === 1 ? "XDR" : "HG" },
});

const makeBudgetWheel = ([brand, model]: readonly [string, string], index: number): Component => ({
  id: `${brand.toLowerCase()}-${model.toLowerCase().replaceAll(" ", "-")}`, brand, model, category: "wheelset", price: usdToCny(249 + index * 45), weight: 1880 + index * 65,
  priceBasis: "estimated", weightBasis: "estimated",
  image: "wheels-shallow",
  description: "A dependable alloy wheelset for an accessible first build.", specifications: { Rim: "Alloy, 30mm", Hub: "Sealed bearing", Axles: "12x142 / 12x100", Freehub: "HG" },
  compatibility: { wheelSize: "700c", axleStandard: "12x142", freehub: "HG" },
});

const groupsetNames = [
  ["Shimano", "Dura-Ace Di2 R9270", "shimano-road", 12, "HG"], ["Shimano", "GRX Di2 RX825", "shimano-road", 12, "HG"], ["Shimano", "Tiagra 4700", "shimano-road", 10, "HG"],
  ["SRAM", "Force D1 AXS", "sram-road", 12, "XDR"], ["SRAM", "Apex D1 AXS", "sram-road", 12, "XDR"], ["SRAM", "Red D1 AXS", "sram-road", 12, "XDR"], ["SRAM", "Rival XPLR D1 AXS", "sram-road", 12, "XDR"],
] as const;

const extraGroupsets: Component[] = groupsetNames.map(([brand, model, family, speed, freehub], index) => ({
  id: `${brand.toLowerCase()}-${model.toLowerCase().replaceAll(" ", "-")}`, brand, model, category: "groupset", price: usdToCny(1099 + index * 240), weight: 2580 + index * 80,
  priceBasis: "estimated", weightBasis: "estimated",
  image: brand === "SRAM" ? "groupset-black" : "groupset-silver", description: "A complete drivetrain package with crisp shifting and hydraulic control.",
  specifications: { Speeds: `${speed}`, "Brakes": "Hydraulic disc", Crank: "50/34T", Cassette: "11-34T" },
  compatibility: { drivetrainSpeed: speed, groupsetFamily: family, brakeType: "disc", bottomBracket: brand === "SRAM" ? "DUB" : "BB86", freehub },
}));

const extraChoices = [
  ["fork", [["Specialized", "Future Shock Carbon Fork"], ["Trek", "Domane Carbon Fork"], ["Giant", "Advanced Composite Fork"], ["Ritchey", "WCS Carbon Road Fork"]]],
  ["tires", [["Vittoria", "Corsa N.EXT"], ["Pirelli", "P Zero Race TLR"], ["Specialized", "Turbo 2BR"], ["Schwalbe", "Pro One TLE"]]],
  ["crankset", [["SRAM", "Rival AXS Crankset"], ["Shimano", "Ultegra R8100 Crankset"], ["SRAM", "Force AXS Crankset"], ["FSA", "Gossamer Pro Crankset"]]],
  ["cassette", [["SRAM", "Force XG-1270 Cassette"], ["Shimano", "Ultegra CS-R8101"], ["SRAM", "PG-1230 Eagle Cassette"], ["Shimano", "Tiagra CS-HG500"]]],
  ["chain", [["SRAM", "Flattop 12-speed Chain"], ["Shimano", "Ultegra CN-M8100"], ["KMC", "X12 Chain"], ["SRAM", "Eagle Transmission Chain"]]],
  ["brakes", [["SRAM", "Force AXS HRD Brakes"], ["Shimano", "Ultegra R8170 Brakes"], ["TRP", "Spyre Mechanical Disc"], ["Hope", "RX4+ Calipers"]]],
  ["handlebar", [["Specialized", "Roval Rapide Handlebar"], ["PRO", "Vibe Aero Superlight"], ["Easton", "EC70 AX Bar"], ["Ritchey", "Comp Curve Bar"]]],
  ["stem", [["Zipp", "Service Course SL Stem"], ["PRO", "Vibe Stem"], ["Easton", "EA90 Stem"], ["FSA", "SL-K Stem"]]],
  ["saddle", [["Fizik", "Argo Vento R3"], ["Selle Italia", "SLR Boost TM"], ["Prologo", "Dimension NDR"], ["Bontrager", "Aeolus Elite"]]],
  ["seatpost", [["Specialized", "S-Works Pavé Seatpost"], ["Ritchey", "WCS Carbon 1-Bolt"], ["PRO", "Vibe Carbon Seatpost"], ["Easton", "EC70 Seatpost"]]],
  ["pedals", [["Look", "Keo Blade Carbon"], ["Garmin", "Rally RS200"], ["Time", "Xpro 10"], ["Wahoo", "Speedplay Comp"]]],
] as const;

const makeExtraChoice = (category: ComponentCategory, [brand, model]: readonly [string, string], index: number): Component => ({
  id: `${brand.toLowerCase().replaceAll(" ", "-")}-${model.toLowerCase().replaceAll(" ", "-")}`,
  brand, model, category, price: usdToCny(79 + index * 43), weight: 180 + index * 72, image: `${category}-option-${index}`,
  priceBasis: "estimated", weightBasis: "estimated",
  description: "A considered component option for a balanced road build.", specifications: { Version: `${index + 1}`, Finish: "Black", Fit: "Road" },
  compatibility: category === "tires" ? { wheelSize: "700c", tireWidth: 28 + index * 2 } : category === "brakes" ? { brakeType: "disc" } : category === "seatpost" ? { seatpostDiameter: 27.2 } : category === "handlebar" || category === "stem" ? { clampDiameter: 31.8 } : category === "cassette" ? { drivetrainSpeed: 12, freehub: "HG" } : category === "chain" ? { drivetrainSpeed: 12, groupsetFamily: "shimano-road" } : category === "crankset" ? { drivetrainSpeed: 12, groupsetFamily: "shimano-road", bottomBracket: "BB86" } : {},
});

const extraProducts: Component[] = [
  ...frameNames.map(makeFrame), ...budgetFrameNames.map(makeBudgetFrame), ...wheelNames.map(makeWheel), ...budgetWheelNames.map(makeBudgetWheel), ...extraGroupsets,
  ...extraChoices.flatMap(([category, choices]) => choices.map((choice, index) => makeExtraChoice(category, choice, index))),
];

const sizeProfiles: Partial<Record<ComponentCategory, { options: string[]; multipliers: number[] }>> = {
  frame: { options: ["XS", "S", "M", "L", "XL"], multipliers: [1.03, 1, 1.02, 1.05, 1.08] },
  tires: { options: ["28mm", "30mm", "32mm", "35mm"], multipliers: [0.96, 0.98, 1, 1.08] },
  handlebar: { options: ["38cm", "40cm", "42cm", "44cm"], multipliers: [0.96, 0.98, 1, 1.04] },
  stem: { options: ["80mm", "90mm", "100mm", "110mm", "120mm"], multipliers: [0.96, 0.98, 1, 1.02, 1.04] },
  saddle: { options: ["143mm", "155mm"], multipliers: [0.98, 1.04] },
  seatpost: { options: ["300mm", "350mm", "400mm"], multipliers: [0.96, 1, 1.05] },
  crankset: { options: ["165mm", "170mm", "172.5mm", "175mm"], multipliers: [0.98, 1, 1.02, 1.04] },
};

function addSizeWeights(product: Component): Component {
  const profile = sizeProfiles[product.category];
  if (!profile) return product;
  return { ...product, sizeOptions: profile.options, weightBySize: Object.fromEntries(profile.options.map((size, index) => [size, Math.round(product.weight * profile.multipliers[index % profile.multipliers.length])])) };
}

/**
 * Every sample entry is stamped as demo data with an explicit provenance basis.
 * This is what lets the UI label a figure as "示例" instead of implying it is a
 * manufacturer figure, and it is why `dataQuality: "demo"` is applied here rather
 * than relying on an absent field being interpreted correctly downstream.
 */
function stampSampleProvenance(product: Component): Component {
  return {
    ...product,
    dataQuality: product.dataQuality ?? "demo",
    priceBasis: product.priceBasis ?? "estimated",
    weightBasis: product.weightBasis ?? "estimated",
  };
}

export const products: Component[] = [...factoryReferenceProducts, ...baseProducts, ...extraProducts]
  .map(addSizeWeights)
  .map(stampSampleProvenance);

export function getProduct(id: string | undefined): Component | undefined {
  return products.find((product) => product.id === id);
}
