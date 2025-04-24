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
    for (const v of args.tests)
        output.push(predict(v.x - 128, v.y + 128, variogram));
    postMessage(output);
}