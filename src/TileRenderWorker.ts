import {variogramExponential} from "@sakitam-gis/kriging/src/utils";
import * as kriging from "@sakitam-gis/kriging";

let road_sources;
let variogram: {
    t: any,
    x: number[],
    y: number[],
    nugget: any,
    range: any,
    sill: any,
    A: any,
    n: any,
    model: any,
    K: any,
    M: number[],
};

onmessage = (e) => {
    const context = e.data as { operation: string, arguments: any };
    switch (context.operation) {
        case "roads": // draw roads
        {
            const args = context.arguments as {
                coords: { x: number, y: number, z: number },
                grid_depth: number,
                offset,
                roadWidth,
                controlWidth,
                grid_x_size,
                grid_y_size,
                controls,
                pixelScale,
                width: number,
                height: number
            };

            const canvas = new OffscreenCanvas(args.width, args.height);
            const ctx = canvas.getContext("2d") as OffscreenCanvasRenderingContext2D;

            ctx.fillStyle = "#FFFFFF00";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.lineJoin = 'miter';
            ctx.lineCap = 'round';

            const scale = Math.pow(2, args.grid_depth - args.coords.z);
            const start_x = Math.floor(args.coords.x * scale);
            const start_y = Math.floor(args.coords.y * scale);

            const end_x = Math.ceil((args.coords.x + 1) * scale);
            const end_y = Math.ceil((args.coords.y + 1) * scale);

            const depth_inverse = Math.pow(2, args.coords.z);
            const innerWidth = args.controlWidth * depth_inverse;

            function draw(start_x: number, start_y: number, end_x: number, end_y: number) {
                ctx.lineWidth = innerWidth;
                const colors = ['#516C4B', '#235683', '#303030', '#CCCC44'];

                for (let y = start_y; y <= end_y; y++)
                    for (let x = start_x; x <= end_x; x++)
                        if (x >= 0 && y >= 0 && x < args.grid_x_size && y < args.grid_y_size) {
                            for (let i = 0; i < road_sources[x][y].length; i++) {
                                const j = road_sources[x][y][i];
                                if (args.controls[0]) {
                                    ctx.strokeStyle = colors[j.options.control];
                                    ctx.beginPath();
                                    const coordsx = args.coords.x * args.width / args.pixelScale;
                                    const coordsy = args.coords.y * args.height / args.pixelScale;
                                    const x1 = (j.points[0][1] + args.offset[0]) * depth_inverse - coordsx;
                                    const y1 = (j.points[0][0] + args.offset[1]) * depth_inverse - coordsy;
                                    const x2 = (j.points[1][1] + args.offset[0]) * depth_inverse - coordsx;
                                    const y2 = (j.points[1][0] + args.offset[1]) * depth_inverse - coordsy;
                                    ctx.moveTo(x1, y1);
                                    ctx.lineTo(x2, y2);
                                    ctx.stroke();
                                }
                            }
                        }
            }

            draw(start_x, start_y, end_x, end_y);

            const bitmap = canvas.transferToImageBitmap();
            postMessage({bitmap}, null, [bitmap]);


            break;
        }
        case "initialize": {
            road_sources = context.arguments.roads;
            variogram =
                {
                    t: context.arguments.variogram.t,
                    x: context.arguments.variogram.x,
                    y: context.arguments.variogram.y,
                    nugget: context.arguments.variogram.nugget,
                    range: context.arguments.variogram.range,
                    sill: context.arguments.variogram.sill,
                    A: context.arguments.variogram.A,
                    n: context.arguments.variogram.n,
                    model: variogramExponential,
                    K: context.arguments.variogram.K,
                    M: context.arguments.variogram.M
                };
            break;
        }
        case "control": {
            const width = context.arguments[0];
            const height = context.arguments[1];
            const hdRatio = context.arguments[2];
            const gridX = context.arguments[3];
            const gridY = context.arguments[4];

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
            break;
        }

        default: // always return something
            postMessage(null, null);
    }
}