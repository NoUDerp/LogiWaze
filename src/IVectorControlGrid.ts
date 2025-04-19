//@ts-nocheck
import * as L from 'leaflet';
import * as intersects from 'intersects';
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
    //semaphore: Queue<Worker> = new Queue<Worker>()
    renderers: Queue<Worker> = new Queue<Worker>()
    imageCache: ImageCache = new ImageCache()

    zoomScale(zoom): number {
        return .65 * (1 + this.max_zoom - zoom);
    }

    // temporarily disabled: window.devicePixelRatio,
    static drawHex(tile, ctx, x, y, w, h, scale) {
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


    static fillHex(tile, ctx, x, y, w, h) {
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

    drawBorders(c, ctx) {
        let coords = c.coords;

        let tile = c.tile;

        const zoom = Math.pow(2, coords.z);
        const lineWidth = .2 * Math.pow(2, coords.z);
        const shadow = lineWidth * .5 / Math.pow(2, c.t.max_zoom);

        ctx.save();
        ctx.strokeStyle = '#303030';
        ctx.opacity = .8;
        ctx.scale(c.t.pixelScale, c.t.pixelScale);

        for (let j of c.t.hex_sources) {
            const label_w = j.size.width * zoom + shadow * 2;
            const label_h = j.size.height * zoom + shadow * 2;
            const label_x = j.x * zoom - coords.x * tile.width / c.t.pixelScale - label_w - shadow;
            const label_y = j.y * zoom - coords.y * tile.height / c.t.pixelScale - label_h - shadow;
            if (intersects.boxBox(0, 0, tile.width, tile.height, label_x, label_y, label_w, label_h))
                VectorControlGridPrototype.drawHex(c.tile, c.ctx, label_x + label_w * .5,
                    label_y + label_h * .5,
                    label_w * .5,
                    label_h * .5,
                    lineWidth
                );
        }

        ctx.restore();
    }


    drawValidRegions(tile: HTMLImageElement, ctx: CanvasRenderingContext2D, coords, pixelScale: number, max_zoom: number, hex_sources) {
        const zoom = Math.pow(2, coords.z);
        const lineWidth = Math.pow(2, coords.z);
        const shadow = lineWidth * .5 / Math.pow(2, max_zoom);
        ctx.save();
        ctx.fillStyle = '#FFFFFFFF';
        ctx.strokeStyle = '#FFFFFFFF';
        ctx.scale(pixelScale, pixelScale);
        for (let j of hex_sources) {
            if (!j.offline) {
                const label_w = j.size.width * zoom + shadow * 2;
                const label_h = j.size.height * zoom + shadow * 2;
                const label_x = j.x * zoom - coords.x * tile.width / pixelScale - label_w - shadow;
                const label_y = j.y * zoom - coords.y * tile.height / pixelScale - label_h - shadow;
                if (intersects.boxBox(0, 0, tile.width, tile.height, label_x, label_y, label_w, label_h))
                    VectorControlGridPrototype.fillHex(tile, ctx, label_x + label_w * .5, label_y + label_h * .5, label_w * .5, label_h * .5, lineWidth);
            }
        }
        ctx.restore();
    }

    drawInvalidRegions(tile: HTMLImageElement, ctx, coords, pixelScale: number, max_zoom: number, hex_sources) {
        const zoom = Math.pow(2, coords.z);
        const lineWidth = Math.pow(2, coords.z);
        const shadow = lineWidth * .5 / Math.pow(2, max_zoom);
        ctx.save();
        ctx.fillStyle = '#000000FF';
        ctx.strokeStyle = '#000000FF';
        for (let j of hex_sources) if (j.offline) {
            const label_w = j.size.width * zoom + shadow * 2;
            const label_h = j.size.height * zoom + shadow * 2;
            const label_x = j.x * zoom - coords.x * tile.width / pixelScale - label_w - shadow;// / t.pixelScale    const
            const label_y = j.y * zoom - coords.y * tile.height / pixelScale - label_h - shadow;

            if (intersects.boxBox(0, 0, tile.width, tile.height, label_x, label_y, label_w, label_h))
                VectorControlGridPrototype.fillHex(tile, ctx, label_x + label_w * .5, label_y + label_h * .5, label_w * .5, label_h * .5, lineWidth);
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
        const i = await this.loadTile(c);
        this.drawTileToContext(c, i, c.ctx);
        await this.renderRoads(c);
    }

    async loadTile(c): Promise<ImageBitmap> {
        c.ctx = c.tile.getContext('2d');
        await c.t.loadIcons(c);

        const scale = Math.pow(2, Math.max(0, c.coords.z - c.t.max_native_zoom));
        const response = await fetch(`Tiles/${Math.min(c.coords.z, c.t.max_native_zoom)}_${Math.floor(c.coords.x / scale)}_${Math.floor(c.coords.y / scale)}.webp${c.t.build}`);
        const imageBlob = await response.blob();
        return await createImageBitmap(imageBlob);
        //
        // return new Promise((resolve, reject) => {
        //
        //     async function fetchImageBitmap(url) {
        //         try {
        //             // Fetch the image from the URL
        //             const response = await fetch(url);
        //
        //             // Check if the fetch was successful
        //             if (!response.ok) {
        //                 throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
        //             }
        //
        //             // Get the image data as a blob
        //             const imageBlob = await response.blob();
        //
        //             // Convert the blob to an ImageBitmap
        //             const imageBitmap = await createImageBitmap(imageBlob);
        //
        //             return imageBitmap;
        //         } catch (error) {
        //             console.error('Error fetching image:', error);
        //             throw error;
        //         }
        //     }
        //
        //     const img = new Image();
        //     const scale = Math.pow(2, Math.max(0, c.coords.z - c.t.max_native_zoom));
        //     img.onload = () => resolve(img);
        //     img.src = `Tiles/${Math.min(c.coords.z, c.t.max_native_zoom)}_${Math.floor(c.coords.x / scale)}_${Math.floor(c.coords.y / scale)}.webp${c.t.build}`;
        // });
    }

    drawTileToContext(c, img: ImageBitmap, ctx) {
        const scale = Math.pow(2, Math.max(0, c.coords.z - c.t.max_native_zoom));
        const ox = c.coords.x % scale;
        const oy = c.coords.y % scale;
        const bx = img.width / scale;
        const by = img.height / scale;
        ctx.drawImage(img, bx * ox, by * oy, bx, by, 0, 0, c.tile.width, c.tile.height);
        img.close();
    }

    async renderControlToTempCanvas(c) {
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

        let data: ImageBitmap;
        const w = await this.renderers.dequeue();
        try {
            data = await new Promise<ImageBitmap>((resolve, reject) => {
                w.onmessage = async e => {
                    this.renderers.enqueue(w);
                    resolve(e.data);
                };
                w.postMessage({
                    operation: "control",
                    arguments: [c.temp_canvas.width, c.temp_canvas.height, hdRatio, grid.x, grid.y]
                });
            });
        } catch (error) {
            this.renderers.enqueue(w);
        }
        const tempctx = c.temp_ctx as CanvasRenderingContext2D;
        tempctx.drawImage(data, 0, 0);
        data.close();
    }

    async renderRoads(c) {
        await this.renderControlToTempCanvas(c);
        if (c.temp_canvas != null) {
            let overlay = document.createElement("canvas");
            overlay.width = c.tile.width;
            overlay.height = c.tile.height;
            let overlay_ctx = overlay.getContext('2d');
            overlay_ctx.save();
            c.t.drawValidRegions(overlay, overlay_ctx, c.coords, c.t.pixelScale, c.t.max_zoom, c.t.hex_sources);
            overlay_ctx.restore();
            overlay_ctx.save();
            overlay_ctx.globalCompositeOperation = 'source-atop'; // mask the alpha to overlay the control layer, copy it to temporary storage
            overlay_ctx.imageSmoothingQuality = 'low'; // highest performance possible for a copy, no smoothing needed
            overlay_ctx.drawImage(c.temp_canvas, 1, 1, c.temp_canvas.width - 2, c.temp_canvas.height - 2, 0, 0, c.tile.width, c.tile.height);
            overlay_ctx.restore();
            overlay_ctx.save();
            overlay_ctx.scale(c.t.pixelScale, c.t.pixelScale);
            c.t.drawInvalidRegions(overlay, overlay_ctx, c.coords, c.t.pixelScale, c.t.max_zoom, c.t.hex_sources);
            overlay_ctx.restore();
            c.ctx.save();
            c.ctx.globalCompositeOperation = 'source-atop';
            c.ctx.globalAlpha = .5;
            c.ctx.drawImage(overlay, 0, 0);
            c.ctx.restore();
            delete c.temp_canvas;
        }

        const u = this;
        return new Promise((resolve, reject) => {
            setTimeout(async () => {
                try {
                    c.ctx.save();
                    c.ctx.scale(c.t.pixelScale, c.t.pixelScale);
                    await c.t.drawRoads(c);

                    c.ctx.restore();
                    if (c.t.drawHexes)
                        u.drawBorders(c, c.ctx);

                    c.ctx.save();
                    c.ctx.scale(c.t.pixelScale, c.t.pixelScale);

                    await c.t.drawIcons(c);
                    c.ctx.restore();
                    resolve();

                } catch (error) {
                    reject(error);
                }
            });
        });
    }


    async drawRoads(c) {
        await this.waitForRoadInitialization;

        const w = await this.renderers.dequeue();

        const args = {
            coords: c.coords,
            grid_depth: c.t.grid_depth,
            offset: c.t.offset,
            roadWidth: c.t.RoadWidth,
            controlWidth: c.t.ControlWidth,
            grid_x_size: c.t.grid_x_size,
            grid_y_size: c.t.grid_y_size,
            controls: c.t.controls,
            pixelScale: c.t.pixelScale,
            width: c.tile.width,
            height: c.tile.height
        };

        function logImageBitmap(imageBitmap) {
            // Create a canvas
            const canvas = document.createElement('canvas');
            canvas.width = imageBitmap.width;
            canvas.height = imageBitmap.height;

            // Draw the ImageBitmap
            const ctx = canvas.getContext('2d');
            ctx.drawImage(imageBitmap, 0, 0);

            // Get data URL
            const dataURL = canvas.toDataURL('image/png');
            console.log(dataURL);

            // // For browsers that support displaying images in console
            // console.log('%c ', `
            //     font-size: 1px;
            //     padding: ${imageBitmap.height}px ${imageBitmap.width}px;
            //     background: url(${dataURL}) no-repeat;
            //     background-size: contain;
            //   `);

            return dataURL;
        }

        w.onmessage = async e => {
            this.renderers.enqueue(w);
            const bitmap = e.data.bitmap as ImageBitmap;
            const ctx = c.ctx as CanvasRenderingContext2D;
            ctx.save();
            ctx.globalCompositeOperation = 'source-atop'; // mask the alpha to overlay the control layer, copy it to temporary storage
            ctx.imageSmoothingQuality = 'low'; // highest performance possible for a copy, no smoothing needed
            ctx.drawImage(bitmap, 0, 0);
            bitmap.close();
            ctx.restore();
        };

        w.postMessage({operation: "roads", arguments: args});
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

    road_sources: any[] = []

    constructor(MaxNativeZoom: number, MaxZoom: number, Offset, API: API, RoadWidth: number, ControlWidth: number, GridDepth: number) {
        super(MaxNativeZoom);
        this.updateWhenZooming = false;
        this.noWrap = true;
        this.maxZoom = MaxZoom;
        this.minZoom = 0;

        const size = this.getTileSize();

        this.RoadWidth = RoadWidth;
        this.ControlWidth = ControlWidth;
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

        for (let x = 0; x < this.grid_x_size; x++) {
            this.road_sources.push([]);
            for (let y = 0; y < this.grid_y_size; y++)
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
                        addLine(x, y, p, options, this, this.Offset);

        };

        this.waitForRoadInitialization = new Promise<void>((resolve) => {
            this.roadsReady = () => {
                // queue workers for processing control, it will also act as a semaphore
                for (let i = 0; i < navigator.hardwareConcurrency; i++) {
                    const w = new Worker(new URL('TileRenderWorker.ts', import.meta.url), {type: 'module'});
                    // initialize the worker data
                    w.postMessage({
                        operation: "initialize", arguments: {
                            roads: this.road_sources,
                            variogram:
                                {
                                    t: API.variogram.t,
                                    x: API.variogram.x,
                                    y: API.variogram.y,
                                    nugget: API.variogram.nugget,
                                    range: API.variogram.range,
                                    sill: API.variogram.sill,
                                    A: API.variogram.A,
                                    n: API.variogram.n,
                                    K: API.variogram.K,
                                    M: API.variogram.M,
                                }
                        }
                    });
                    this.renderers.enqueue(w);
                }
                resolve();
            }
        });

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