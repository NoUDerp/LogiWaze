export class Region {
    name: string;
    realName: string;
    x: number;
    y: number;
}

const width = 256 / 10;
const height = width * Math.sqrt(3) / 2;

let ox = 0;
let oy = 0;

const regions: Array<Region> = [
    {name: "KingsCageHex", realName: "King's Cage", x: ox + -1.5 * width, y: oy + 0 * height},
    {name: "WestgateHex", realName: "Westgate", x: ox + -2.25 * width, y: oy + -.5 * height},
    {name: "FarranacCoastHex", realName: "Farranac Coast", x: ox + -2.25 * width, y: oy + .5 * height},
    {name: "EndlessShoreHex", realName: "Endless Shore", x: ox + 2.25 * width, y: oy + -.5 * height},
    {name: "StlicanShelfHex", realName: "Stlican Shelf", x: ox + 2.25 * width, y: oy + .5 * height},
    {name: "OarbreakerHex", realName: "Oarbreaker", x: ox + -3.75 * width, y: oy + -.5 * height},
    {name: "FishermansRowHex", realName: "Fisherman's Row", x: ox + -3 * width, y: oy + 0 * height},
    {name: "StemaLandingHex", realName: "Stema Landing", x: ox + -3 * width, y: oy + -1 * height},
    {name: "GodcroftsHex", realName: "Godcrofts", x: ox + 3 * width, y: oy + 1 * height},
    {name: "SableportHex", realName: "Sableport", x: ox + -1.5 * width, y: oy + -1 * height},
    {name: "TempestIslandHex", realName: "Tempest Island", x: ox + 3 * width, y: oy + 0 * height},
    {name: "ReaversPassHex", realName: "Reaver's Pass", x: ox + 2.25 * width, y: oy + -1.5 * height},
    {name: "TheFingersHex", realName: "The Fingers", x: ox + 3.75 * width, y: oy + -.5 * height},
    {name: "ClahstraHex", realName: "The Clahstra", x: ox + 1.5 * width, y: oy + 0 * height},
    {name: "DeadLandsHex", realName: "Deadlands", x: ox + 0 * width, y: oy + 0 * height},
    {name: "CallahansPassageHex", realName: "Callahan's Passage", x: ox + 0 * width, y: oy + 1 * height},
    {name: "MarbanHollow", realName: "Marban Hollow", x: ox + .75 * width, y: oy + .5 * height},
    {name: "UmbralWildwoodHex", realName: "Umbral Wildwood", x: ox + 0 * width, y: oy + -1 * height},
    {name: "MooringCountyHex", realName: "The Moors", x: ox + -.75 * width, y: oy + 1.5 * height},
    {name: "HeartlandsHex", realName: "Heartlands", x: ox + -.75 * width, y: oy + -1.5 * height},
    {name: "LochMorHex", realName: "Loch Mór", x: ox + -.75 * width, y: oy + -.5 * height},
    {name: "LinnMercyHex", realName: "Linn of Mercy", x: ox + -.75 * width, y: oy + .5 * height},
    {name: "ReachingTrailHex", realName: "Reaching Trail", x: ox + 0 * width, y: oy + 2 * height},
    {name: "StonecradleHex", realName: "Stonecradle", x: ox + -1.5 * width, y: oy + 1 * height},
    {name: "GreatMarchHex", realName: "Great March", x: ox + 0 * width, y: oy + -2 * height},
    {name: "AllodsBightHex", realName: "Allod's Bight", x: ox + 1.5 * width, y: oy + -1 * height},
    {name: "WeatheredExpanseHex", realName: "Weathered Expanse", x: ox + 1.5 * width, y: oy + 1 * height},
    {name: "DrownedValeHex", realName: "Drowned Vale", x: ox + .75 * width, y: oy + -.5 * height},
    {name: "ShackledChasmHex", realName: "Shackled Chasm", x: ox + .75 * width, y: oy + -1.5 * height},
    {name: "ViperPitHex", realName: "Viper Pit", x: ox + .75 * width, y: oy + 1.5 * height},
    {name: "NevishLineHex", realName: "Nevish Line", x: ox + -2.25 * width, y: oy + 1.5 * height},
    {name: "AcrithiaHex", realName: "Acrithia", x: ox + .75 * width, y: oy + -2.5 * height},
    {name: "RedRiverHex", realName: "Red River", x: ox + -.75 * width, y: oy + -2.5 * height},
    {name: "CallumsCapeHex", realName: "Callum's Cape", x: ox + -1.5 * width, y: oy + 2 * height},
    {name: "SpeakingWoodsHex", realName: "Speaking Woods", x: ox + -.75 * width, y: oy + 2.5 * height},
    {name: "BasinSionnachHex", realName: "Basin Sionnach", x: ox + 0 * width, y: oy + 3 * height},
    {name: "HowlCountyHex", realName: "Howl County", x: ox + .75 * width, y: oy + 2.5 * height},
    {name: "ClansheadValleyHex", realName: "Clanshead Valley", x: ox + 1.5 * width, y: oy + 2 * height},
    {name: "MorgensCrossingHex", realName: "Morgen's Crossing", x: ox + 2.25 * width, y: oy + 1.5 * height},
    {name: "TerminusHex", realName: "Terminus", x: ox + 1.5 * width, y: oy + -2 * height},
    {name: "KalokaiHex", realName: "Kalokai", x: ox + 0 * width, y: oy + -3 * height},
    {name: "AshFieldsHex", realName: "Ash Fields", x: ox + -1.5 * width, y: oy + -2 * height},
    {name: "OriginHex", realName: "Origin", x: ox + -2.25 * width, y: oy + -1.5 * height},

    // Update 1.63 Airborne — Northern (NW outer) regions
    {name: "GutterHex", realName: "The Gutter", x: ox + -3 * width, y: oy + 1 * height},
    {name: "KuuraStrandHex", realName: "Kuura Strand", x: ox + -3 * width, y: oy + 2 * height},
    {name: "PalantineBermHex", realName: "Palantine Berm", x: ox + -3.75 * width, y: oy + .5 * height},
    {name: "PariPeakHex", realName: "Pari Peak", x: ox + -3.75 * width, y: oy + 1.5 * height},
    {name: "OlavisWakeHex", realName: "Olavi's Wake", x: ox + -4.5 * width, y: oy + 1 * height},

    // Update 1.63 Airborne — Southern (SE outer) regions
    {name: "WrestaHex", realName: "Wresta", x: ox + 3 * width, y: oy + -1 * height},
    {name: "OnyxHex", realName: "Ónyx", x: ox + 3 * width, y: oy + -2 * height},
    {name: "LykosIsleHex", realName: "Lykos Isle", x: ox + 3.75 * width, y: oy + .5 * height},
    {name: "TyrantFoothillsHex", realName: "Tyrant Foothills", x: ox + 3.75 * width, y: oy + -1.5 * height},
    {name: "PipersEnclaveHex", realName: "Piper's Enclave", x: ox + 4.5 * width, y: oy + -1 * height},
];

export default regions;
