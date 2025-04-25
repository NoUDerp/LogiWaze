//@ts-nocheck
import L from 'leaflet';
import ControlGrid from "./ControlGrid";

function controlToFont(control, ctx, boring_font) {
    if (boring_font) {
        switch (control) {

            case 0:
            case 1:
            case 2:
            case 3:
                ctx.font = '70px Renner';
                break;
            case 4:
                ctx.font = '90px Renner';
                break;
        }

    } else
        switch (control) {
            case 0:
                ctx.font = '54px Roman';
                break;
            case 1:
                ctx.font = '60px Celtic';
                break;
            case 2:
            case 3:
                ctx.font = '50px Italic';
                break;
            case 4:
                ctx.font = '80px Italic';
                break;
        }
};

class TextGrid extends L.GridLayer {
    zoomScale(zoom) {
        return .65 * (1 + this.max_zoom - zoom);
    }

    renderers : Queue<Worker>
    constructor(options, workers : ControlGrid)
    {
        super(options);
        this.renderers = workers;
    }

    shadowSize: number = 20
    draw: boolean = true
    boring: boolean = true
    pixelScale: number = window.devicePixelRatio

    recalculateSizes() {
        const canvas = L.DomUtil.create('canvas', 'leaflet-tile');
        ctx = canvas.getContext('2d');
        for (let k of this.sources) {
            controlToFont(k.control, ctx, this.boring);
            const size = ctx.measureText(this.boring ? k.original_text : k.text);
            k.size = {
                width: (size.actualBoundingBoxRight - size.actualBoundingBoxLeft) / this.grid_x_size,
                height: (size.actualBoundingBoxAscent + size.actualBoundingBoxDescent) / this.grid_y_size
            };
        }
    }

    public override createTile(coords, done) {
        const hd_ratio = this.pixelScale;
        const size = this.getTileSize();
        let tile = null;
        tile = L.DomUtil.create('canvas', 'leaflet-tile logiwaze-text');
        tile.crossorigin = "Anonymous";
        tile.setAttribute("crossorigin", "Anonymous");

        tile.width = size.x * hd_ratio;
        tile.height = size.y * hd_ratio;
        tile.style.width = (size.x * hd_ratio).toString().concat("px");
        tile.style.height = (size.y * hd_ratio).toString().concat("px");

        if(!this.draw)
        {
            setTimeout(()=> done());
            return tile;
        }

        setTimeout(async() => {
            const w = await this.renderers.dequeue();
            const data = new Promise<ImageBitmap>((resolve) => {
                w.onmessage = async e => {
                    this.renderers.enqueue(w);
                    resolve(e.data);
                };
                w.postMessage({
                    operation: "text",
                    arguments: {
                        coords: coords,
                        max_zoom: this.max_zoom,
                        pixelScale: this.pixelScale,
                        size: size,
                        sources: this.sources,
                        shadowSize: this.shadowSize,
                        boring: this.boring
                    }
                });
            });
            const ctx = tile.getContext('2d');
            const image = await data;
            ctx.drawImage(image, 0, 0);
            image.close();

            done();
        }, 0);

        return tile;
    }
}

export function Create(MaxZoom, Offset, controlLayer : ControlGrid) {
    const u = new TextGrid({updateWhenZooming: false, noWrap: true}, controlLayer.renderers);
    const size = u.getTileSize();
    u.sources = [];
    u.max_zoom = MaxZoom;
    u.offset = Offset;
    u.grid_x_size = Math.pow(2, MaxZoom);
    u.grid_x_width = size.x / u.grid_x_size;
    u.grid_y_size = Math.pow(2, MaxZoom);
    u.grid_y_height = size.y / u.grid_y_size;
    u.Offset = Offset;
    const canvas = L.DomUtil.create('canvas', 'leaflet-tile');
    const ctx = canvas.getContext('2d');
    u.Offset = Offset;
    u.addText = (text, original_text, control, x, y, zoomMin, zoomMax, color, scale) => {
        controlToFont(control, ctx, u.boring);
        const size = ctx.measureText(u.boring ? original_text : text);
        u.sources.push(
            {
                size: {
                    width: (size.actualBoundingBoxRight - size.actualBoundingBoxLeft) / u.grid_x_size,
                    height: (size.actualBoundingBoxAscent + size.actualBoundingBoxDescent) / u.grid_y_size
                },
                text: text,
                original_text: original_text,
                x: x + Offset[0],
                y: -(y + Offset[1]) + 256,
                control: control,
                zoomMin: zoomMin,
                zoomMax: zoomMax,
                color: color,
                scale: scale == null ? 1 : scale
            });
    };
    const loaded_events = [];
    const unloaded_events = [];
    u.when = function (event_name, event_action) {
        switch (event_name) {
            case 'loaded':
                loaded_events.push(event_action);
                break;
            case 'unloaded':
                unloaded_events.push(event_action);
                break;
        }
    };
    u.on('loading', () => {
        for (let i of unloaded_events) i();
    });
    u.on('load', () => {
        for (let i of loaded_events) i();
    });
    return u;
}
