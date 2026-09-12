import type { BrandDirectoryItem, Component, ComponentCategory, CompleteBike } from "@/types/bike";

export const brandDirectory: BrandDirectoryItem[] = [
  { name: "Specialized", officialUrl: "https://www.specialized.com/us/en/shop/bikes/road-bikes", models: ["Tarmac", "Roubaix", "Aethos", "Allez", "Shiv"] },
  { name: "Trek", officialUrl: "https://www.trekbikes.com/us/en_US/bikes/road-bikes/", models: ["Madone", "Domane", "Émonda", "Speed Concept"] },
  { name: "Giant", officialUrl: "https://www.giant-bicycles.com/us/", models: ["TCR", "Defy", "Contend"] },
  { name: "Canyon", officialUrl: "https://www.canyon.com/en-us/road-bikes/", models: ["Aeroad", "Ultimate", "Endurace", "Speedmax"] },
  { name: "Cannondale", officialUrl: "https://www.cannondale.com/en-us/bikes/road", models: ["SuperSix EVO", "Synapse", "CAAD", "Topstone"] },
  { name: "Cervélo", officialUrl: "https://www.cervelo.com/en-US/bikes", models: ["S5", "R5", "Soloist", "Caledonia-5", "P5"] },
  { name: "Pinarello", officialUrl: "https://pinarello.com/usa/en/bike-list", models: ["Dogma F", "Prince", "X"] },
  { name: "Colnago", officialUrl: "https://www.colnago.com/", models: ["Y1Rs", "V4Rs", "C68", "G4X"] },
  { name: "Bianchi", officialUrl: "https://www.bianchi.com/bikes/road/", models: ["Oltre", "Specialissima", "Infinito", "Sprint"] },
  { name: "BMC", officialUrl: "https://bmc-switzerland.com/collections/road-bikes", models: ["Teammachine", "Roadmachine", "Speedmachine"] },
  { name: "Scott", officialUrl: "https://www.scott-sports.com/us/en/products/bike-bikes-road", models: ["Addict", "Foil", "Speedster"] },
  { name: "Orbea", officialUrl: "https://www.orbea.com/us-en/bicycles/road/", models: ["Orca", "Avant", "Onix"] },
  { name: "Merida", officialUrl: "https://www.merida-bikes.com/", models: ["Scultura", "Reacto", "Silex"] },
  { name: "Factor", officialUrl: "https://factorbikes.com/bikes/", models: ["O2", "Ostro VAM", "Ostro Gravel"] },
  { name: "Santa Cruz", officialUrl: "https://www.santacruzbicycles.com/en-US/bikes", models: ["Stigmata", "Blur", "Highball"] },
  { name: "Yeti", officialUrl: "https://yeticycles.com/bikes", models: ["ASR", "SB120", "ARC"] },
  { name: "XDS", officialUrl: "https://www.xdsbike.com/", models: ["ADORE", "RS", "Carbon Road"] },
  { name: "Pardus", officialUrl: "https://parduscycling.com/", models: ["Robin", "Spark", "Super Sport"] },
  { name: "Winspace", officialUrl: "https://www.winspace.cc/collections/best-sellers", models: ["SLC5.0", "T1600", "C5 Aero", "M6"] },
  { name: "SEKA", officialUrl: "https://www.sekabikes.com/", models: ["Exceed", "Exaero", "Lite"] },
];

const officialBrandUrls: Record<string, string> = Object.fromEntries(brandDirectory.map((brand) => [brand.name, brand.officialUrl]));

const completeBikeSeed: CompleteBike[] = [
  { id: "triban-rc120", brand: "Triban", model: "RC 120 Disc", price: 749, weight: 10800, category: "budget", groupset: "Microshift 2x8", description: "适合作为第一辆公路车，舒适、可靠，也容易维护。" },
  { id: "giant-contend-ar-4", brand: "Giant", model: "Contend AR 4", price: 999, weight: 10700, category: "budget", groupset: "Shimano Sora 2x9", description: "舒适的全路况操控，并为更宽的外胎留出空间。" },
  { id: "trek-domane-al-2", brand: "Trek", model: "Domane AL 2 Gen 4", price: 1199, weight: 10500, category: "budget", groupset: "Shimano Claris 2x8", description: "稳定耐用的耐力型公路车，适合探索更长的路线。" },
  { id: "cannondale-synapse-3", brand: "Cannondale", model: "Synapse Carbon 3", price: 2499, weight: 9300, category: "all-round", groupset: "Shimano 105 12-speed", description: "从日常骑行到周末长途都能胜任的碳纤维耐力车。" },
  { id: "trek-emonda-sl-6", brand: "Trek", model: "Émonda SL 6", price: 3299, weight: 8100, category: "climbing", groupset: "Shimano 105 Di2", description: "轻快灵活，专为一条又一条的爬坡路而生。" },
  { id: "specialized-tarmac-sl8", brand: "Specialized", model: "Tarmac SL8 Expert", price: 6500, weight: 7600, category: "climbing", groupset: "Shimano Ultegra Di2", description: "适合环赛级别骑行的全能竞赛车，爬坡响应出色。" },
  { id: "cervelo-r5", brand: "Cervélo", model: "R5 Ultegra Di2", price: 7200, weight: 7350, category: "climbing", groupset: "Shimano Ultegra Di2", description: "纯粹的爬坡车：低重量、灵敏操控，适合高山长途。" },
  { id: "canyon-ultimate-cf-slx", brand: "Canyon", model: "Ultimate CF SLX 8", price: 5499, weight: 7600, category: "all-round", groupset: "SRAM Force AXS", description: "兼顾各种地形的均衡竞赛平台，速度与操控都很出色。" },
  { id: "colnago-v4rs", brand: "Colnago", model: "V4Rs", price: 12500, weight: 7000, category: "all-round", groupset: "Shimano Dura-Ace Di2", description: "受环赛竞赛启发的高性能碳纤维赛车。" },
  { id: "cervelo-s5", brand: "Cervélo", model: "S5", price: 9000, weight: 7900, category: "aero", groupset: "Shimano Ultegra Di2", description: "气动竞赛几何，适合在平路和侧风路段保持高速。" },
  { id: "colnago-y1rs", brand: "Colnago", model: "Y1Rs", price: 13500, weight: 7200, category: "aero", groupset: "Shimano Dura-Ace Di2", description: "面向环赛集团前方的气动竞赛车，专注高速效率。" },
  { id: "specialized-venge-demo", brand: "Specialized", model: "Venge Team Archive", price: 4800, weight: 7900, category: "sprint", groupset: "SRAM Force AXS", description: "快速、刚性出色的气动平台，为平路冲刺提供最大功率。" },
  { id: "canyon-aeroad-cfr", brand: "Canyon", model: "Aeroad CFR", price: 9499, weight: 7500, category: "sprint", groupset: "SRAM Red AXS", description: "职业级气动效率，兼顾突围和最后一公里的操控。" },
  { id: "scott-foil-rc", brand: "Scott", model: "Foil RC Pro", price: 8999, weight: 7800, category: "sprint", groupset: "SRAM Red AXS", description: "一体化气动设计，适合突围、集团冲刺和高速下坡。" },
];

const brandCompleteBikeSeed: CompleteBike[] = [
  { id: "specialized-aethos", brand: "Specialized", model: "Aethos", price: 3499, weight: 7200, category: "climbing", groupset: "Shimano 105", description: "轻量、灵活、强调骑行质感的爬坡型公路车。" },
  { id: "trek-madone-slr", brand: "Trek", model: "Madone SLR", price: 7999, weight: 7600, category: "aero", groupset: "Shimano Dura-Ace Di2", description: "兼顾气动与爬坡效率的竞赛公路车。" },
  { id: "giant-tcr-advanced", brand: "Giant", model: "TCR Advanced Pro", price: 4299, weight: 7700, category: "climbing", groupset: "Shimano Ultegra Di2", description: "经典全能竞赛平台，适合爬坡和长距离比赛。" },
  { id: "canyon-endurace-cf", brand: "Canyon", model: "Endurace CF 7", price: 2999, weight: 8400, category: "all-round", groupset: "Shimano 105", description: "舒适耐力几何，适合长途和日常高效骑行。" },
  { id: "cannondale-supersix-evo", brand: "Cannondale", model: "SuperSix EVO 4", price: 3699, weight: 8100, category: "all-round", groupset: "Shimano 105", description: "轻快的竞赛公路车，兼顾速度与操控。" },
  { id: "cervelo-soloist", brand: "Cervélo", model: "Soloist", price: 4999, weight: 8200, category: "all-round", groupset: "SRAM Rival AXS", description: "介于气动车和爬坡车之间的均衡竞赛车型。" },
  { id: "pinarello-dogma-f", brand: "Pinarello", model: "Dogma F", price: 14500, weight: 6900, category: "all-round", groupset: "Shimano Dura-Ace Di2", description: "源自环赛竞赛的高端全能公路车。" },
  { id: "colnago-c68", brand: "Colnago", model: "C68 Road", price: 13500, weight: 7350, category: "all-round", groupset: "Shimano Dura-Ace Di2", description: "手工制造取向的意式高端公路车。" },
  { id: "bianchi-specialissima", brand: "Bianchi", model: "Specialissima", price: 6999, weight: 7300, category: "climbing", groupset: "Shimano Ultegra Di2", description: "为爬坡和山地竞赛打造的轻量公路车。" },
  { id: "bmc-teammachine", brand: "BMC", model: "Teammachine SLR 01", price: 8999, weight: 7200, category: "all-round", groupset: "Shimano Dura-Ace Di2", description: "高刚性、高效率的职业竞赛平台。" },
  { id: "scott-addict-rc", brand: "Scott", model: "Addict RC", price: 6999, weight: 7300, category: "climbing", groupset: "SRAM Force AXS", description: "轻量爬坡性能与现代气动设计的结合。" },
  { id: "orbea-orca", brand: "Orbea", model: "Orca M30", price: 3299, weight: 8200, category: "climbing", groupset: "Shimano 105", description: "轻量碳纤维爬坡车，适合山路和周末长途。" },
  { id: "merida-reacto", brand: "Merida", model: "Reacto 6000", price: 4799, weight: 7900, category: "aero", groupset: "Shimano Ultegra Di2", description: "高效率气动车，适合平路高速和集团骑行。" },
  { id: "factor-ostro-vam", brand: "Factor", model: "Ostro VAM", price: 8999, weight: 7000, category: "aero", groupset: "Shimano Dura-Ace Di2", description: "轻量与气动兼顾的高端竞赛自行车。" },
  { id: "santa-cruz-stigmata", brand: "Santa Cruz", model: "Stigmata", price: 3999, weight: 8700, category: "all-round", groupset: "SRAM Rival XPLR", description: "可应对公路、碎石和长途冒险的全地形车型。" },
  { id: "yeti-asr", brand: "Yeti", model: "ASR", price: 6599, weight: 10500, category: "climbing", groupset: "SRAM XO Transmission", description: "轻量越野竞赛车，适合山地爬坡和技术路段。" },
  { id: "xds-adore", brand: "XDS", model: "ADORE Carbon Road", price: 2199, weight: 8500, category: "all-round", groupset: "Shimano 105", description: "碳纤维全能公路车，强调配置与价格平衡。" },
  { id: "pardus-robin", brand: "Pardus", model: "Robin", price: 1899, weight: 8900, category: "all-round", groupset: "Shimano 105", description: "面向日常训练和长距离骑行的实用公路车。" },
  { id: "winspace-slc50", brand: "Winspace", model: "SLC5.0", price: 5999, weight: 7300, category: "aero", groupset: "Shimano Ultegra Di2", description: "碳纤维气动公路车，适合高速巡航和竞赛。" },
  { id: "seka-exceed", brand: "SEKA", model: "Exceed", price: 5499, weight: 7200, category: "all-round", groupset: "Shimano Ultegra Di2", description: "轻量全能竞赛车，适合爬坡、平路和长距离。" },
];

export const completeBikes: CompleteBike[] = [...completeBikeSeed, ...brandCompleteBikeSeed].map((bike) => ({
  ...bike,
  officialUrl: officialBrandUrls[bike.brand],
}));

const baseProducts: Component[] = [
  {
    id: "canyon-endurace-cf-7",
    brand: "Canyon",
    model: "Endurace CF 7 Frame",
    category: "frame",
    price: 1899,
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
    price: 1299,
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
    price: 2199,
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
    price: 899,
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
    price: 1900,
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
    price: 599,
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
    price: 1399,
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
    price: 1499,
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
    price: 2299,
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
    price: 399,
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
    price: 168,
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
    price: 249,
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
    price: 84,
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
    price: 42,
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
    price: 290,
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
    price: 110,
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
    price: 109,
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
    price: 160,
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
    price: 199,
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
    price: 199,
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
  brand, model, category: "frame", price: 899 + index * 115, weight: 1120 + (index % 6) * 55,
  image: ["frame-red", "frame-blue", "frame-sand"][index % 3], description: "A modern road frame ready for a fast, comfortable build.",
  specifications: { Material: index % 3 === 0 ? "Carbon" : "Aluminum", "Wheel size": "700c", Clearance: `${30 + index % 3 * 3}mm`, Axles: "12x142 / 12x100" },
  compatibility: { wheelSize: "700c", axleStandard: "12x142", tireClearance: 30 + index % 3 * 3, brakeType: "disc", bottomBracket: index % 2 ? "T47" : "BB86", seatpostDiameter: 27.2 },
});

const makeBudgetFrame = ([brand, model]: readonly [string, string], index: number): Component => ({
  id: `${brand.toLowerCase()}-${model.toLowerCase().replaceAll(" ", "-")}`, brand, model, category: "frame", price: 399 + index * 75, weight: 1540 + index * 70,
  image: ["frame-blue", "frame-sand", "frame-red"][index % 3],
  description: "An affordable road-ready frame for building more and spending less.", specifications: { Material: index % 2 ? "Aluminum" : "Steel", "Wheel size": "700c", Clearance: "32mm", Axles: "12x142 / 12x100" },
  compatibility: { wheelSize: "700c", axleStandard: "12x142", tireClearance: 32, brakeType: "disc", bottomBracket: "BSA", seatpostDiameter: 27.2 },
});

const makeWheel = ([brand, model]: readonly [string, string], index: number): Component => ({
  id: `${brand.toLowerCase().replaceAll(" ", "-")}-${model.toLowerCase().replaceAll(" ", "-")}`,
  brand, model, category: "wheelset", price: 499 + index * 85, weight: 1340 + (index % 7) * 62,
  image: ["wheels-deep", "wheels-carbon", "wheels-shallow"][index % 3], description: "A road wheelset balancing speed, durability, and everyday confidence.",
  specifications: { Rim: index % 2 ? "Carbon, 45mm" : "Alloy, 32mm", Hub: "Sealed bearing", Axles: "12x142 / 12x100", Freehub: index % 4 === 1 ? "XDR" : "HG" },
  compatibility: { wheelSize: "700c", axleStandard: "12x142", freehub: index % 4 === 1 ? "XDR" : "HG" },
});

const makeBudgetWheel = ([brand, model]: readonly [string, string], index: number): Component => ({
  id: `${brand.toLowerCase()}-${model.toLowerCase().replaceAll(" ", "-")}`, brand, model, category: "wheelset", price: 249 + index * 45, weight: 1880 + index * 65,
  image: "wheels-shallow",
  description: "A dependable alloy wheelset for an accessible first build.", specifications: { Rim: "Alloy, 30mm", Hub: "Sealed bearing", Axles: "12x142 / 12x100", Freehub: "HG" },
  compatibility: { wheelSize: "700c", axleStandard: "12x142", freehub: "HG" },
});

const groupsetNames = [
  ["Shimano", "Dura-Ace Di2 R9270", "shimano-road", 12, "HG"], ["Shimano", "GRX Di2 RX825", "shimano-road", 12, "HG"], ["Shimano", "Tiagra 4700", "shimano-road", 10, "HG"],
  ["SRAM", "Force AXS", "sram-road", 12, "XDR"], ["SRAM", "Apex AXS", "sram-road", 12, "XDR"], ["SRAM", "Red AXS", "sram-road", 12, "XDR"], ["SRAM", "Rival XPLR AXS", "sram-road", 12, "XDR"],
] as const;

const extraGroupsets: Component[] = groupsetNames.map(([brand, model, family, speed, freehub], index) => ({
  id: `${brand.toLowerCase()}-${model.toLowerCase().replaceAll(" ", "-")}`, brand, model, category: "groupset", price: 1099 + index * 240, weight: 2580 + index * 80,
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
  brand, model, category, price: 79 + index * 43, weight: 180 + index * 72, image: `${category}-option-${index}`,
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

export const products: Component[] = [...baseProducts, ...extraProducts].map(addSizeWeights);

export function getProduct(id: string | undefined): Component | undefined {
  return products.find((product) => product.id === id);
}
