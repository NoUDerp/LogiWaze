//@ts-nocheck
import * as L from 'leaflet';
import * as intersects from 'intersects';
import {default as CooperativeDelay} from './CooperativeDelay'
import Queue from "./Queue";
import API from "./API";

class ImageCache {
    private cache: Map<string, Promise<Image>> = new Map<string, Promise<Image>>()

    public GetImage(name: string): Promise<Image> {
        if (!this.cache.has(name))
            this.cache.set(name, new Promise(resolve => {
                const i = new Image();
                i.onload = () => resolve(i);
                i.src = name;
            }));
        return this.cache.get(name);
    }
}

export default class VectorControlGridPrototype extends L.GridLayer {
    controls: [] = [true, true, true, true]
    quality: Boolean = true
    draw: Boolean = true
    drawHexes: Boolean = true
    shadowSize: number = 20
    pixelScale: number = 1
    disabledIcons: {} = {}
    semaphore: Queue<Worker> = new Queue<Worker>()
    imageCache: ImageCache = new ImageCache()

    zoomScale(zoom): number {
        return .65 * (1 + this.max_zoom - zoom);
    }

    // temporarily disabled: window.devicePixelRatio,
    async drawHex(tile, ctx, x, y, w, h, scale) {
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


    async fillHex(tile, ctx, x, y, w, h, scale) {
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

    async drawBorders(c) {
        let coords = c.coords;

        let tile = c.tile;

        if (!c.t.drawHexes)
            return

        const zoom = Math.pow(2, coords.z);
        const u = this;
        const lineWidth = .2 * Math.pow(2, coords.z);
        const shadow = lineWidth * .5 / Math.pow(2, c.t.max_zoom);

        c.ctx.save();
        c.ctx.strokeStyle = '#303030';
        c.ctx.opacity = .8;
        c.ctx.scale(c.t.pixelScale, c.t.pixelScale);

        for (let j of c.t.hex_sources) {
            const label_w = j.size.width * zoom + shadow * 2;
            const label_h = j.size.height * zoom + shadow * 2;
            const label_x = j.x * zoom - coords.x * tile.width / c.t.pixelScale - label_w - shadow;
            const label_y = j.y * zoom - coords.y * tile.height / c.t.pixelScale - label_h - shadow;
            if (intersects.boxBox(0, 0, tile.width, tile.height, label_x, label_y, label_w, label_h))
                c.t.drawHex(c.tile, c.ctx, label_x + label_w * .5,
                    label_y + label_h * .5,
                    label_w * .5,
                    label_h * .5,
                    lineWidth
                );
        }

        c.ctx.restore();
    }


    async drawValidRegions(tile, ctx, coords, t) {
        const zoom = Math.pow(2, coords.z);
        const lineWidth = Math.pow(2, coords.z);
        const shadow = lineWidth * .5 / Math.pow(2, t.max_zoom);
        ctx.save();
        ctx.fillStyle = '#FFFFFFFF';
        ctx.strokeStyle = '#FFFFFFFF';
        ctx.scale(t.pixelScale, t.pixelScale);
        for (let j of t.hex_sources) {
            if (!j.offline) {
                const label_w = j.size.width * zoom + shadow * 2;
                const label_h = j.size.height * zoom + shadow * 2;
                const label_x = j.x * zoom - coords.x * tile.width / t.pixelScale - label_w - shadow;
                const label_y = j.y * zoom - coords.y * tile.height / t.pixelScale - label_h - shadow;
                if (intersects.boxBox(0, 0, tile.width, tile.height, label_x, label_y, label_w, label_h))
                    t.fillHex(tile, ctx, label_x + label_w * .5, label_y + label_h * .5, label_w * .5, label_h * .5, lineWidth);
            }
        }
        ctx.restore();
    }


    async drawInvalidRegions(tile, ctx, coords, t) {
        const zoom = Math.pow(2, coords.z);
        const lineWidth = Math.pow(2, coords.z);
        const shadow = lineWidth * .5 / Math.pow(2, t.max_zoom);
        ctx.save();
        ctx.fillStyle = '#000000FF';
        ctx.strokeStyle = '#000000FF';
        for (let j of t.hex_sources) if (j.offline) {
            const label_w = j.size.width * zoom + shadow * 2;
            const label_h = j.size.height * zoom + shadow * 2;
            const label_x = j.x * zoom - coords.x * tile.width / t.pixelScale - label_w - shadow;// / t.pixelScale    const
            const label_y = j.y * zoom - coords.y * tile.height / t.pixelScale - label_h - shadow;

            if (intersects.boxBox(0, 0, tile.width, tile.height, label_x, label_y, label_w, label_h))
                await t.fillHex(tile, ctx, label_x + label_w * .5, label_y + label_h * .5, label_w * .5, label_h * .5, lineWidth);
        }

        ctx.restore();
    }


    disableIcons(icons) {
        for (let i of icons) this.disabledIcons[i] = true;
    }


    enableIcons(icons) {
        for (let i of icons) delete this.disabledIcons[i];
    }


    async loadIcons(c): Promise<void> {
    }

    async drawIcons(c): Promise<void> {

        function makeRenderCallback(u, icon, ctx, img, lx, ly, lw, lh, tile, glow, shadow) {
            return function () {
                if (glow) {
                    ctx.filter = "brightness(0.5) sepia(1) hue-rotate(296deg) saturate(10000%) blur(".concat(shadow).concat("px)"); // blur(10px)
                    ctx.drawImage(img.image, lx, ly, lw, lh);
                    ctx.drawImage(img.image, lx, ly, lw, lh);
                    ctx.drawImage(img.image, lx, ly, lw, lh);
                    ctx.filter = "none";
                } else
                    ctx.drawImage(img.image, lx, ly, lw, lh);
                if (--tile.pendingLoad == 0) {
                    delete img.callbacks;
                }
            };
        }

        const raw_scale = c.t.zoomScale(c.coords.z);
        const zoom = Math.pow(2, c.coords.z);
        const max = Math.pow(2, c.t.max_zoom);
        c.tile.pendingLoad = 0;
        const shadowSize = 20;
        for (let j of c.t.icon_sources) {
            if (c.coords.z >= j.zoomMin && c.coords.z < j.zoomMax && j.icon != null && !(j.icon in c.t.disabledIcons)) {
                const scale = raw_scale;
                let shadow = j.glow ? shadowSize * scale * zoom / max : 0;
                const label_w = j.size.width * zoom * scale;
                const label_h = j.size.height * zoom * scale;
                const label_x = j.x * zoom - c.coords.x * c.tile.width / c.t.pixelScale - label_w * .5;
                const label_y = j.y * zoom - c.coords.y * c.tile.height / c.t.pixelScale - label_h * .5;
                if (intersects.boxBox(0, 0, c.tile.width / c.t.pixelScale, c.tile.height / c.t.pixelScale, label_x - 2.0 * shadow, label_y - 2.0 * shadow, label_w + 4.0 * shadow, label_h + 4.0 * shadow)) {
                    const lx = label_x, ly = label_y, lw = label_w, lh = label_h;
                    const img = await this.imageCache.GetImage(`MapIcons/${j.icon}`);
                    if (j.glow) {
                        c.ctx.save();
                        c.ctx.filter = "brightness(0.5) sepia(1) hue-rotate(296deg) saturate(10000%) blur(".concat(shadow).concat("px)"); // blur(10px)              
                        c.ctx.drawImage(img, lx, ly, lw, lh);
                        c.ctx.drawImage(img, lx, ly, lw, lh);
                        c.ctx.drawImage(img, lx, ly, lw, lh);
                        c.ctx
                            .restore();
                    } else c.ctx.drawImage(img, lx, ly, lw, lh);
                }
            }
        }
    }


    // This is too intense for now: window.devicePixelRatio,
    build: "";

    renderer(c): any {
        c.tile = L.DomUtil.create('canvas', 'leaflet-tile');
        const size = c.t.getTileSize();
        c.tile.width = size.x * c.t.pixelScale;
        c.tile.height = size.y * c.t.pixelScale;
        c.tile.style.width = c.tile.width.toString().concat('px');
        c.tile.style.height = c.tile.height.toString().concat('px');
        setTimeout(async () => {
            await this.render(c);
            c.done(null, c.tile);
        });
        return c.tile;
    }

    async render(c) {
        await this.renderer2phase1creation(c);
        await this.renderer2phase2(c);
        await this.renderer2phase3(c);
        await this.renderer2phase4(c);
        await this.renderer2phase5(c);
    }

    async renderer2phase1creation(c) {
        c.ctx = c.tile.getContext('2d');
        await c.t.loadIcons(c);
        return new Promise((resolve, reject) => {
            c.img = new Image();
            const scale = Math.pow(2, Math.max(0, c.coords.z - c.t.max_native_zoom));
            c.img.onload = () => resolve();
            c.img.src = `Tiles/${Math.min(c.coords.z, c.t.max_native_zoom)}_${Math.floor(c.coords.x / scale)}_${Math.floor(c.coords.y / scale)}.webp${c.t.build}`;
        });
    }

    async renderer2phase2(c) {
        return new Promise((resolve, reject) => {
            try {
                const scale = Math.pow(2, Math.max(0, c.coords.z - c.t.max_native_zoom));
                const ox = c.coords.x % scale;
                const oy = c.coords.y % scale;
                const bx = c.img.width / scale;
                const by = c.img.height / scale;
                setTimeout(() => {
                    c.ctx.drawImage(c.img, bx * ox, by * oy, bx, by, 0, 0, c.tile.width, c.tile.height);
                    delete c.img;
                    resolve();
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    async renderer2phase3(c) {
        const delay = new CooperativeDelay();

        c.hd_ratio = 8; // c.coords.z < 2 ? 8 : 16;
        c.temp_canvas = L.DomUtil.create('canvas', '');
        c.temp_canvas.width = 2 + c.tile.width / c.t.pixelScale / c.hd_ratio;
        c.temp_canvas.height = 2 + c.tile.height / c.t.pixelScale / c.hd_ratio;
        c.temp_ctx = c.temp_canvas.getContext('2d', {alpha: false});
        let x = 0;
        let y = 0;
        let i = 0;
        const max = Math.pow(2, c.t.max_zoom - c.coords.z);
        const zoom = Math.pow(2, c.coords.z);
        const hdRatio = c.hd_ratio / zoom;
        const grid = {x: c.coords.x * max, y: c.coords.y * max};

        let data: number[];
        let d = c.temp_ctx.getImageData(0, 0, c.temp_canvas.width, c.temp_canvas.height);
        const w = await this.semaphore.dequeue();
        try {
            data = await new Promise<ArrayBuffer>((resolve, reject) => {
                w.onmessage = async e => {
                    this.semaphore.enqueue(w);
                    resolve(e.data);
                };
                w.postMessage([c.temp_canvas.width, c.temp_canvas.height, hdRatio, grid.x, grid.y]);
            });
        } catch (error) {
            this.semaphore.enqueue(w);
        }

        d.data.set(new Uint8ClampedArray(data), 0);
        c.temp_ctx.putImageData(d, 0, 0);
    }

    async renderer2phase4(c) {
        return new Promise((resolve, reject) => {
            if (c.temp_canvas != null) {
                try {
                    let overlay = document.createElement("canvas");
                    overlay.width = c.tile.width;
                    overlay.height = c.tile.height;
                    setTimeout(() => {
                        try {
                            let overlay_ctx = overlay.getContext('2d');
                            overlay_ctx.save();
                            c.t.drawValidRegions(overlay, overlay_ctx, c.coords, c.t);
                            overlay_ctx.restore();
                            overlay_ctx.save();
                            overlay_ctx.globalCompositeOperation = 'source-atop'; // mask the alpha to overlay the control layer, copy it to temporary storage
                            overlay_ctx.imageSmoothingQuality = 'low'; // highest performance possible for a copy, no smoothing needed
                            overlay_ctx.drawImage(c.temp_canvas, 1, 1, c.temp_canvas.width - 2, c.temp_canvas.height - 2, 0, 0, c.tile.width, c.tile.height);
                            overlay_ctx.restore();
                            overlay_ctx.save();
                            overlay_ctx.scale(c.t.pixelScale, c.t.pixelScale);
                            c.t.drawInvalidRegions(overlay, overlay_ctx, c.coords, c.t);
                            overlay_ctx.restore();
                            c.ctx.save();
                            c.ctx.globalCompositeOperation = 'source-atop';
                            c.ctx.globalAlpha = .5;
                            c.ctx.drawImage(overlay, 0, 0);
                            c.ctx.restore();
                            delete c.temp_canvas;
                            resolve();
                        } catch (error) {
                            reject(error);
                        }
                    }, 0);
                } catch (error) {
                    reject(error);
                }
            } else resolve();
        });
    }

    async renderer2phase5(c) {
        return new Promise((resolve, reject) => {
            setTimeout(async () => {
                try {
                    c.ctx.save();
                    c.ctx.scale(c.t.pixelScale, c.t.pixelScale);
                    await c.t.drawRoads(c);

                    setTimeout(async () => {
                        c.ctx.restore();
                        await c.t.drawBorders(c);

                        setTimeout(async () => {
                            c.ctx.save();
                            c.ctx.scale(c.t.pixelScale, c.t.pixelScale);
                            await c.t.drawIcons(c);
                            setTimeout(() => {
                                c.ctx.restore();
                                resolve();
                            });
                        });
                    })
                } catch (error) {
                    reject(error);
                }
            });
        });
    }

    async drawRoads(c) {
        const coords = c.coords;
        let tile = c.tile;
        let ctx = c.ctx;

        ctx.lineJoin = 'miter';
        ctx.lineCap = 'round';

        const scale = Math.pow(2, c.t.grid_depth - coords.z);
        const start_x = Math.floor(coords.x * scale);
        const start_y = Math.floor(coords.y * scale);

        const end_x = Math.ceil((coords.x + 1) * scale);
        const end_y = Math.ceil((coords.y + 1) * scale);

        const depth_inverse = Math.pow(2, coords.z);
        const sources = c.t.road_sources;
        const offset = c.t.offset;
        const outerWidth = c.t.RoadWidth * depth_inverse;
        const innerWidth = c.t.ControlWidth * depth_inverse;
        const grid_x_size = c.t.grid_x_size;
        const grid_y_size = c.t.grid_y_size;
        const controls = c.t.controls;
        let pixelScale = c.t.pixelScale;

        function draw(i, start_x, start_y, end_x, end_y, x, y, step) {
            const startTime = Date.now();
            // if (step == 1) {
            //     /*if (quality) {
            //         var tiers = ['', '#957458', '#94954e', '#5a9565'];
            //         ctx.lineWidth = outerWidth;
            //         for (; y < end_y; y++, x = start_x)
            //             for (; x < end_x; x++, i = 0) {
            //
            //                 if (x >= 0 && y >= 0 && x < grid_x_size && y < grid_y_size) {
            //                     for (; i < sources[x][y].length; i++) {
            //
            //                         var j = sources[x][y][i];
            //                         ctx.strokeStyle = tiers[j.options.tier];
            //                         ctx.beginPath();
            //                         var coordsx = coords.x * tile.width / pixelScale;
            //                         var coordsy = coords.y * tile.height / pixelScale;
            //                         var x1 = (j.points[0][1] + offset[0]) * depth_inverse - coordsx;
            //                         var y1 = (j.points[0][0] + offset[1]) * depth_inverse - coordsy;
            //                         var x2 = (j.points[1][1] + offset[0]) * depth_inverse - coordsx;
            //                         var y2 = (j.points[1][0] + offset[1]) * depth_inverse - coordsy;
            //                         ctx.moveTo(x1, y1);
            //                         ctx.lineTo(x2, y2);
            //                         ctx.stroke();
            //                         if (Date.now() - startTime > 3) {
            //                             setTimeout(() => draw(i, start_x, start_y, end_x, end_y, x, y, step), 0);
            //                             return;
            //                         }
            //                     }
            //                 }
            //                 if (Date.now() - startTime > 3) {
            //                     setTimeout(() => draw(i, start_x, start_y, end_x, end_y, x, y, step), 0);
            //                     return;
            //                 }
            //             }
            //
            //     }*/
            //     // move to step 2, reset all starting values (only once)
            //     step = 2;
            //     x = start_x;
            //     y = start_y;
            //     i = 0;
            // }


            ctx.lineWidth = innerWidth;
            const colors = ['#516C4B', '#235683', '#303030', '#CCCC44'];

            for (; y <= end_y; y++, x = start_x)
                for (; x <= end_x; x++, i = 0)
                    if (x >= 0 && y >= 0 && x < grid_x_size && y < grid_y_size) {
                        for (; i < sources[x][y].length; i++) {
                            const j = sources[x][y][i];
                            if (controls[0]) {
                                ctx.strokeStyle = colors[j.options.control];
                                ctx.beginPath();
                                const coordsx = coords.x * tile.width / pixelScale;
                                const coordsy = coords.y * tile.height / pixelScale;
                                const x1 = (j.points[0][1] + offset[0]) * depth_inverse - coordsx;
                                const y1 = (j.points[0][0] + offset[1]) * depth_inverse - coordsy;
                                const x2 = (j.points[1][1] + offset[0]) * depth_inverse - coordsx;
                                const y2 = (j.points[1][0] + offset[1]) * depth_inverse - coordsy;
                                ctx.moveTo(x1, y1);
                                ctx.lineTo(x2, y2);
                                ctx.stroke();
                            }
                            if (Date.now() - startTime > 3) {
                                setTimeout(() => draw(i, start_x, start_y, end_x, end_y, x, y, step), 0);
                                return;
                            }
                        }
                        if (Date.now() - startTime > 3) {
                            setTimeout(() => draw(i, start_x, start_y, end_x, end_y, x, y, step), 0);
                            return;
                        }

                    }
            return;
        }

        draw(0, start_x, start_y, end_x, end_y, start_x, start_y, 1);
    }


    public calculateControl(c) {
        const start = Date.now();
        const max = Math.pow(2, c.t.max_zoom - c.coords.z);
        const zoom = Math.pow(2, c.coords.z);
        const hdRatio = c.hd_ratio / zoom;
        const grid = {x: c.coords.x * max, y: c.coords.y * max};
        const colors = [
            {r: 0.1372549019607843, g: 0.3372549019607843, b: 0.5137254901960784}, // warden
            {r: 0.3176470588235294, g: 0.4235294117647059, b: 0.2941176470588235} // colonial
        ];

        for (let counter = 0; c.y < c.temp_canvas.height; c.y++, c.x = 0) for (; c.x < c.temp_canvas.width; c.x++, counter++) {
            if (counter > 16 && Date.now() - start > 3) {
                setTimeout(() => c.t.calculateControl(c), 0);
                return;
            }
            const scale = {x: grid.x + (c.x - 1) * hdRatio, y: -(grid.y + (c.y - 1) * hdRatio)};
            let v = c.t.API.control(scale.x, scale.y);

            if (v < 0) // fade from warden
            {
                v++;
                c.d.data[c.i++] = Math.floor(255 * (v * (1.0 - colors[0].r) + colors[0].r));
                c.d.data[c.i++] = Math.floor(255 * (v * -colors[0].g + colors[0].g));
                c.d.data[c.i] = Math.floor(255 * (v * -colors[0].b + colors[0].b));
                c.i += 2;
            } else if (v > 0) // fade from colonial
            {
                v = 1 - v;
                c.d.data[c.i++] = Math.floor(255 * (v * (1.0 - colors[1].r) + colors[1].r));
                c.d.data[c.i++] = Math.floor(255 * (v * -colors[1].g + colors[1].g));
                c.d.data[c.i] = Math.floor(255 * (v * -colors[1].b + colors[1].b));
                c.i += 2;
            }
        }

        c.temp_ctx.putImageData(c.d, 0, 0);
        delete c.d;
    }

    override createTile(coords, done): HTMLElement {
        let scale = Math.pow(2, coords.z);
        if (coords.x < 0 || coords.x >= scale || coords.y < 0 || coords.y >= scale || coords.z < 0) {
            let t = L.DomUtil.create('canvas', 'leaflet-tile');
            let size = this.getTileSize();
            t.width = this.pixelScale * size.x;
            t.height = this.pixelScale * size.y;

            setTimeout(() => done(null, t), 0);
            return t;
        }


        return this.renderer({t: this, coords: coords, done: done});//, 1);
    }

    constructor(MaxNativeZoom: number, MaxZoom: number, Offset, API: API, RoadWidth: number, ControlWidth: number, GridDepth: number) {
        super(MaxNativeZoom);
        this.updateWhenZooming = false;
        this.noWrap = true;
        this.maxZoom = MaxZoom;
        this.minZoom = 0;

        // queue workers for processing control, it will also act as a semaphore
        for (let i = 0; i < navigator.hardwareConcurrency; i++) {
            const w = new Worker(new URL('ControlLayerThreadWorker.ts', import.meta.url), {type: 'module'});
            // initialize the worker data
            w.postMessage([API.variogram.t, API.variogram.x, API.variogram.y, API.variogram.nugget, API.variogram.range, API.variogram.sill, API.variogram.A, API.variogram.n, API.variogram.K, API.variogram.M]);
            this.semaphore.enqueue(w);
        }

        const size = this.getTileSize();

        this.RoadWidth = RoadWidth;
        this.ControlWidth = ControlWidth;
        this.road_sources = [];
        this.max_zoom = MaxZoom;
        this.grid_depth = GridDepth;
        this.offset = Offset;
        const max = Math.pow(2, GridDepth);
        this.grid_x_size = max;
        this.grid_x_width = (size.x / this.grid_x_size);
        this.grid_y_size = max;
        this.grid_y_height = (size.y / this.grid_y_size);

        const max_road_width = Math.max(RoadWidth, ControlWidth);

        const margin = max_road_width * max;

        for (var x = 0; x < this.grid_x_size; x++) {
            this.road_sources.push([]);
            for (var y = 0; y < this.grid_y_size; y++)
                this.road_sources[x].push([]);
        }

        const marginx = margin / this.grid_x_size;
        const marginy = margin / this.grid_y_size;

        const addLine = (x, y, p, options, u, Offset) => {
            if (x >= 0 && y >= 0 && x < u.grid_x_size && y < u.grid_y_size)
                u.road_sources[x][y].push({points: p, options: options});
        };

        const gx = 1.0 / this.grid_x_width;
        const gy = 1.0 / this.grid_y_height;

        this.addRoad = (points, options) => {

            const c = [[-points[0][0] - Offset[1], points[0][1] - Offset[0]], [-points[1][0] - Offset[1], points[1][1] - Offset[0]]];
            const p = [[c[0][0], c[0][1]], [c[1][0], c[1][1]]];

            let x1 = c[0][1] + Offset[0];
            let y1 = c[0][0] + Offset[1];
            let x2 = c[1][1] + Offset[0];
            let y2 = c[1][0] + Offset[1];

            const angle = Math.atan2(y2 - y1, x2 - x1);
            const ext_x = Math.cos(angle);
            const ext_y = Math.sin(angle);

            x1 -= ext_x * marginx;
            y1 -= ext_y * marginy;
            x2 += ext_x * marginx;
            y2 += ext_y * marginy;

            const start_tile_x = Math.floor(Math.min(x1, x2) * gx - marginx);
            const start_tile_y = Math.floor(Math.min(y1, y2) * gy - marginy);

            const end_tile_x = Math.floor(Math.max(x2, x1) * gx + marginx);
            const end_tile_y = Math.floor(Math.max(y2, y1) * gy + marginy);

            const width = this.grid_x_width + marginx * 2.0;
            const height = this.grid_y_height + marginy * 2.0;

            for (let x = start_tile_x; x <= end_tile_x; x++)
                for (let y = start_tile_y; y <= end_tile_y; y++)
                    if (intersects.lineBox(x1, y1, x2, y2, x * this.grid_x_width - marginx, y * this.grid_y_height - marginy, width, height))
                        addLine(x, y, p, options, this.Offset);

        };

        this.max_native_zoom = MaxNativeZoom;
        this.offset = Offset;
        this.Offset = Offset;
        this.API = API;

        this.icon_sources = [];
        this.icon_grid_x_size = Math.pow(2, MaxZoom);
        this.icon_grid_x_width = this.pixelScale * size.x / this.grid_x_size;
        this.icon_grid_y_size = Math.pow(2, MaxZoom);
        this.icon_grid_y_height = this.pixelScale * size.y / this.grid_y_size;

        //u.imageCache = {};

        this.addIcon = (icon, x, y, glow, zoomMin, zoomMax) => {
            this.icon_sources.push(
                {
                    size: {
                        width: .5,
                        height: .5
                    },
                    x: x + Offset[0],
                    y: -(y + Offset[1]) + 256,
                    icon: icon,
                    zoomMin: zoomMin,
                    glow: glow,
                    zoomMax: zoomMax,
                    pendingLoad: 0
                });
        };


        this.hex_sources = [];
        this.addHex = (x, y, width, height, offline) => {
            this.hex_sources.push(
                {
                    size: {
                        width: width,
                        height: height
                    },
                    x: x + Offset[0] + width * .5,
                    y: y + Offset[1] + height * .5,
                    offline: offline
                });
        };

        const loaded_events = [];
        const unloaded_events = [];
        this.when = function (event_name, event_action) {
            switch (event_name) {
                case 'loaded':
                    loaded_events.push(event_action);
                    break;
                case 'unloaded':
                    unloaded_events.push(event_action);
                    break;
            }
        };
        this.on('loading', () => {
            for (let i of unloaded_events) i();
        });
        this.on('load', () => {
            for (let i of loaded_events) i();
        });
    }
}