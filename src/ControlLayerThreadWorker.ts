import * as kriging from '@sakitam-gis/kriging';
import {variogramExponential} from "@sakitam-gis/kriging/src/utils";

let initialized = false, t, x, y, nugget, range, sill, A, n, K, M;

onmessage = (e) => {
    if (!initialized) {
        [t, x, y, nugget, range, sill, A, n, K, M] = e.data;
        initialized = true;
    } else {
        try {
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

            const width = e.data[0];
            const height = e.data[1];
            const hdRatio = e.data[2];
            const gridX = e.data[3];
            const gridY = e.data[4];
            const colors = [{
                r: 0.1372549019607843,
                g: 0.3372549019607843,
                b: 0.5137254901960784
            }, {r: 0.3176470588235294, g: 0.4235294117647059, b: 0.2941176470588235}];

            const canvas = new OffscreenCanvas(width, height);
            const ctx = canvas.getContext('2d');
            const d = new ImageData(width, height);
            let i = 0;
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const scale = {x: gridX + (x - 1) * hdRatio, y: -(gridY + (y - 1) * hdRatio)};
                    let v = kriging.predict(scale.x - 128, scale.y + 128, variogram);

                    if (v < 0) // fade from warden
                    {
                        v++;
                        d.data[i++] = Math.floor(255 * (v * (1.0 - colors[0].r) + colors[0].r));
                        d.data[i++] = Math.floor(255 * (v * (-colors[0].g) + colors[0].g));
                        d.data[i++] = Math.floor(255 * (v * (-colors[0].b) + colors[0].b));
                        d.data[i++] = 255;
                    } else if (v > 0) // fade from colonial
                    {
                        v = 1 - v;
                        d.data[i++] = Math.floor(255 * (v * (1.0 - colors[1].r) + colors[1].r));
                        d.data[i++] = Math.floor(255 * (v * (-colors[1].g) + colors[1].g));
                        d.data[i++] = Math.floor(255 * (v * (-colors[1].b) + colors[1].b));
                        d.data[i++] = 255;
                    }
                }
            }
            ctx.putImageData(d, 0, 0);
            const bitmap = canvas.transferToImageBitmap();
            postMessage(bitmap, null, [bitmap]);
        } catch (error) { // always return something, so the worker thread can be released
            postMessage(null, null);
        }
    }
};