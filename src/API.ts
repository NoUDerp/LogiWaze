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


export default class API {
    public regions: Array<Region> = regions

    public mapRegionName(x): string {
        return regionNameMap[x];
    }


    public calculateRegion(x: number, y: number) {
        for (let i = 0; i < regions.length; i++) {
            const region = regions[i];
            if (pip([x - region.x - 128, -region.y + y + 128], regionPolygon, 0, regionPolygon.length))
                return region.name;
        }
        return null;
    }

    public mapControl: object = {}
    public resources: object = {}
    #w = 256 / 7;
    #k = 256 / 7 * Math.sqrt(3) / 2;
    private regionMap: Map<string, { x: number, y: number }> = new Map([
        ["KingsCageHex", {x: -1.5 * (256 / 7), y: 0}],
        ["WestgateHex", {x: -2.25 * (256 / 7), y: -.5 * (256 / 7 * Math.sqrt(3) / 2)}],
        ["FarranacCoastHex", {x: -2.25 * (256 / 7), y: .5 * (256 / 7 * Math.sqrt(3) / 2)}],
        ["EndlessShoreHex", {x: 2.25 * (256 / 7), y: -.5 * (256 / 7 * Math.sqrt(3) / 2)}],
        ["StlicanShelfHex", {x: 2.25 * (256 / 7), y: .5 * (256 / 7 * Math.sqrt(3) / 2)}],
        ["OarbreakerHex", {x: -3 * (256 / 7), y: (256 / 7 * Math.sqrt(3) / 2)}],
        ["FishermansRowHex", {x: -3 * (256 / 7), y: 0}],
        ["StemaLandingHex", {x: -3 * (256 / 7), y: -1 * (256 / 7 * Math.sqrt(3) / 2)}],
        ["GodcroftsHex", {x: 3 * (256 / 7), y: (256 / 7 * Math.sqrt(3) / 2)}],
        ["SableportHex", {x: -1.5 * (256 / 7), y: -1 * (256 / 7 * Math.sqrt(3) / 2)}],
        ["TempestIslandHex", {x: 3 * (256 / 7), y: 0}],
        ["ReaversPassHex", {x: 2.25 * (256 / 7), y: -1.5 * (256 / 7 * Math.sqrt(3) / 2)}],
        ["TheFingersHex", {x: 3 * (256 / 7), y: -1 * (256 / 7 * Math.sqrt(3) / 2)}],
        ["ClahstraHex", {x: 1.5 * (256 / 7), y: 0}],
        ["DeadLandsHex", {x: 0, y: 0}],
        ["CallahansPassageHex", {x: 0, y: (256 / 7 * Math.sqrt(3) / 2)}],
        ["MarbanHollow", {x: .75 * (256 / 7), y: .5 * (256 / 7 * Math.sqrt(3) / 2)}],
        ["UmbralWildwoodHex", {x: 0, y: -1 * (256 / 7 * Math.sqrt(3) / 2)}],
        ["MooringCountyHex", {x: -.75 * (256 / 7), y: 1.5 * (256 / 7 * Math.sqrt(3) / 2)}],
        ["HeartlandsHex", {x: -.75 * (256 / 7), y: -1.5 * (256 / 7 * Math.sqrt(3) / 2)}],
        ["LochMorHex", {x: -.75 * (256 / 7), y: -.5 * (256 / 7 * Math.sqrt(3) / 2)}],
        ["LinnMercyHex", {x: -.75 * (256 / 7), y: .5 * (256 / 7 * Math.sqrt(3) / 2)}],
        ["ReachingTrailHex", {x: 0, y: 2 * (256 / 7 * Math.sqrt(3) / 2)}],
        ["StonecradleHex", {x: -1.5 * (256 / 7), y: (256 / 7 * Math.sqrt(3) / 2)}],
        ["GreatMarchHex", {x: 0, y: -2 * (256 / 7 * Math.sqrt(3) / 2)}],
        ["AllodsBightHex", {x: 1.5 * (256 / 7), y: -1.0 * (256 / 7 * Math.sqrt(3) / 2)}],
        ["WeatheredExpanseHex", {x: 1.5 * (256 / 7), y: (256 / 7 * Math.sqrt(3) / 2)}],
        ["DrownedValeHex", {x: .75 * (256 / 7), y: -.5 * (256 / 7 * Math.sqrt(3) / 2)}],
        ["ShackledChasmHex", {x: .75 * (256 / 7), y: -1.5 * (256 / 7 * Math.sqrt(3) / 2)}],
        ["ViperPitHex", {x: .75 * (256 / 7), y: 1.5 * (256 / 7 * Math.sqrt(3) / 2)}],
        ["NevishLineHex", {x: -2.25 * (256 / 7), y: 1.5 * (256 / 7 * Math.sqrt(3) / 2)}],
        ["AcrithiaHex", {x: .75 * (256 / 7), y: -2.5 * (256 / 7 * Math.sqrt(3) / 2)}],
        ["RedRiverHex", {x: -.75 * (256 / 7), y: -2.5 * (256 / 7 * Math.sqrt(3) / 2)}],
        ["CallumsCapeHex", {x: -1.5 * (256 / 7), y: 2 * (256 / 7 * Math.sqrt(3) / 2)}],
        ["SpeakingWoodsHex", {x: -.75 * (256 / 7), y: 2.5 * (256 / 7 * Math.sqrt(3) / 2)}],
        ["BasinSionnachHex", {x: 0, y: 3 * (256 / 7 * Math.sqrt(3) / 2)}],
        ["HowlCountyHex", {x: .75 * (256 / 7), y: 2.5 * (256 / 7 * Math.sqrt(3) / 2)}],
        ["ClansheadValleyHex", {x: 1.5 * (256 / 7), y: 2 * (256 / 7 * Math.sqrt(3) / 2)}],
        ["MorgensCrossingHex", {x: 2.25 * (256 / 7), y: 1.5 * (256 / 7 * Math.sqrt(3) / 2)}],
        ["TerminusHex", {x: 1.5 * (256 / 7), y: -2 * (256 / 7 * Math.sqrt(3) / 2)}],
        ["KalokaiHex", {x: 0, y: -3 * (256 / 7 * Math.sqrt(3) / 2)}],
        ["AshFieldsHex", {x: -1.5 * (256 / 7), y: -2 * (256 / 7 * Math.sqrt(3) / 2)}],
        ["OriginHex", {x: -2.25 * (256 / 7), y: -1.5 * (256 / 7 * Math.sqrt(3) / 2)}],
    ])

    public remapXY(regionName: string): { x: number; y: number } {
        return this.regionMap.has(regionName) ? this.regionMap.get(regionName) : {x: 0, y: 0};
    }

    public ownership(x: number, y: number, region: string) {
        if (!(region in this.mapControl))
            return "OFFLINE";

        x -= 128;
        y += 128;
        const c = kriging.predict(x, y, this.variogram);
        return {ownership: c < -.25 ? "WARDENS" : (c > .25 ? "COLONIALS" : "NONE")};//, icon: icon};
    }


    public batchOwnership(worker: Worker | null, tests: { x: number, y: number, region: string }[]): Promise<number[]> {
        const thi = this;

        // if (worker == null) return new Promise<number[]>(resolve => {
        //     setTimeout(() => {
        //         resolve(krig(
        //             {
        //                 tests: tests,
        //                 mapControl: this.mapControl,
        //                 variogram:
        //                     {
        //                         t: thi.variogram.t,
        //                         x: thi.variogram.x,
        //                         y: thi.variogram.y,
        //                         nugget: thi.variogram.nugget,
        //                         range: thi.variogram.range,
        //                         sill: thi.variogram.sill,
        //                         A: thi.variogram.A,
        //                         n: thi.variogram.n,
        //                         K: thi.variogram.K,
        //                         M: thi.variogram.M,
        //                     }
        //             }));
        //     }, 0);
        // });
        // else
            return new Promise<number[]>(resolve => {
                worker.onmessage = async (d) => resolve(d.data);

                worker.postMessage({
                    tests: tests,
                    mapControl: this.mapControl,
                    variogram:
                        {
                            t: thi.variogram.t,
                            x: thi.variogram.x,
                            y: thi.variogram.y,
                            nugget: thi.variogram.nugget,
                            range: thi.variogram.range,
                            sill: thi.variogram.sill,
                            A: thi.variogram.A,
                            n: thi.variogram.n,
                            K: thi.variogram.K,
                            M: thi.variogram.M,
                        }
                });
            });
    }

    public control(x: number, y: number): number {
        return kriging.predict(x - 128, y + 128, this.variogram)
    }

    public townHallIcons: Array<number> = [35, 5, 6, 7, 8, 9, 10, 45, 46, 47, 29, 17, 34, 51, 39, 12, 52, 33, 18, 19, 56, 57, 58, 59, 60]

    public krigingControlPointIcons: Array<number> = [/* safe house 35, */5, 6, 7, 8, 9, 10, 45, 46, 47, 29, 56, 57, 58, 59, 60]

    public war: any

    public async update(completionCallback: { (): Promise<void> }, shard, retryer) {

        let key;
        let y: number;
        let x: number;
        if (shard == null)
            shard = 'war-service-live';

        this.war = await APIQuery(`https://${shard}.foxholeservices.com/api/worldconquest/war`);

        const maps = await APIQuery(`https://${shard}.foxholeservices.com/api/worldconquest/maps`);

        // iterate here on the maps and collect status
        const p_x = [], p_y = [], p_t = [];

        const xf = 256 / 7;
        const yf = xf * Math.sqrt(3) / 2;
        const tasks: Array<Promise<void>> = [];

        const u = this;

        async function downloadMapData(mapName: string, i: number, mapControl, resources) {
            const mapData = await APIQuery(`https://${shard}.foxholeservices.com/api/worldconquest/maps/${maps[i]}/dynamic/public`);
            if (mapData.mapItems.length > 0) {
                mapControl[mapName] = {};
                resources[mapName] = {};
                const offset = u.remapXY(mapName);
                for (let j = 0; j < mapData.mapItems.length; j++) {
                    const icon = mapData.mapItems[j].iconType;
                    x = mapData.mapItems[j].x;
                    y = mapData.mapItems[j].y;
                    x = (((x * xf) + offset.x) - xf * .5);
                    y = ((((1 - y) * yf) + offset.y) - yf * .5);
                    key = x.toFixed(3).toString().concat('|').concat(y.toFixed(3).toString());
                    if (u.townHallIcons.includes(icon)) {
                        const control = mapData.mapItems[j].teamId;
                        mapControl[mapName][key] = {
                            x: x,
                            y: y,
                            control: control,
                            mapIcon: icon,
                            nuked: (mapData.mapItems[j].flags & 0x10) != 0,
                            town: u.krigingControlPointIcons.includes(icon)
                        };
                        if ((mapData.mapItems[j].flags & 0x10) == 0 && control != "OFFLINE" && u.krigingControlPointIcons.includes(icon)) {
                            p_x.push(x);
                            p_y.push(y);
                            p_t.push(control == "WARDENS" ? -1 : (control == "COLONIALS" ? 1 : 0));
                        }
                    } else {
                        resources[mapName][key] = {
                            x: x,
                            y: y,
                            control: mapData.mapItems[j].teamId,
                            mapIcon: icon,
                            nuked: (mapData.mapItems[j].flags & 0x10) != 0
                        };
                    }
                }
            }
        }

        for (let i = 0; i < maps.length; i++)
            tasks.push(downloadMapData(maps[i], i, this.mapControl, this.resources));
        await Promise.all(tasks);

        this.variogram = kriging.train(p_t, p_x, p_y, 'exponential', 0, 100);
        await completionCallback();
    }

    public variogram: any
}

//module.exports.Create = () => new API();