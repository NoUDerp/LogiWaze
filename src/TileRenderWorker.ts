import {variogramExponential} from "@sakitam-gis/kriging/src/utils";
import * as kriging from "@sakitam-gis/kriging";
import * as intersects from 'intersects';
import {predict} from "@sakitam-gis/kriging";

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
let icon_sources;
const fontMap = new Map<string, FontFace>();

onerror = (event) => console.log(`TileRenderWorker: ${event}`);

onmessage = async (e) => {
    try {
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
                icon_sources = context.arguments.icon_sources;

                // not sure if these should be loaded to the window or for each separate web worker context
                fontMap.set('Celtic', new FontFace('Celtic', context.arguments.fonts.Celtic as ArrayBuffer));
                fontMap.set('Roman', new FontFace('Roman', context.arguments.fonts.Roman as ArrayBuffer));
                fontMap.set('Italic', new FontFace('Italic', context.arguments.fonts.Italic as ArrayBuffer));
                fontMap.set('Renner', new FontFace('Renner', context.arguments.fonts.Renner as ArrayBuffer));

                await Promise.all([fontMap.get('Celtic').load(), fontMap.get('Roman').load(), fontMap.get('Italic').load(), fontMap.get('Renner').load()]);

                self.fonts.add(fontMap.get('Roman'));
                self.fonts.add(fontMap.get('Celtic'));
                self.fonts.add(fontMap.get('Renner'));
                self.fonts.add(fontMap.get('Italic'));

                for (const i of context.arguments.icons as {
                    data: ArrayBuffer,
                    name: string
                }[])
                    icons.set(i.name, await createImageBitmap(new Blob([i.data], {type: 'image/webp'})));
                postMessage("ok");
                break;
            }
            case "predict": {
                const variogram =
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
                const output = [];
                for (const v of context.arguments.tests)
                    output.push(predict(v.x, v.y, variogram));
                postMessage(output);
                break;
            }
            case "control": {
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
                    hex_sources: any,
                    disabled_icons: any,
                    drawBorders: boolean
                    drawControl: boolean,
                    drawRoads: any
                };

                const colors = [{
                    r: 0.1372549019607843,
                    g: 0.3372549019607843,
                    b: 0.5137254901960784
                }, {r: 0.3176470588235294, g: 0.4235294117647059, b: 0.2941176470588235}];

                let controlCanvas;

                if (args.drawControl) {
                    controlCanvas = new OffscreenCanvas(controlWidth, controlHeight);
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
                }

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

                function drawInvalidRegions(ctx : OffscreenCanvasRenderingContext2D, coords, pixelScale: number, max_zoom: number, hex_sources) {
                    const zoom = Math.pow(2, coords.z);
                    const lineWidth = Math.pow(2, coords.z);
                    const shadow = lineWidth * .5 / Math.pow(2, max_zoom);
                    ctx.save();
                    ctx.fillStyle = '#000000FF';
                    ctx.strokeStyle = '#000000FF';
                    ctx.globalAlpha = .5;
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
                    height: number,
                    drawBorders: boolean
                    drawControl: boolean,
                    drawRoads: any
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
                }

                // draw control layer to transparent canvas
                const overlay = new OffscreenCanvas(args.width, args.height);
                const overlayContext = overlay.getContext('2d');

                // clear
                overlayContext.save();
                overlayContext.fillStyle = '#00000000';
                overlayContext.fillRect(0, 0, args.width, args.height);
                overlayContext.restore();

                if (args.drawControl) {
                    drawValidRegions(overlay, overlayContext, args.coords, args.pixelScale, args.max_zoom, args.hex_sources);
                    overlayContext.save();
                    overlayContext.globalCompositeOperation = 'source-atop'; // mask the alpha to overlay the control layer, copy it to temporary storage
                    overlayContext.imageSmoothingQuality = 'low'; // highest performance possible for a copy, no smoothing needed
                    // scale up control layer
                    overlayContext.drawImage(controlCanvas, 1, 1, controlCanvas.width - 2, controlCanvas.height - 2, 0, 0, args.width, args.height);
                    overlayContext.restore();
                }

                overlayContext.save();
                overlayContext.scale(args.pixelScale, args.pixelScale);
                drawInvalidRegions(overlayContext, args.coords, args.pixelScale, args.max_zoom, args.hex_sources);
                overlayContext.restore();

                if (args.drawRoads) {
                    overlayContext.save();
                    overlayContext.scale(args.pixelScale, args.pixelScale);
                    drawRoads(overlayContext, args);
                    overlayContext.restore();
                }

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

                if (args.drawBorders)
                    drawBorders(args.coords, overlayContext, args.width, args.height, args.max_zoom, args.pixelScale, args.hex_sources);

                function drawIcons(ctx: OffscreenCanvasRenderingContext2D, coords, width: number, height: number, pixelScale: number, max_zoom: number, disabledIcons) {

                    function zoomScale(zoom, max_zoom): number {
                        return .65 * (1 + max_zoom - zoom);
                    }

                    const raw_scale = zoomScale(coords.z, max_zoom);
                    const zoom = Math.pow(2, coords.z);
                    const max = Math.pow(2, max_zoom);
                    const shadowSize = 20;
                    for (let j of icon_sources) {
                        if (coords.z >= j.zoomMin && coords.z < j.zoomMax && j.icon != null && !(j.icon in disabledIcons)) {
                            const scale = raw_scale;
                            let shadow = j.glow ? shadowSize * scale * zoom / max : 0;
                            const label_w = j.size.width * zoom * scale;
                            const label_h = j.size.height * zoom * scale;
                            const label_x = j.x * zoom - coords.x * width / pixelScale - label_w * .5;
                            const label_y = j.y * zoom - coords.y * height / pixelScale - label_h * .5;
                            if (intersects.boxBox(0, 0, width / args.pixelScale, height / pixelScale, label_x - 2.0 * shadow, label_y - 2.0 * shadow, label_w + 4.0 * shadow, label_h + 4.0 * shadow)) {
                                const lx = label_x, ly = label_y, lw = label_w, lh = label_h;
                                const img = icons.get(`MapIcons/${j.icon}`);
                                if (j.glow) {
                                    const old_filter = ctx.filter;
                                    ctx.filter = `brightness(0.5) sepia(1) hue-rotate(296deg) saturate(10000%) blur(${shadow}px)`; // blur(10px)
                                    ctx.drawImage(img, lx, ly, lw, lh);
                                    ctx.drawImage(img, lx, ly, lw, lh);
                                    ctx.drawImage(img, lx, ly, lw, lh);
                                    ctx.filter = old_filter;
                                } else ctx.drawImage(img, lx, ly, lw, lh);
                            }
                        }
                    }
                }

                drawIcons(overlayContext, args.coords, args.width, args.height, args.pixelScale, args.max_zoom, args.disabled_icons);

                const bitmap = overlay.transferToImageBitmap();
                postMessage(bitmap, null, [bitmap]);
                break;
            }
            case "text": {
                const args = context.arguments as {
                    coords: any,
                    max_zoom: any,
                    pixelScale: number,
                    size: { x: number, y: number },
                    sources: any
                    shadowSize: number
                    boring: boolean
                };

                function zoomScale(zoom, max_zoom): number {
                    return .65 * (1 + max_zoom - zoom);
                }

                const raw_scale = zoomScale(args.coords.z, args.max_zoom);
                const hd_ratio = args.pixelScale;

                const tile = new OffscreenCanvas(args.size.x * hd_ratio, args.size.y * hd_ratio);
                const ctx = tile.getContext('2d');

                const zoom = Math.pow(2, args.coords.z);
                const max = Math.pow(2, args.max_zoom);
                const sources = args.sources;
                let shadowSize = args.shadowSize;

                function controlToFont(control, ctx, boring_font) {
                    if (boring_font) {
                        switch (control) {

                            case 0:
                            case 1:
                            case 2:
                            case 3:

                                ctx.font = '70px "Renner"';
                                break;
                            case 4:
                                ctx.font = '90px "Renner"';
                                break;
                        }

                    } else
                        switch (control) {
                            case 0:
                                ctx.font = '54px "Roman"';
                                break;
                            case 1:
                                ctx.font = '60px "Celtic"';
                                break;
                            case 2:
                            case 3:
                                ctx.font = '50px "Italic"';
                                break;
                            case 4:
                                ctx.font = '80px "Italic"';
                                break;
                        }
                }

                function draw(boring: boolean, ctx: OffscreenCanvasRenderingContext2D) {
                    for (let i = 0; i < sources.length; i++) {
                        let j = sources[i];
                        if (args.coords.z >= j.zoomMin && args.coords.z < j.zoomMax) {

                            const scale = raw_scale * j.scale;
                            const text_scale = hd_ratio * scale * zoom / max;
                            const shadow = shadowSize * text_scale;
                            const label_w = j.size.width * zoom * scale * hd_ratio + shadow * 2;
                            const label_h = j.size.height * zoom * scale * hd_ratio + shadow * 2;
                            const label_x = j.x * zoom * hd_ratio - args.coords.x * tile.width - label_w * .5 - shadow;
                            const label_y = j.y * zoom * hd_ratio - args.coords.y * tile.height - label_h * .25 - shadow;

                            if (intersects.boxBox(0, 0, tile.width, tile.height, label_x, label_y, label_w, label_h)) {
                                ctx.setTransform(text_scale, 0, 0, text_scale, label_x + label_w * .5, label_y + label_h * .5);
                                controlToFont(j.control, ctx, boring);
                                ctx.shadowColor = "rgba(0, 0, 0, 1)";
                                ctx.shadowBlur = shadow;
                                ctx.fillStyle = j.color;
                                ctx.strokeStyle = j.color;
                                ctx.textAlign = 'center';
                                ctx.textBaseline = 'middle';
                                ctx.fillText(boring ? j.original_text : j.text, 0, 0);
                                ctx.fillText(boring ? j.original_text : j.text, 0, 0);
                                ctx.fillText(boring ? j.original_text : j.text, 0, 0);
                                ctx.fillText(boring ? j.original_text : j.text, 0, 0);
                                ctx.shadowColor = "rgba(0, 0, 0, 0)";
                                ctx.shadowBlur = 0;
                                ctx.setTransform(1, 0, 0, 1, 0, 0);
                            }
                        }

                    }
                }

                draw(args.boring, ctx);

                const bm = tile.transferToImageBitmap();
                postMessage(bm, null, [bm]);


                break;
            }
            default: // always return something
                postMessage(null, null);
        }
    } catch (e) {
        console.error(e);
    }
}