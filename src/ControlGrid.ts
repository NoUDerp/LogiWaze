//@ts-nocheck
import * as L from 'leaflet';
import * as intersects from 'intersects';
import Queue from "./Queue";
import API from "./API";
import {control} from "./TileRenderWorker";
import assets from "./MapIcons";
//import TileRenderWorker from 'data-url:../dist/TileRenderWorker.js';
//import TileRenderWorker from 'data-url:./workers/TileRenderWorker.js';

export default class ControlGrid extends L.GridLayer {
    controls: [] = [true, true, true, true]
    quality: Boolean = true
    draw: Boolean = true
    drawHexes: Boolean = true
    shadowSize: number = 20
    pixelScale: number = 1
    disabledIcons: {} = {}
    public renderers: Queue<Worker> = new Queue<Worker>()


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

    disableIcons(icons) {
        for (let i of icons) this.disabledIcons[i] = true;
    }

    enableIcons(icons) {
        for (let i of icons) delete this.disabledIcons[i];
    }

    downloadFont(imageUrl): Promise<ArrayBuffer> {
        return assets.get(imageUrl);
        // const response = await fetch(imageUrl);
        // if (!response.ok)
        //     throw new Error(`Failed to fetch image (${imageUrl}): ${response.status} ${response.statusText}`);
        // const length = response.headers.get('content-length');
        // const buffer = new Uint8ClampedArray(length);
        // buffer.set(new Uint8Array(await response.arrayBuffer()));
        // return buffer.buffer;
    }

    async prepareIcons(icon_sources): Map<string, Promise<ArrayBuffer>> {
        const m = new Map<string, Promise<ArrayBuffer>>();

        for (let j of icon_sources)
            if (j.icon != null && !(j.icon in this.disabledIcons)) {
                const filename = `MapIcons/${j.icon}`;
                if (!m.has(filename))
                    m.set(filename, await assets.get(j.icon));// this.downloadImage(filename));
            }

        await Promise.all(m.values());
        return m;
    }

    renderer(c, coords): any {
        const tile = L.DomUtil.create('canvas', 'leaflet-tile');
        const size = c.t.getTileSize();
        tile.width = size.x * c.t.pixelScale;
        tile.height = size.y * c.t.pixelScale;
        tile.style.width = `${tile.width}px`;
        tile.style.height = `${tile.height}px`;
        setTimeout(async () => {
            await this.render(c, coords, tile);
            c.done(null, tile);
        }, 0);
        return tile;
    }

    async render(c, coords, tile: HTMLCanvasElement) {
        const loadTile = this.loadTile(c, coords, tile);
        const renderOverlay = this.renderControlToTempCanvas(c, coords, tile);
        await Promise.all([loadTile, renderOverlay]);

        const i = await loadTile;
        this.drawTileToContext(tile, c.coords, c.t.max_native_zoom, i, c.ctx);

        const overlay = await renderOverlay;
        const tileContext = c.ctx;
        tileContext.drawImage(overlay, 0, 0);
        overlay.close();
    }

    loadTile(c, coords, tile: HTMLCanvasElement): Promise<ImageBitmap> {
        c.ctx = tile.getContext('2d');
        const z = coords.z;
        const scale = Math.pow(2, Math.max(0, z - c.t.max_native_zoom));
        if (z != Math.floor(z))
            throw "Zoom is not a whole number";
        const filename = `Tiles/${Math.min(z, c.t.max_native_zoom)}_${Math.floor(coords.x / scale)}_${Math.floor(coords.y / scale)}.webp`;
        //const response = await fetch(filename);
        //const key = `${Math.min(z, c.t.max_native_zoom)}_${Math.floor(coords.x / scale)}_${Math.floor(coords.y / scale)}`;
        return new Promise(resolve => {
            const im = new Image();
            im.onload = () => {
                const cv = new OffscreenCanvas(im.width, im.height);
                const ctx = cv.getContext('2d');
                ctx.drawImage(im, 0, 0);
                //const blob = new Blob([fetch()], {type: "image/webp"});//mimeType});
                resolve(cv.transferToImageBitmap());// await createImageBitmap(blob));
            }
            im.src = filename;
        });
        //const blob = new Blob([tiles.get(key)], {type: "image/webp"});//mimeType});
    }

    drawTileToContext(tile: HTMLCanvasElement, coords, max_native_zoom: number, img: ImageBitmap, ctx: CanvasRenderingContext2D
    ) {
        const z = coords.z;
        const scale = Math.pow(2, Math.max(0, z - max_native_zoom));
        const ox = coords.x % scale;
        const oy = coords.y % scale;
        const bx = img.width / scale;
        const by = img.height / scale;
        ctx.drawImage(img, bx * ox, by * oy, bx, by, 0, 0, tile.width, tile.height);
        img.close();
    }

    static renderControl(renderers: Queue<Worker> | null, c, coords, tile, disabledIcons, drawHexes, draw, controls, road_sources, variogram, icons, icon_sources): Promise<ImageBitmap> {
        c.hd_ratio = 8; // c.coords.z < 2 ? 8 : 16;
        const cTempCanvasWidth = 2 + tile.width / c.t.pixelScale / c.hd_ratio;
        const cTempCanvasHeight = 2 + tile.height / c.t.pixelScale / c.hd_ratio;
        const max = Math.pow(2, c.t.max_zoom - c.coords.z);
        const zoom = Math.pow(2, c.coords.z);
        const hdRatio = c.hd_ratio / zoom;
        const grid = {x: c.coords.x * max, y: c.coords.y * max};
        if (renderers)
            return new Promise<ImageBitmap>(async (resolve) => {
                const w = await renderers.dequeue();
                w.onmessage = async e => {
                    renderers.enqueue(w);
                    resolve(e.data);
                };
                w.postMessage({
                    operation: "control",
                    arguments: [cTempCanvasWidth, cTempCanvasHeight, hdRatio, grid.x, grid.y,
                        {
                            coords: coords,
                            grid_depth: c.t.grid_depth,
                            offset: c.t.offset,
                            roadWidth: c.t.RoadWidth,
                            controlWidth: c.t.ControlWidth,
                            grid_x_size: c.t.grid_x_size,
                            grid_y_size: c.t.grid_y_size,
                            controls: c.t.controls,
                            pixelScale: c.t.pixelScale,
                            width: tile.width,
                            height: tile.height,
                            max_zoom: c.t.max_zoom,
                            hex_sources: c.t.hex_sources,
                            disabled_icons: disabledIcons,
                            drawBorders: drawHexes,
                            drawControl: draw,
                            drawRoads: controls
                        }]
                });
            });

        return control([cTempCanvasWidth, cTempCanvasHeight, hdRatio, grid.x, grid.y,
            {
                coords: coords,
                grid_depth: c.t.grid_depth,
                offset: c.t.offset,
                roadWidth: c.t.RoadWidth,
                controlWidth: c.t.ControlWidth,
                grid_x_size: c.t.grid_x_size,
                grid_y_size: c.t.grid_y_size,
                controls: c.t.controls,
                pixelScale: c.t.pixelScale,
                width: tile.width,
                height: tile.height,
                max_zoom: c.t.max_zoom,
                hex_sources: c.t.hex_sources,
                disabled_icons: disabledIcons,
                drawBorders: drawHexes,
                drawControl: draw,
                drawRoads: controls
            }], road_sources, variogram, icons, icon_sources);
    }

    renderControlToTempCanvas(c, coords, tile: HTMLCanvasElement) {
        return ControlGrid.renderControl(this.webWorkers ? this.renderers : null, c, c.coords, tile, this.disabledIcons, this.drawHexes, this.draw, this.controls, this.road_sources, this.API.variogram, this.icons, this.icon_sources);
    }

    logImageBitmap(imageBitmap) {
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

    override

    public override createTile(coords, done): HTMLElement {

        let scale = Math.pow(2, coords.z);
        if (coords.x < 0 || coords.x >= scale || coords.y < 0 || coords.y >= scale || coords.z < 0) {
            let t = L.DomUtil.create('canvas', 'leaflet-tile');
            let size = this.getTileSize();
            t.width = this.pixelScale * size.x;
            t.height = this.pixelScale * size.y;
            t.style.width = `${t.width}.5px`;
            t.style.height = `${t.height}.5px`;

            setTimeout(() => done(null, t), 0);
            return t;
        }


        return this.renderer({t: this, coords: coords, done: done}, coords);//, 1);
    }

    road_sources: any[] = []
    icon_sources: any[] = []
    webWorkers: boolean

    static copyImageDataBuffer(originalBitmap: ArrayBuffer): ArrayBuffer {
        const buffer = new Uint8ClampedArray(originalBitmap.byteLength);
        buffer.set(new Uint8ClampedArray(originalBitmap));
        return buffer.buffer;
    }

    async prepare(API: API) {

        const fonts = {
            Celtic: this.downloadFont('Celtic.woff2'),
            Roman: this.downloadFont('Roman.woff2'),
            Italic: this.downloadFont('Italic.woff2'),
            Renner: this.downloadFont('Renner.ttf')
        };

        const iconsTask = this.prepareIcons(this.icon_sources);
        await Promise.all([fonts.Celtic, fonts.Roman, fonts.Italic, fonts.Renner, iconsTask]);
        const icons = await iconsTask;

        // queue workers for processing control, it will also act as a semaphore
        const tasks = [];

        for (let i = 0; i < navigator.hardwareConcurrency; i++)
            tasks.push(ControlGrid.createWorker(this.renderers, this.road_sources, this.icon_sources, icons, fonts, API));

        await Promise.all(tasks);
        this.webWorkers = await tasks.map(async (x) => await x != null).reduce((o, n) => o && n);
        if (!this.webWorkers) {
            async function createImage(data: ArrayBuffer) {
                return await createImageBitmap(new Blob([data], {type: 'image/webp'}));
            }

            this.icons = new Map<string, ImageBitmap>();
            for (const [name, data] of icons)
                if (name.startsWith('MapIcons/'))
                    this.icons.set(name, createImage(data));

            await Promise.all(Array.from(this.icons.values()));
        }
    }

    icons: Map<string, ImageBitmap> | null = null;


    static createWorker(renderers, road_sources, icon_sources, icons: Map<string, ImageBitmap>, fonts, API) {
        return new Promise<Worker | null>(async (resolve) => {
            try {
                // Create a URL for the Blob
                //const ab = await fetch();//, {type: 'module'});//TileRenderWorker);
                // const blob = new Blob([await (await fetch(TileRenderWorker)).arrayBuffer()], {type: 'application/javascript'});
                // const workerUrl = URL.createObjectURL(blob);
                // const w = new Worker(workerUrl);//, {type: 'module', name: 'Tile Renderer'});

                const w = new Worker(new URL('./TileRenderWorker', import.meta.url), {
                    type: 'module',
                    name: 'Tile Renderer'
                });

                // initialize the worker data
                const workerIcons = [];
                for (const [name, data] of icons)
                    workerIcons.push(
                        {
                            data: ControlGrid.copyImageDataBuffer(await data),
                            name: name,
                        });

                const fontsCache = {
                    Celtic: ControlGrid.copyImageDataBuffer(await fonts.Celtic),
                    Roman: ControlGrid.copyImageDataBuffer(await fonts.Roman),
                    Italic: ControlGrid.copyImageDataBuffer(await fonts.Italic),
                    Renner: ControlGrid.copyImageDataBuffer(await fonts.Renner)
                };

                w.onmessage = async e => {
                    if (e.data === "ok") {
                        renderers.enqueue(w);
                        resolve(w);
                    } else throw "Error loading worker";
                };

                const transfers = [Array.from(workerIcons.map(i => i.data)), fontsCache.Celtic, fontsCache.Roman, fontsCache.Renner, fontsCache.Italic].flat();

                w.postMessage({
                        operation: "initialize", arguments: {
                            roads: road_sources,
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
                                },
                            icons: workerIcons,
                            icon_sources: icon_sources,
                            fonts: fontsCache
                        }
                    },
                    transfers);
            } catch (error) {
                console.error(error);
                resolve(null);
            }
        });
    }


    public addIcon(icon, x, y, glow, zoomMin, zoomMax) {
        this.icon_sources.push(
            {
                size: {
                    width: .5,
                    height: .5
                },
                x: x + this.offset[0],
                y: -(y + this.offset[1]) + 256,
                icon: icon,
                zoomMin: zoomMin,
                glow: glow,
                zoomMax: zoomMax,
                pendingLoad: 0
            });
    }

    private addLine(x, y, p, options) {
        if (x >= 0 && y >= 0 && x < this.grid_x_size && y < this.grid_y_size)
            this.road_sources[x][y].push({points: p, options: options});
    }

    public addRoad = (points, options) => {
        const max_road_width = Math.max(this.RoadWidth, this.ControlWidth);
        const max = Math.pow(2, this.grid_depth);
        const margin = max_road_width * max;

        const gx = 1.0 / this.grid_x_width;
        const gy = 1.0 / this.grid_y_height;
        const marginx = margin / this.grid_x_size;
        const marginy = margin / this.grid_y_size;


        const c = [[-points[0][0] - this.offset[1], points[0][1] - this.offset[0]], [-points[1][0] - this.offset[1], points[1][1] - this.offset[0]]];
        const p = [[c[0][0], c[0][1]], [c[1][0], c[1][1]]];

        let x1 = c[0][1] + this.offset[0];
        let y1 = c[0][0] + this.offset[1];
        let x2 = c[1][1] + this.offset[0];
        let y2 = c[1][0] + this.offset[1];

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
                    this.addLine(x, y, p, options);

    }

    addHex(x, y, width, height, offline) {

        this.hex_sources.push(
            {
                size: {
                    width: width,
                    height: height
                },
                x: x + this.offset[0] + width * .5,
                y: y + this.offset[1] + height * .5,
                offline: offline
            });
    }

    when(event_name, event_action) {
        switch (event_name) {
            case 'loaded':
                this.loaded_events.push(event_action);
                break;
            case 'unloaded':
                this.unloaded_events.push(event_action);
                break;
        }
    }

    constructor(MaxNativeZoom
                :
                number, MaxZoom
                :
                number, Offset, API
                :
                API, RoadWidth
                :
                number, ControlWidth
                :
                number, GridDepth
                :
                number
    ) {
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


        for (let x = 0; x < this.grid_x_size; x++) {
            this.road_sources.push([]);
            for (let y = 0; y < this.grid_y_size; y++)
                this.road_sources[x].push([]);
        }

        this.max_native_zoom = MaxNativeZoom;
        this.offset = Offset;
        this.API = API;

        this.icon_grid_x_size = Math.pow(2, MaxZoom);
        this.icon_grid_x_width = this.pixelScale * size.x / this.grid_x_size;
        this.icon_grid_y_size = Math.pow(2, MaxZoom);
        this.icon_grid_y_height = this.pixelScale * size.y / this.grid_y_size;

        this.hex_sources = [];

        this.loaded_events = [];
        this.unloaded_events = [];

        this.on('loading', () => {
            for (let i of this.unloaded_events) i();
        });

        this.on('load', () => {
            for (let i of this.loaded_events) i();
        });
    }
}