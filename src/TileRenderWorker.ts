import {variogramExponential} from "@sakitam-gis/kriging/src/utils";
import * as kriging from "@sakitam-gis/kriging";
import * as intersects from 'intersects';

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
let icons;// = new Map<string, ImageBitmap>();

onmessage = async (e) => {
    const context = e.data as { operation: string, arguments: any };
    switch (context.operation) {
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
            icons = new Map<string, ImageBitmap>();

            // for (const i of context.arguments.icons as {
            //     data: ArrayBuffer,
            //     width: number,
            //     height: number,
            //     name: string
            // }[]) {
            //         // Create a Uint8ClampedArray view of the SharedArrayBuffer
            //         //const pixelData = new Uint8ClampedArray(i.data);
            //     icons.set(i.name, await createImageBitmap(new Blob([i.data])));
            //         // Draw to temporary canvas
            //         //  const canvas = new OffscreenCanvas(i.width, i.height);
            //         //  const ctx = canvas.getContext('2d');
            //         // //
            //         //  ctx.putImageData(new ImageData(new Uint8ClampedArray(i.data), i.width, i.height), 0, 0);
            //         //
            //         // // Create and return ImageBitmap
            //         // icons.set(i.name, canvas.transferToImageBitmap());
            // }
            postMessage("ok");
            break;
        }
        case
        "control"
        : {
            const controlWidth = context.arguments[0];
            const controlHeight = context.arguments[1];
            const hdRatio = context.arguments[2];
            const gridX = context.arguments[3];
            const gridY = context.arguments[4];
            const args = context.arguments[5] as {
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
                height: number,
                max_zoom: number,
                hex_sources: any
            };

            const colors = [{
                r: 0.1372549019607843,
                g: 0.3372549019607843,
                b: 0.5137254901960784
            }, {r: 0.3176470588235294, g: 0.4235294117647059, b: 0.2941176470588235}];

            const controlCanvas = new OffscreenCanvas(controlWidth, controlHeight);
            const controlContext = controlCanvas.getContext('2d');
            const d = new ImageData(controlWidth, controlHeight);
            let i = 0;
            for (let y = 0; y < controlHeight; y++) {
                for (let x = 0; x < controlWidth; x++) {
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
            controlContext.putImageData(d, 0, 0);

            function fillHex(ctx, x, y, w, h) {
                ctx.beginPath();
                ctx.moveTo(x + w, y);
                ctx.lineTo(x + w * .5, y + h);
                ctx.lineTo(x - w * .5, y + h);
                ctx.lineTo(x - w, y);
                ctx.lineTo(x - .5 * w, y - h);
                ctx.lineTo(x + .5 * w, y - h);
                ctx.lineTo(x + w, y);
                ctx.fill();
                ctx.stroke();
            }

            function drawValidRegions(tile: OffscreenCanvas, ctx: OffscreenCanvasRenderingContext2D, coords, pixelScale: number, max_zoom: number, hex_sources) {
                const zoom = Math.pow(2, coords.z);
                const lineWidth = Math.pow(2, coords.z);
                const shadow = lineWidth * .5 / Math.pow(2, max_zoom);
                ctx.save();
                const color = '#FFFFFF88';
                ctx.fillStyle = ctx.strokeStyle = color;
                ctx.scale(pixelScale, pixelScale);
                for (let j of hex_sources) {
                    if (!j.offline) {
                        const label_w = j.size.width * zoom + shadow * 2;
                        const label_h = j.size.height * zoom + shadow * 2;
                        const label_x = j.x * zoom - coords.x * tile.width / pixelScale - label_w - shadow;
                        const label_y = j.y * zoom - coords.y * tile.height / pixelScale - label_h - shadow;
                        if (intersects.boxBox(0, 0, tile.width, tile.height, label_x, label_y, label_w, label_h))
                            fillHex(ctx, label_x + label_w * .5, label_y + label_h * .5, label_w * .5, label_h * .5);//, lineWidth);
                    }
                }
                ctx.restore();
            }

            function drawInvalidRegions(tile: OffscreenCanvas, ctx, coords, pixelScale: number, max_zoom: number, hex_sources) {
                const zoom = Math.pow(2, coords.z);
                const lineWidth = Math.pow(2, coords.z);
                const shadow = lineWidth * .5 / Math.pow(2, max_zoom);
                ctx.save();
                ctx.fillStyle = '#000000FF';
                ctx.strokeStyle = '#000000FF';
                for (let j of hex_sources) if (j.offline) {
                    const label_w = j.size.width * zoom + shadow * 2;
                    const label_h = j.size.height * zoom + shadow * 2;
                    const label_x = j.x * zoom - coords.x * args.width / pixelScale - label_w - shadow;// / t.pixelScale    const
                    const label_y = j.y * zoom - coords.y * args.height / pixelScale - label_h - shadow;

                    if (intersects.boxBox(0, 0, args.width, args.height, label_x, label_y, label_w, label_h))
                        fillHex(ctx, label_x + label_w * .5, label_y + label_h * .5, label_w * .5, label_h * .5);//, lineWidth);
                }

                ctx.restore();
            }

            function drawRoads(ctx: OffscreenCanvasRenderingContext2D, args: {
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
            }) {
                ctx.fillStyle = "#FFFFFF00";
                ctx.fillRect(0, 0, args.width, args.height);

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
                //return canvas.transferToImageBitmap();
            }

            // draw control layer to transparent canvas
            const overlay = new OffscreenCanvas(args.width, args.height);
            const overlayContext = overlay.getContext('2d');
            overlayContext.save();
            // clear
            overlayContext.fillStyle = '#00000000';
            overlayContext.fillRect(0, 0, args.width, args.height);
            overlayContext.restore();
            drawValidRegions(overlay, overlayContext, args.coords, args.pixelScale, args.max_zoom, args.hex_sources);
            //overlayContext.restore();
            overlayContext.save();
            overlayContext.globalCompositeOperation = 'source-atop'; // mask the alpha to overlay the control layer, copy it to temporary storage
            overlayContext.imageSmoothingQuality = 'low'; // highest performance possible for a copy, no smoothing needed
            // scale up control layer

            overlayContext.drawImage(controlCanvas, 1, 1, controlCanvas.width - 2, controlCanvas.height - 2, 0, 0, args.width, args.height);
            overlayContext.restore();
            overlayContext.save();
            overlayContext.scale(args.pixelScale, args.pixelScale);
            drawInvalidRegions(overlay, overlayContext, args.coords, args.pixelScale, args.max_zoom, args.hex_sources);
            overlayContext.restore();

            overlayContext.save();
            overlayContext.scale(args.pixelScale, args.pixelScale);
            drawRoads(overlayContext, args);
            overlayContext.restore();

            function drawBorders(coords, ctx: OffscreenCanvasRenderingContext2D, width: number, height: number, max_zoom: number, pixelScale: number, hex_sources) {
                function drawHex(ctx: OffscreenCanvasRenderingContext2D, x, y, w, h, scale) {
                    ctx.lineWidth = scale;
                    ctx.beginPath();
                    ctx.moveTo(x + w, y);
                    ctx.lineTo(x + w * .5, y + h);
                    ctx.lineTo(x - w * .5, y + h);
                    ctx.lineTo(x - w, y);
                    ctx.lineTo(x - .5 * w, y - h);
                    ctx.lineTo(x + .5 * w, y - h);
                    ctx.lineTo(x + w, y);
                    ctx.stroke();
                }

                const zoom = Math.pow(2, coords.z);
                const lineWidth = .2 * Math.pow(2, coords.z);
                const shadow = lineWidth * .5 / Math.pow(2, max_zoom);

                ctx.save();
                ctx.strokeStyle = '#303030';
                ctx.globalAlpha = .8;
                //ctx.opacity = .8;
                ctx.scale(pixelScale, pixelScale);

                for (let j of hex_sources) {
                    const label_w = j.size.width * zoom + shadow * 2;
                    const label_h = j.size.height * zoom + shadow * 2;
                    const label_x = j.x * zoom - coords.x * width / pixelScale - label_w - shadow;
                    const label_y = j.y * zoom - coords.y * height / pixelScale - label_h - shadow;
                    if (intersects.boxBox(0, 0, width, height, label_x, label_y, label_w, label_h))
                        drawHex(ctx, label_x + label_w * .5,
                            label_y + label_h * .5,
                            label_w * .5,
                            label_h * .5,
                            lineWidth
                        );
                }
                ctx.restore();
            }

            drawBorders(args.coords, overlayContext, args.width, args.height, args.max_zoom, args.pixelScale, args.hex_sources);

            function drawIcons(c) {

                // function makeRenderCallback(u, icon, ctx: OffscreenCanvasRenderingContext2D, img, lx, ly, lw, lh, tile, glow, shadow) {
                //     return function () {
                //         if (glow) {
                //             ctx.filter = "brightness(0.5) sepia(1) hue-rotate(296deg) saturate(10000%) blur(".concat(shadow).concat("px)"); // blur(10px)
                //             ctx.drawImage(img.image, lx, ly, lw, lh);
                //             ctx.drawImage(img.image, lx, ly, lw, lh);
                //             ctx.drawImage(img.image, lx, ly, lw, lh);
                //             ctx.filter = "none";
                //         } else
                //             ctx.drawImage(img.image, lx, ly, lw, lh);
                //         if (--tile.pendingLoad == 0) {
                //             delete img.callbacks;
                //         }
                //     };
                // }
                //
                // const raw_scale = c.t.zoomScale(c.coords.z);
                // const zoom = Math.pow(2, c.coords.z);
                // const max = Math.pow(2, c.max_zoom);
                // c.tile.pendingLoad = 0;
                // const shadowSize = 20;
                // for (let j of c.t.icon_sources) {
                //     if (c.coords.z >= j.zoomMin && c.coords.z < j.zoomMax && j.icon != null && !(j.icon in c.t.disabledIcons)) {
                //         const scale = raw_scale;
                //         let shadow = j.glow ? shadowSize * scale * zoom / max : 0;
                //         const label_w = j.size.width * zoom * scale;
                //         const label_h = j.size.height * zoom * scale;
                //         const label_x = j.x * zoom - c.coords.x * c.tile.width / c.t.pixelScale - label_w * .5;
                //         const label_y = j.y * zoom - c.coords.y * c.tile.height / c.t.pixelScale - label_h * .5;
                //         if (intersects.boxBox(0, 0, c.tile.width / args.pixelScale, c.tile.height / c.t.pixelScale, label_x - 2.0 * shadow, label_y - 2.0 * shadow, label_w + 4.0 * shadow, label_h + 4.0 * shadow)) {
                //             const lx = label_x, ly = label_y, lw = label_w, lh = label_h;
                //             // const img = await this.imageCache.GetImage(`MapIcons/${j.icon}`);
                //             // if (j.glow) {
                //             //     c.ctx.save();
                //             //     c.ctx.filter = "brightness(0.5) sepia(1) hue-rotate(296deg) saturate(10000%) blur(".concat(shadow).concat("px)"); // blur(10px)              
                //             //     c.ctx.drawImage(img, lx, ly, lw, lh);
                //             //     c.ctx.drawImage(img, lx, ly, lw, lh);
                //             //     c.ctx.drawImage(img, lx, ly, lw, lh);
                //             //     c.ctx
                //             //         .restore();
                //             // } else c.ctx.drawImage(img, lx, ly, lw, lh);
                //         }
                //     }
                // }
            }

            // c.ctx.save();
            // c.ctx.scale(c.t.pixelScale, c.t.pixelScale);
            //
            // await c.t.drawIcons(c);
            // c.ctx.restore();

            const bitmap = overlay.transferToImageBitmap();
            postMessage(bitmap, null, [bitmap]);
            break;
        }

        default: // always return something
            postMessage(null, null);
    }
}