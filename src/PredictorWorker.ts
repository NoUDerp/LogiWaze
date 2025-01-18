import {variogramExponential} from "@sakitam-gis/kriging/src/utils";
import {predict} from "@sakitam-gis/kriging";
export default function krig(args): number[] {
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
    const output = new Array<number>();
    for (const v of args.tests)
        if (!(v.region in args.mapControl))
            output.push(NaN);
        else
            output.push(predict(v.x - 128, v.y + 128, variogram));
    return output;
}
onmessage = async (e) => {

    postMessage(krig(e.data));
}