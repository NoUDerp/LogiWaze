#!/usr/bin/env node

var APIManager = require('./src/API.js').API;
const { createCanvas, loadImage } = require('canvas');
const yargs = require('yargs')(process.argv.slice(2));
const zlib = require('zlib');
const argv = yargs
    .option('output', {
        alias: 'o',
        description: 'Selects the output file',
        type: 'string',
    })
    .option('input', {
        alias: 'i',
        description: 'Input file (API state created from log.js) in .json.brotli'
    })
    .option('width', {
        alias: 'w',
        description: 'Output width',
        type: 'int'
    })
    .option('height', {
        alias: 'h',
        description: 'Output height',
        type: 'int'
    })
    .default('width', 256)
    .default('height', 256)
    .help()
    .demandOption(['output'])
    .argv;

var buf = require('fs').readFileSync(argv.input);
zlib.brotliDecompress(buf, (err, data) => {
    var api = JSON.parse(data);
    loadImage("map.png").then((b) => {
        var background = createCanvas(b.width, b.height);
        //console.log(background.width.toString().concat(',').concat(background.height.toString()));
        var ctx2 = background.getContext('2d', { pixelFormat: 'RGBA32' });
        ctx2.drawImage(b, 0, 0);
        var dd = ctx2.getImageData(0, 0, background.width, background.height);

        APIManager = Object.assign(APIManager, api);
        if (typeof (APIManager.variogram) == 'undefined') {
            // build the variogram

            var p_x = [], p_y = [], p_t = [];

            let maps = Object.keys(APIManager.mapControl);
            for (let mapName of maps) {
                var keys = Object.keys(APIManager.mapControl[mapName]);
                for (let key of keys) {
                    let j = APIManager.mapControl[mapName][key];
                    if (!j.nuked && j.control != "OFFLINE" && (j.mapIcon == 35 || (j.mapIcon >= 5 && j.mapIcon <= 10) || (j.mapIcon >= 45 && j.mapIcon <= 47) || j.mapIcon == 29)) {
                        p_x.push(j.x);
                        p_y.push(j.y);
                        p_t.push(j.control == "WARDENS" ? -1 : (j.control == "COLONIALS" ? 1 : 0));
                    }
                }
            }
            APIManager.variogram = require('@sakitam-gis/kriging').train(p_t, p_x, p_y, 'exponential', 0, 100);
        }
        else
            APIManager.variogram.model = (h, nugget, range, sill, A) => nugget + ((sill - nugget) / range) * (1.0 - Math.exp(-(1.0 / A) * (h / range)));

        var tile = createCanvas(argv.width, argv.height);
        var ctx = tile.getContext('2d', { pixelFormat: 'RGBA32' });

        var d = ctx.getImageData(0, 0, tile.width, tile.height);
        var colors = [{ r: 0.1372549019607843, g: 0.3372549019607843, b: 0.5137254901960784 }, { r: 0.3176470588235294, g: 0.4235294117647059, b: 0.2941176470588235 }];
        for (var y = 0, i = 0; y < tile.height; y++)
            for (x = 0; x < tile.width; x++) {
                //var scale = { x: grid.x + (c.x - 1) * hdrz, y: -(grid.y + (c.y - 1) * hdrz) }
                var v = APIManager.control(256 * x / (tile.width - 1), 256 * ((256 - y - 256) / (tile.height - 1)));
                if (v < 0) // fade from warden
                {
                    v++;
                    d.data[i++] = Math.floor(255 * (v * (1.0 - colors[0].r) + colors[0].r));
                    d.data[i++] = Math.floor(255 * (v * (.4 - colors[0].g) + colors[0].g));
                    d.data[i++] = Math.floor(255 * (v * (.2666 - colors[0].b) + colors[0].b));
                    d.data[i] = Math.floor(.5 * dd.data[i]);
                    i++;
                }
                else if (v > 0) // fade from colonial
                {
                    v = 1 - v;
                    d.data[i++] = Math.floor(255 * (v * (1.0 - colors[1].r) + colors[1].r));
                    d.data[i++] = Math.floor(255 * (v * (.4 - colors[1].g) + colors[1].g));
                    d.data[i++] = Math.floor(255 * (v * (.2666 - colors[1].b) + colors[1].b));
                    d.data[i] = Math.floor(.5 * dd.data[i]);
                    i++;
                }
            }

        ctx.putImageData(d, 0, 0);
        //ctx.fill();
        //const buffer = tile.toBuffer('image/png');
        const out = require("fs").createWriteStream(argv.output);
        tile.createPNGStream().pipe(out);
        //background.createPNGStream().pipe(out);
    }).catch((err) => { console.log(err); });
});
