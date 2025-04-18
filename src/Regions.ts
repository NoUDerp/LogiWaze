export class Region {
    name: string;
    realName: string;
    x: number;
    y: number;
}

const width = 256 / 7;
const height = width * Math.sqrt(3) / 2;

let ox = 0;
let oy = 0;

const regions: Array<Region> = [
    {name: "KingsCageHex", realName: "King's Cage", x: ox - 1.5 * width, y: oy},
    {name: "WestgateHex", realName: "Westgate", x: ox + -2.25 * width, y: oy + -.5 * height},
    {name: "FarranacCoastHex", realName: "Farranac Coast", x: ox + -2.25 * width, y: oy + .5 * height},
    {name: "EndlessShoreHex", realName: "Endless Shore", x: ox + 2.25 * width, y: oy + -.5 * height},
    {name: "StlicanShelfHex", realName: "Stlican Shelf", x: ox + 2.25 * width, y: oy + .5 * height},
    {name: "OarbreakerHex", realName: "Oarbreaker", x: ox + -3 * width, y: oy + height},
    {name: "FishermansRowHex", realName: "Fisherman's Row", x: ox + -3 * width, y: oy},
    {name: "StemaLandingHex", realName: "Stema Landing", x: ox + -3 * width, y: oy + -1 * height},
    {name: "GodcroftsHex", realName: "Godcrofts", x: ox + 3 * width, y: oy + height},
    {name: "SableportHex", realName: "Sableport", x: ox + -1.5 * width, y: oy + -1 * height},
    {name: "TempestIslandHex", realName: "Tempest Island", x: ox + 3 * width, y: oy},
    {name: "ReaversPassHex", realName: "Reaver's Pass", x: ox + 2.25 * width, y: oy + -1.5 * height},
    {name: "TheFingersHex", realName: "TheFingersHex", x: ox + 3 * width, y: oy + -1 * height},
    {name: "ClahstraHex", realName: "The Clahstra", x: ox + 1.5 * width, y: oy},
    {name: "DeadLandsHex", realName: "Deadlands", x: ox, y: oy},
    {name: "CallahansPassageHex", realName: "Callahan's Passage", x: ox, y: oy + height},
    {name: "MarbanHollow", realName: "Marban Hollow", x: ox + .75 * width, y: oy + .5 * height},
    {name: "UmbralWildwoodHex", realName: "Umbral Wildwood", x: ox, y: oy + -1 * height},
    {name: "MooringCountyHex", realName: "The Moors", x: ox + -.75 * width, y: oy + 1.5 * height},
    {name: "HeartlandsHex", realName: "Heartlands", x: ox + -.75 * width, y: oy + -1.5 * height},
    {name: "LochMorHex", realName: "Loch Mór", x: ox + -.75 * width, y: oy + -.5 * height},
    {name: "LinnMercyHex", realName: "Linn of Mercy", x: ox + -.75 * width, y: oy + .5 * height},
    {name: "ReachingTrailHex", realName: "Reaching Trail", x: ox, y: oy + 2 * height},
    {name: "StonecradleHex", realName: "Stonecradle", x: ox + -1.5 * width, y: oy + height},
    {name: "GreatMarchHex", realName: "Great March", x: ox, y: oy + -2 * height},
    {name: "AllodsBightHex", realName: "Allod's Bight", x: ox + 1.5 * width, y: oy + -1.0 * height},
    {name: "WeatheredExpanseHex", realName: "Weathered Expanse", x: ox + 1.5 * width, y: oy + height},
    {name: "DrownedValeHex", realName: "Drowned Vale", x: ox + .75 * width, y: oy + -.5 * height},
    {name: "ShackledChasmHex", realName: "Shackled Chasm", x: ox + .75 * width, y: oy + -1.5 * height},
    {name: "ViperPitHex", realName: "Viper Pit", x: ox + .75 * width, y: oy + 1.5 * height},
    {name: "NevishLineHex", realName: "Nevish Line", x: ox + -2.25 * width, y: oy + 1.5 * height},
    {name: "AcrithiaHex", realName: "Acrithia", x: ox + .75 * width, y: oy + -2.5 * height},
    {name: "RedRiverHex", realName: "Red River", x: ox + -.75 * width, y: oy + -2.5 * height},
    {name: "CallumsCapeHex", realName: "Callum's Cape", x: ox + -1.5 * width, y: oy + 2 * height},
    {name: "SpeakingWoodsHex", realName: "Speaking Woods", x: ox + -.75 * width, y: oy + 2.5 * height},
    {name: "BasinSionnachHex", realName: "Basin Sionnach", x: ox, y: oy + 3 * height},
    {name: "HowlCountyHex", realName: "Howl County", x: ox + .75 * width, y: oy + 2.5 * height},
    {name: "ClansheadValleyHex", realName: "Clanshead Valley", x: ox + 1.5 * width, y: oy + 2 * height},
    {name: "MorgensCrossingHex", realName: "Morgen's Crossing", x: ox + 2.25 * width, y: oy + 1.5 * height},
    {name: "TerminusHex", realName: "Terminus", x: ox + 1.5 * width, y: oy + -2 * height},
    {name: "KalokaiHex", realName: "Kalokai", x: ox, y: oy + -3 * height},
    {name: "AshFieldsHex", realName: "Ash Fields", x: ox + -1.5 * width, y: oy + -2 * height},
    {name: "OriginHex", realName: "Origin", x: ox + -2.25 * width, y: oy + -1.5 * height}
];

export default regions;