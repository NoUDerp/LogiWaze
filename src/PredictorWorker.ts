import {variogramExponential} from "@sakitam-gis/kriging/src/utils";
import {predict} from "@sakitam-gis/kriging";

onmessage = async (e) => {
    const args = e.data;

    const variogram =
        {
            t: args.variogram.t,
            x: args.variogram.x,
            y: args.variogram.y,
            nugget: args.variogram.nugget,
            range: args.variogram.range,
            sill: args.variogram.sill,
            A: args.variogram.A,
            n: args.variogram.n,
            model: variogramExponential,
            K: args.variogram.K,
            M: args.variogram.M
        };
    const output = [];
    for (const v of args.tests) {

        // const u = args.mapControl[v.region];
        // let distanceSquared = -1;
        // let icon = -1;
        // const keys = Object.keys(u);
        // for (let key of keys) {
        //     const j = u[key];
        //     if (j.town) {
        //         const px = j.x;
        //         const py = j.y;
        //         const distanceCalculation = (x - px) * (x - px) + (y - py) * (y - py);
        //         if (distanceSquared < 0 || distanceCalculation < distanceSquared) {
        //             icon = j.mapIcon;
        //             distanceSquared = distanceCalculation;
        //         }
        //     }
        // }

        if (!(v.region in args.mapControl))
            output.push(NaN);
        else
            output.push(predict(v.x - 128, v.y + 128, variogram));//, icon: icon});

    }
    postMessage(output);
}