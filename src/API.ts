import * as pip from 'point-in-polygon';
import * as kriging from '@sakitam-gis/kriging';
import {default as regions, Region} from "./Regions";
import krig from './PredictorWorker';

const width = 256 / 10;
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
    #w = 256 / 10;
    #k = 256 / 10 * Math.sqrt(3) / 2;
    private regionMap: Map<string, { x: number, y: number }> =
        new Map(regions.map(r => [r.name, {x: r.x, y: r.y}]))

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

        if (worker == null) return new Promise<number[]>(resolve => {
            setTimeout(() => {
                resolve(krig(
                    {
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
                    }));
            }, 0);
        });
        else
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

    // Foxhole iconTypes routed to mapControl (vs resources). Anything not in
    // this list falls through to `resources` in update(). See clapfoot/warapi
    // for the authoritative iconType reference.
    public townHallIcons: Array<number> = [
        35,                              // Garrison Station
        5, 56, 6, 57, 7, 58,             // Town Bases T1/T2/T3
        8,                               // Forward Base 1
        45,                              // Relic Base 1 (46/47 retired in U52)
        27, 29,                          // Keep, Fort
        17, 34, 51,                      // Refinery, Factory, Mass Production Factory
        39,                              // Construction Yard
        12,                              // Vehicle Factory
        52, 18,                          // Seaport, Shipyard
        19,                              // Tech Center
        28, 30, 37,                      // Observation Tower, Troop Ship, Rocket Site
        33,                              // Storage Facility
        59, 60,                          // Storm Cannon, Intel Center
        53, 54,                          // Coastal Gun, Soul Factory
        70, 71, 72,                      // Rocket Target, Ground Zero, Site With Rocket
        83, 84,                          // Weather Station, Mortar House
        88, 89, 90, 91, 92,              // Aircraft Depot/Factory/Radar/Runway T1/T2 (1.63 Airborne)
    ]

    public krigingControlPointIcons: Array<number> = [
        5, 56, 6, 57, 7, 58,             // Town Bases T1/T2/T3
        8,                               // Forward Base 1
        45,                              // Relic Base 1
        27, 29,                          // Keep, Fort
        59, 60,                          // Storm Cannon, Intel Center
    ]

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

        const xf = 256 / 10;
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