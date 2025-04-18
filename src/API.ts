// import * as pip from 'point-in-polygon';
// import * as kriging from '@sakitam-gis/kriging';
//
// const width = 256 / 7;
// const height = width * Math.sqrt(3) / 2;
// const halfwidth = width * .5;
// const halfheight = height * .5;
//
// let regionPolygon = [[halfwidth * .5, halfheight], [halfwidth, 0], [halfwidth * .5, -halfheight], [-halfwidth * .5, -halfheight], [-halfwidth, 0], [-halfwidth * .5, halfheight]];
// let ox = 0;
// let oy = 0;
// let regions = [
//
//     {name: "KingsCageHex", realName: "King's Cage", x: ox - 1.5 * width, y: oy},
//     {name: "WestgateHex", realName: "Westgate", x: ox + -2.25 * width, y: oy + -.5 * height},
//     {name: "FarranacCoastHex", realName: "Farranac Coast", x: ox + -2.25 * width, y: oy + .5 * height},
//     {name: "EndlessShoreHex", realName: "Endless Shore", x: ox + 2.25 * width, y: oy + -.5 * height},
//     {name: "StlicanShelfHex", realName: "Stlican Shelf", x: ox + 2.25 * width, y: oy + .5 * height},
//     {name: "OarbreakerHex", realName: "Oarbreaker", x: ox + -3 * width, y: oy + height},
//     {name: "FishermansRowHex", realName: "Fisherman's Row", x: ox + -3 * width, y: oy + 0},
//     {name: "StemaLandingHex", realName: "Stema Landing", x: ox + -3 * width, y: oy + -1 * height},
//     {name: "GodcroftsHex", realName: "Godcrofts", x: ox + 3 * width, y: oy + height},
//     {name: "SableportHex", realName: "Sableport", x: ox + -1.5 * width, y: oy + -1 * height},
//     {name: "TempestIslandHex", realName: "Tempest Island", x: ox + 3 * width, y: oy + 0},
//     {name: "ReaversPassHex", realName: "Reaver's Pass", x: ox + 2.25 * width, y: oy + -1.5 * height},
//     {name: "TheFingersHex", realName: "TheFingersHex", x: ox + 3 * width, y: oy + -1 * height},
//     {name: "ClahstraHex", realName: "The Clahstra", x: ox + 1.5 * width, y: oy + 0},
//     {name: "DeadLandsHex", realName: "Deadlands", x: ox + 0, y: oy + 0},
//     {name: "CallahansPassageHex", realName: "Callahan's Passage", x: ox + 0, y: oy + height},
//     {name: "MarbanHollow", realName: "Marban Hollow", x: ox + .75 * width, y: oy + .5 * height},
//     {name: "UmbralWildwoodHex", realName: "Umbral Wildwood", x: ox + 0, y: oy + -1 * height},
//     {name: "MooringCountyHex", realName: "The Moors", x: ox + -.75 * width, y: oy + 1.5 * height},
//     {name: "HeartlandsHex", realName: "Heartlands", x: ox + -.75 * width, y: oy + -1.5 * height},
//     {name: "LochMorHex", realName: "Loch Mór", x: ox + -.75 * width, y: oy + -.5 * height},
//     {name: "LinnMercyHex", realName: "Linn of Mercy", x: ox + -.75 * width, y: oy + .5 * height},
//     {name: "ReachingTrailHex", realName: "Reaching Trail", x: ox + 0, y: oy + 2 * height},
//     {name: "StonecradleHex", realName: "Stonecradle", x: ox + -1.5 * width, y: oy + height},
//     {name: "GreatMarchHex", realName: "Great March", x: ox + 0, y: oy + -2 * height},
//     {name: "AllodsBightHex", realName: "Allod's Bight", x: ox + 1.5 * width, y: oy + -1.0 * height},
//     {name: "WeatheredExpanseHex", realName: "Weathered Expanse", x: ox + 1.5 * width, y: oy + height},
//     {name: "DrownedValeHex", realName: "Drowned Vale", x: ox + .75 * width, y: oy + -.5 * height},
//     {name: "ShackledChasmHex", realName: "Shackled Chasm", x: ox + .75 * width, y: oy + -1.5 * height},
//     {name: "ViperPitHex", realName: "Viper Pit", x: ox + .75 * width, y: oy + 1.5 * height},
//     {name: "NevishLineHex", realName: "Nevish Line", x: ox + -2.25 * width, y: oy + 1.5 * height},
//     {name: "AcrithiaHex", realName: "Acrithia", x: ox + .75 * width, y: oy + -2.5 * height},
//     {name: "RedRiverHex", realName: "Red River", x: ox + -.75 * width, y: oy + -2.5 * height},
//     {name: "CallumsCapeHex", realName: "Callum's Cape", x: ox + -1.5 * width, y: oy + 2 * height},
//     {name: "SpeakingWoodsHex", realName: "Speaking Woods", x: ox + -.75 * width, y: oy + 2.5 * height},
//     {name: "BasinSionnachHex", realName: "Basin Sionnach", x: ox + 0, y: oy + 3 * height},
//     {name: "HowlCountyHex", realName: "Howl County", x: ox + .75 * width, y: oy + 2.5 * height},
//     {name: "ClansheadValleyHex", realName: "Clanshead Valley", x: ox + 1.5 * width, y: oy + 2 * height},
//     {name: "MorgensCrossingHex", realName: "Morgen's Crossing", x: ox + 2.25 * width, y: oy + 1.5 * height},
//     {name: "TerminusHex", realName: "Terminus", x: ox + 1.5 * width, y: oy + -2 * height},
//     {name: "KalokaiHex", realName: "Kalokai", x: ox + 0, y: oy + -3 * height},
//     {name: "AshFieldsHex", realName: "Ash Fields", x: ox + -1.5 * width, y: oy + -2 * height},
//     {name: "OriginHex", realName: "Origin", x: ox + -2.25 * width, y: oy + -1.5 * height}
// ];
//
// let regionNameMap = [];
// for (let i = 0; i < regions.length; i++)
//     regionNameMap[regions[i].name] = regions[i].realName;
//
// async function APIQuery(URL): Promise<any> {
//     return await (await fetch(URL)).json();
// }
//
// // TODO: convert this to a class and make it the default export (ES6 module)
//
// exports.API = {
//     regions: regions,
//     mapRegionName: function (x) {
//         return regionNameMap[x];
//     },
//     calculateRegion: function (x, y) {
//         for (let i = 0; i < regions.length; i++) {
//             const region = regions[i];
//             if (pip([x - region.x - 128, -region.y + y + 128], regionPolygon, 0, regionPolygon.length))
//                 return region.name;
//         }
//         return null;
//     },
//     mapControl: {},
//     resources: {},
//     remapXY: function (f) {
//
//         const w = 256 / 7;
//         const k = w * Math.sqrt(3) / 2;
//
//         if (f == "KingsCageHex") return {x: -1.5 * w, y: 0};
//         if (f == "WestgateHex") return {x: -2.25 * w, y: -.5 * k};
//         if (f == "FarranacCoastHex") return {x: -2.25 * w, y: .5 * k};
//         if (f == "EndlessShoreHex") return {x: 2.25 * w, y: -.5 * k};
//         if (f == "StlicanShelfHex") return {x: 2.25 * w, y: .5 * k};
//         if (f == "OarbreakerHex") return {x: -3 * w, y: k};
//         if (f == "FishermansRowHex") return {x: -3 * w, y: 0};
//         if (f == "StemaLandingHex") return {x: -3 * w, y: -1 * k};
//         if (f == "GodcroftsHex") return {x: 3 * w, y: k};
//         if (f == "SableportHex") return {x: -1.5 * w, y: -1 * k};
//         if (f == "TempestIslandHex") return {x: 3 * w, y: 0};
//         if (f == "ReaversPassHex") return {x: 2.25 * w, y: -1.5 * k};
//         if (f == "TheFingersHex") return {x: 3 * w, y: -1 * k};
//         if (f == "ClahstraHex") return {x: 1.5 * w, y: 0};
//         if (f == "DeadLandsHex") return {x: 0, y: 0};
//         if (f == "CallahansPassageHex") return {x: 0, y: k};
//         if (f == "MarbanHollow") return {x: .75 * w, y: .5 * k};
//         if (f == "UmbralWildwoodHex") return {x: 0, y: -1 * k};
//         if (f == "MooringCountyHex") return {x: -.75 * w, y: 1.5 * k};
//         if (f == "HeartlandsHex") return {x: -.75 * w, y: -1.5 * k};
//         if (f == "LochMorHex") return {x: -.75 * w, y: -.5 * k};
//         if (f == "LinnMercyHex") return {x: -.75 * w, y: .5 * k};
//         if (f == "ReachingTrailHex") return {x: 0, y: 2 * k};
//         if (f == "StonecradleHex") return {x: -1.5 * w, y: k};
//         if (f == "GreatMarchHex") return {x: 0, y: -2 * k};
//         if (f == "AllodsBightHex") return {x: 1.5 * w, y: -1.0 * k};
//         if (f == "WeatheredExpanseHex") return {x: 1.5 * w, y: k};
//         if (f == "DrownedValeHex") return {x: .75 * w, y: -.5 * k};
//         if (f == "ShackledChasmHex") return {x: .75 * w, y: -1.5 * k};
//         if (f == "ViperPitHex") return {x: .75 * w, y: 1.5 * k};
//         if (f == "NevishLineHex") return {x: -2.25 * w, y: 1.5 * k};
//         if (f == "AcrithiaHex") return {x: .75 * w, y: -2.5 * k};
//         if (f == "RedRiverHex") return {x: -.75 * w, y: -2.5 * k};
//         if (f == "CallumsCapeHex") return {x: -1.5 * w, y: 2 * k};
//         if (f == "SpeakingWoodsHex") return {x: -.75 * w, y: 2.5 * k};
//         if (f == "BasinSionnachHex") return {x: 0, y: 3 * k};
//         if (f == "HowlCountyHex") return {x: .75 * w, y: 2.5 * k};
//         if (f == "ClansheadValleyHex") return {x: 1.5 * w, y: 2 * k};
//         if (f == "MorgensCrossingHex") return {x: 2.25 * w, y: 1.5 * k};
//         if (f == "TerminusHex") return {x: 1.5 * w, y: -2 * k};
//         if (f == "KalokaiHex") return {x: 0, y: -3 * k};
//         if (f == "AshFieldsHex") return {x: -1.5 * w, y: -2 * k};
//         if (f == "OriginHex") return {x: -2.25 * w, y: -1.5 * k};
//
//         return {x: 0, y: 0};
//     },
//
//     ownership: function (x, y, region) {
//         if (!(region in exports.API.mapControl))
//             return "OFFLINE";
//
//         x -= 128;
//         y += 128;
//
//         const u = exports.API.mapControl[region];
//         let distanceSquared = -1;
//         let icon = -1;
//         const keys = Object.keys(u);
//         for (let key of keys) {
//             const j = u[key];
//             if (j.town) {
//                 const px = j.x;
//                 const py = j.y;
//                 const distanceCalculation = (x - px) * (x - px) + (y - py) * (y - py);
//                 if (distanceSquared < 0 || distanceCalculation < distanceSquared) {
//                     icon = j.mapIcon;
//                     distanceSquared = distanceCalculation;
//                 }
//             }
//         }
//
//         const c = kriging.predict(x, y, exports.API.variogram);
//         return {ownership: c < -.25 ? "WARDENS" : (c > .25 ? "COLONIALS" : "NONE"), icon: icon};
//     },
//
//     control: (x, y) => {
//         return kriging.predict(x - 128, y + 128, exports.API.variogram)
//     },
//
//     townHallIcons: [35, 5, 6, 7, 8, 9, 10, 45, 46, 47, 29, 17, 34, 51, 39, 12, 52, 33, 18, 19, 56, 57, 58, 59, 60],
//
//     krigingControlPointIcons: [/* safe house 35, */5, 6, 7, 8, 9, 10, 45, 46, 47, 29, 56, 57, 58, 59, 60],
//
//     update: async function (completionCallback, shard, retryer) {
//
//         let key;
//         let y;
//         let x;
//         if (shard == null)
//             shard = 'war-service-live';
//
//         try {
//             const war = await APIQuery(`https://${shard}.foxholeservices.com/api/worldconquest/war`);
//             exports.API.war = war;
//
//             //alert(war);
//             const maps = await APIQuery(`https://${shard}.foxholeservices.com/api/worldconquest/maps`);
//             // iterate here on the maps and collect status
//             let complete = maps.length;
//             const p_x = [], p_y = [], p_t = [];
//
//             const xf = 256 / 7;
//             const yf = xf * Math.sqrt(3) / 2;
//
//             for (let i = 0; i < maps.length; i++) {
//                 const mapName = maps[i];
//                 const mapData = await APIQuery(`https://${shard}.foxholeservices.com/api/worldconquest/maps/${maps[i]}/dynamic/public`);
//                 if (mapData.mapItems.length > 0) {
//                     exports.API.mapControl[mapName] = {};
//                     exports.API.resources[mapName] = {};
//                     const offset = exports.API.remapXY(mapName);
//                     for (let j = 0; j < mapData.mapItems.length; j++) {
//                         const icon = mapData.mapItems[j].iconType;
//                         x = mapData.mapItems[j].x;
//                         y = mapData.mapItems[j].y;
//                         x = (((x * xf) + offset.x) - xf * .5);
//                         y = ((((1 - y) * yf) + offset.y) - yf * .5);
//                         key = x.toFixed(3).toString().concat('|').concat(y.toFixed(3).toString());
//                         if (exports.API.townHallIcons.includes(icon)) {
//                             const control = mapData.mapItems[j].teamId;
//                             exports.API.mapControl[mapName][key] = {
//                                 x: x,
//                                 y: y,
//                                 control: control,
//                                 mapIcon: icon,
//                                 nuked: (mapData.mapItems[j].flags & 0x10) != 0,
//                                 town: exports.API.krigingControlPointIcons.includes(icon)
//                             };
//                             if ((mapData.mapItems[j].flags & 0x10) == 0 && control != "OFFLINE" && exports.API.krigingControlPointIcons.includes(icon)) {
//                                 p_x.push(x);
//                                 p_y.push(y);
//                                 p_t.push(control == "WARDENS" ? -1 : (control == "COLONIALS" ? 1 : 0));
//                             }
//                         } else {
//                             exports.API.resources[mapName][key] = {
//                                 x: x,
//                                 y: y,
//                                 control: mapData.mapItems[j].teamId,
//                                 mapIcon: icon,
//                                 nuked: (mapData.mapItems[j].flags & 0x10) != 0
//                             };
//                         }
//                     }
//                 }
//
//                 if (--complete == 0) {
//                     exports.API.variogram = kriging.train(p_t, p_x, p_y, 'exponential', 0, 100);
//                     completionCallback();
//                 }
//             }
//         } catch (error) {
//             retryer(error);
//         }
//     }
// }







import * as pip from 'point-in-polygon';
import * as kriging from '@sakitam-gis/kriging';
import {default as regions, Region} from "./Regions";

const width = 256 / 7;
const height = width * Math.sqrt(3) / 2;
const halfWidth = width * .5;
const halfHeight = height * .5;

let regionPolygon = [[halfWidth * .5, halfHeight], [halfWidth, 0], [halfWidth * .5, -halfHeight], [-halfWidth * .5, -halfHeight], [-halfWidth, 0], [-halfWidth * .5, halfHeight]];

let regionNameMap = [];
for (let i = 0; i < regions.length; i++)
    regionNameMap[regions[i].name] = regions[i].realName;

async function APIQuery(URL): Promise<any> {
    return await (await fetch(URL)).json();
}


export class API {
    public regions: Array<Region> = regions

    public mapRegionName(x): string {
        return regionNameMap[x];
    }


    public calculateRegion(x, y) {
        for (let i = 0; i < regions.length; i++) {
            const region = regions[i];
            if (pip([x - region.x - 128, -region.y + y + 128], regionPolygon, 0, regionPolygon.length))
                return region.name;
        }
        return null;
    }

    public mapControl: object = {}
    public resources: object = {}

    public remapXY(f) {

        const w = 256 / 7;
        const k = w * Math.sqrt(3) / 2;

        if (f == "KingsCageHex") return {x: -1.5 * w, y: 0};
        if (f == "WestgateHex") return {x: -2.25 * w, y: -.5 * k};
        if (f == "FarranacCoastHex") return {x: -2.25 * w, y: .5 * k};
        if (f == "EndlessShoreHex") return {x: 2.25 * w, y: -.5 * k};
        if (f == "StlicanShelfHex") return {x: 2.25 * w, y: .5 * k};
        if (f == "OarbreakerHex") return {x: -3 * w, y: k};
        if (f == "FishermansRowHex") return {x: -3 * w, y: 0};
        if (f == "StemaLandingHex") return {x: -3 * w, y: -1 * k};
        if (f == "GodcroftsHex") return {x: 3 * w, y: k};
        if (f == "SableportHex") return {x: -1.5 * w, y: -1 * k};
        if (f == "TempestIslandHex") return {x: 3 * w, y: 0};
        if (f == "ReaversPassHex") return {x: 2.25 * w, y: -1.5 * k};
        if (f == "TheFingersHex") return {x: 3 * w, y: -1 * k};
        if (f == "ClahstraHex") return {x: 1.5 * w, y: 0};
        if (f == "DeadLandsHex") return {x: 0, y: 0};
        if (f == "CallahansPassageHex") return {x: 0, y: k};
        if (f == "MarbanHollow") return {x: .75 * w, y: .5 * k};
        if (f == "UmbralWildwoodHex") return {x: 0, y: -1 * k};
        if (f == "MooringCountyHex") return {x: -.75 * w, y: 1.5 * k};
        if (f == "HeartlandsHex") return {x: -.75 * w, y: -1.5 * k};
        if (f == "LochMorHex") return {x: -.75 * w, y: -.5 * k};
        if (f == "LinnMercyHex") return {x: -.75 * w, y: .5 * k};
        if (f == "ReachingTrailHex") return {x: 0, y: 2 * k};
        if (f == "StonecradleHex") return {x: -1.5 * w, y: k};
        if (f == "GreatMarchHex") return {x: 0, y: -2 * k};
        if (f == "AllodsBightHex") return {x: 1.5 * w, y: -1.0 * k};
        if (f == "WeatheredExpanseHex") return {x: 1.5 * w, y: k};
        if (f == "DrownedValeHex") return {x: .75 * w, y: -.5 * k};
        if (f == "ShackledChasmHex") return {x: .75 * w, y: -1.5 * k};
        if (f == "ViperPitHex") return {x: .75 * w, y: 1.5 * k};
        if (f == "NevishLineHex") return {x: -2.25 * w, y: 1.5 * k};
        if (f == "AcrithiaHex") return {x: .75 * w, y: -2.5 * k};
        if (f == "RedRiverHex") return {x: -.75 * w, y: -2.5 * k};
        if (f == "CallumsCapeHex") return {x: -1.5 * w, y: 2 * k};
        if (f == "SpeakingWoodsHex") return {x: -.75 * w, y: 2.5 * k};
        if (f == "BasinSionnachHex") return {x: 0, y: 3 * k};
        if (f == "HowlCountyHex") return {x: .75 * w, y: 2.5 * k};
        if (f == "ClansheadValleyHex") return {x: 1.5 * w, y: 2 * k};
        if (f == "MorgensCrossingHex") return {x: 2.25 * w, y: 1.5 * k};
        if (f == "TerminusHex") return {x: 1.5 * w, y: -2 * k};
        if (f == "KalokaiHex") return {x: 0, y: -3 * k};
        if (f == "AshFieldsHex") return {x: -1.5 * w, y: -2 * k};
        if (f == "OriginHex") return {x: -2.25 * w, y: -1.5 * k};

        return {x: 0, y: 0};
    }

    public ownership(x, y, region) {
        if (!(region in this.mapControl))
            return "OFFLINE";

        x -= 128;
        y += 128;

        const u = this.mapControl[region];
        let distanceSquared = -1;
        let icon = -1;
        const keys = Object.keys(u);
        for (let key of keys) {
            const j = u[key];
            if (j.town) {
                const px = j.x;
                const py = j.y;
                const distanceCalculation = (x - px) * (x - px) + (y - py) * (y - py);
                if (distanceSquared < 0 || distanceCalculation < distanceSquared) {
                    icon = j.mapIcon;
                    distanceSquared = distanceCalculation;
                }
            }
        }

        const c = kriging.predict(x, y, this.variogram);
        return {ownership: c < -.25 ? "WARDENS" : (c > .25 ? "COLONIALS" : "NONE"), icon: icon};
    }

    public control(x, y) {
        return kriging.predict(x - 128, y + 128, this.variogram)
    }

    public townHallIcons: Array<number> = [35, 5, 6, 7, 8, 9, 10, 45, 46, 47, 29, 17, 34, 51, 39, 12, 52, 33, 18, 19, 56, 57, 58, 59, 60]

    public krigingControlPointIcons: Array<number> = [/* safe house 35, */5, 6, 7, 8, 9, 10, 45, 46, 47, 29, 56, 57, 58, 59, 60]

    public war: any
    
    public async update(completionCallback, shard, retryer) {

        let key;
        let y;
        let x;
        if (shard == null)
            shard = 'war-service-live';

        this.war = await APIQuery(`https://${shard}.foxholeservices.com/api/worldconquest/war`);

        const maps = await APIQuery(`https://${shard}.foxholeservices.com/api/worldconquest/maps`);

        await new Promise<void>(resolve => {
            try {

                // iterate here on the maps and collect status
                let complete = maps.length;
                const p_x = [], p_y = [], p_t = [];

                const xf = 256 / 7;
                const yf = xf * Math.sqrt(3) / 2;

                for (let i = 0; i < maps.length; i++) {
                    const mapName = maps[i];
                    setTimeout(async () => {
                        const mapData = await APIQuery(`https://${shard}.foxholeservices.com/api/worldconquest/maps/${maps[i]}/dynamic/public`);
                        if (mapData.mapItems.length > 0) {
                            this.mapControl[mapName] = {};
                            this.resources[mapName] = {};
                            const offset = this.remapXY(mapName);
                            for (let j = 0; j < mapData.mapItems.length; j++) {
                                const icon = mapData.mapItems[j].iconType;
                                x = mapData.mapItems[j].x;
                                y = mapData.mapItems[j].y;
                                x = (((x * xf) + offset.x) - xf * .5);
                                y = ((((1 - y) * yf) + offset.y) - yf * .5);
                                key = x.toFixed(3).toString().concat('|').concat(y.toFixed(3).toString());
                                if (this.townHallIcons.includes(icon)) {
                                    const control = mapData.mapItems[j].teamId;
                                    this.mapControl[mapName][key] = {
                                        x: x,
                                        y: y,
                                        control: control,
                                        mapIcon: icon,
                                        nuked: (mapData.mapItems[j].flags & 0x10) != 0,
                                        town: this.krigingControlPointIcons.includes(icon)
                                    };
                                    if ((mapData.mapItems[j].flags & 0x10) == 0 && control != "OFFLINE" && this.krigingControlPointIcons.includes(icon)) {
                                        p_x.push(x);
                                        p_y.push(y);
                                        p_t.push(control == "WARDENS" ? -1 : (control == "COLONIALS" ? 1 : 0));
                                    }
                                } else {
                                    this.resources[mapName][key] = {
                                        x: x,
                                        y: y,
                                        control: mapData.mapItems[j].teamId,
                                        mapIcon: icon,
                                        nuked: (mapData.mapItems[j].flags & 0x10) != 0
                                    };
                                }
                            }
                        }

                        if (--complete == 0) {
                            this.variogram = kriging.train(p_t, p_x, p_y, 'exponential', 0, 100);
                            completionCallback();
                            resolve();
                        }
                    }, 0);
                }
            } catch (error) {
                retryer(error);
            }
        });
    }
    
    public variogram: any
}

//module.exports.Create = () => new API();