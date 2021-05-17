#!/usr/bin/env node

const APIManager = require('./src/API.js').API;
const { createCanvas, loadImage } = require('canvas-prebuilt');
var shard = null;
const yargs = require('yargs')(process.argv.slice(2));

const argv = yargs
    .option('output', {
        alias: 'o',
        description: 'Selects the output file',
        type: 'string',
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

APIManager.update(function () {
    setTimeout(function () {
        var tile = createCanvas(argv.width, argv.height);
        var ctx = tile.getContext('2d', { pixelFormat: 'RGBA32' });

        var d = ctx.getImageData(0, 0, tile.width, tile.height);
        var colors = [{ r: 0.1372549019607843, g: 0.3372549019607843, b: 0.5137254901960784 }, { r: 0.3176470588235294, g: 0.4235294117647059, b: 0.2941176470588235 }];
        for (var y = 0, i = 0; y < tile.height; y++)
            for (x = 0; x < tile.width; x++) {
                //var scale = { x: grid.x + (c.x - 1) * hdrz, y: -(grid.y + (c.y - 1) * hdrz) }
                var v = APIManager.control(256 * x / argv.width, 256 * (((256 - y) - 256) / argv.height));
                if (v < 0) // fade from warden
                {
                    v++;
                    d.data[i++] = Math.floor(255 * (v * (1.0 - colors[0].r) + colors[0].r));
                    d.data[i++] = Math.floor(255 * (v * (.4 - colors[0].g) + colors[0].g));
                    d.data[i++] = Math.floor(255 * (v * (.2666 - colors[0].b) + colors[0].b));
                    d.data[i++] = 128;
                }
                else if (v > 0) // fade from colonial
                {
                    v = 1 - v;
                    d.data[i++] = Math.floor(255 * (v * (1.0 - colors[1].r) + colors[1].r));
                    d.data[i++] = Math.floor(255 * (v * (.4 - colors[1].g) + colors[1].g));
                    d.data[i++] = Math.floor(255 * (v * (.2666 - colors[1].b) + colors[1].b));
                    d.data[i++] = 128;
                }
            }

        ctx.putImageData(d, 0, 0);
        ctx.fill();
        //const buffer = tile.toBuffer('image/png');
        const out = require("fs").createWriteStream(argv.output);
        tile.createPNGStream().pipe(out);
    }, 0);
}, shard);

