import * as kriging from '@sakitam-gis/kriging';
import {variogramExponential} from "@sakitam-gis/kriging/src/utils";

onmessage = (e) => {
    const [t, x, y, nugget, range, sill, A, n, K, M] = e.data[0]; 
    const variogram = {
        t,
        x,
        y,
        nugget: nugget,
        range: range,
        sill: sill,
        A: A,
        n: n,
        model: variogramExponential,
        K: K,
        M: M,
    };
    
    const width = e.data[1];
    const height = e.data[2];
    const hdRatio = e.data[3];
    const gridX = e.data[4];
    const gridY = e.data[5];
    const buffer = e.data[6] as ArrayBuffer;
    const colors = [{
            r: 0.1372549019607843,
            g: 0.3372549019607843,
            b: 0.5137254901960784
        }, {r: 0.3176470588235294, g: 0.4235294117647059, b: 0.2941176470588235}];

    const data = new Array<number>(width * height * 3);
    
    let i = 0;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const scale = {x: gridX + (x - 1) * hdRatio, y: -(gridY + (y - 1) * hdRatio)};
            let v = kriging.predict(scale.x - 128, scale.y + 128, variogram);

            if (v < 0) // fade from warden
            {
                v++;
                data[i++] = Math.floor(255 * (v * (1.0 - colors[0].r) + colors[0].r));
                data[i++] = Math.floor(255 * (v * (-colors[0].g) + colors[0].g));
                data[i++] = Math.floor(255 * (v * (-colors[0].b) + colors[0].b));
            } else if (v > 0) // fade from colonial
            {
                v = 1 - v;
                data[i++] = Math.floor(255 * (v * (1.0 - colors[1].r) + colors[1].r));
                data[i++] = Math.floor(255 * (v * (-colors[1].g) + colors[1].g));
                data[i++] = Math.floor(255 * (v * (-colors[1].b) + colors[1].b));
            }
        }
    }
    postMessage(data);
};