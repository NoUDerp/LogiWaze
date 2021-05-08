define(['leaflet', 'intersects'],
    function (L, intersects) {



        var VectorControlGridPrototype = L.GridLayer.extend({

            drawHex: (tile, ctx, x, y, w, h) => {
                ctx.beginPath();
                ctx.moveTo(x + w, y);
                ctx.lineTo(x + w * .5, y + h);
                ctx.lineTo(x - w * .5, y + h);
                ctx.lineTo(x - w, y);
                ctx.lineTo(x - .5 * w, y - h);
                ctx.lineTo(x + .5 * w, y - h);
                ctx.lineTo(x + w, y);
                ctx.fill();
            },

            hotzone: true,

            draw: true,

            createTile: function (coords, done) {
                var tile = L.DomUtil.create('canvas', 'leaflet-tile');
                var size = this.getTileSize();

                //tile.globalCompositeOperation =

                var hd_ratio = coords.z < 2 ? 8 : 16;


                tile.width = size.x;
                tile.height = size.y;

                var temp_canvas = L.DomUtil.create('canvas', '');
                temp_canvas.width = 2 + size.x / hd_ratio;
                temp_canvas.height = 2 + size.y / hd_ratio;

                if (!this.draw)
                    return tile;

                var u = this;

                var ctx = temp_canvas.getContext('2d');
                var max = Math.pow(2, this.max_zoom - coords.z);
                var zoom = Math.pow(2, coords.z);
                var hdrz = hd_ratio / zoom;
                var d = ctx.getImageData(0, 0, temp_canvas.width, temp_canvas.height);
                var grid = { x: coords.x * max, y: coords.y * max };
                var colors = [{ r: 0.1372549019607843, g: 0.3372549019607843, b: 0.5137254901960784 }, { r: 0.3176470588235294, g: 0.4235294117647059, b: 0.2941176470588235 }];

                var API = this.API;
                var drawHex = this.drawHex;
                var hotzone = this.hotzone;
                function draw(x, y, i) {
                    var start = Date.now();
                    if (hotzone)
                        for (var counter = 0; y < temp_canvas.height; y++, x = 0)
                            for (; x < temp_canvas.width; x++, counter++) {
                                if (counter > 16 && Date.now() - start > 3) {
                                    setTimeout(() => draw(x, y, i), 0);
                                    return;
                                }

                                var scale = { x: grid.x + (x - 1) * hdrz, y: -(grid.y + (y - 1) * hdrz) }
                                var v = API.control(scale.x, scale.y);
                                var t = (v + 1) * .5;

                                if (v < 0) // fade from warden
                                {
                                    v++;
                                    d.data[i++] = Math.floor(255 * (v * (1.0 - colors[0].r) + colors[0].r));
                                    d.data[i++] = Math.floor(255 * (v * (.4 - colors[0].g) + colors[0].g));
                                    d.data[i++] = Math.floor(255 * (v * (.2666 - colors[0].b) + colors[0].b));
                                    d.data[i++] = 255;
                                }
                                else if (v > 0) // fade from colonial
                                {
                                    v = 1 - v;
                                    d.data[i++] = Math.floor(255 * (v * (1.0 - colors[1].r) + colors[1].r));
                                    d.data[i++] = Math.floor(255 * (v * (.4 - colors[1].g) + colors[1].g));
                                    d.data[i++] = Math.floor(255 * (v * (.2666 - colors[1].b) + colors[1].b));
                                    d.data[i++] = 255;
                                }
                            }
                    else
                        for (var counter = 0; y < temp_canvas.height; y++, x = 0)
                            for (; x < temp_canvas.width; x++, counter++) {
                                if (counter > 16 && Date.now() - start > 3) {
                                    setTimeout(() => draw(x, y, i), 0);
                                    return;
                                }

                                var scale = { x: grid.x + (x - 1) * hdrz, y: -(grid.y + (y - 1) * hdrz) }
                                var v = API.control(scale.x, scale.y);
                                var t = (v + 1) * .5;
                                d.data[i++] = Math.floor(255 * (t * (colors[1].r - colors[0].r) + colors[0].r));
                                d.data[i++] = Math.floor(255 * (t * (colors[1].g - colors[0].g) + colors[0].g));
                                d.data[i++] = Math.floor(255 * (t * (colors[1].b - colors[0].b) + colors[0].b));
                                d.data[i++] = Math.floor(128 * Math.abs(v));
                            }

                    ctx.putImageData(d, 0, 0);

                    var ctx2 = tile.getContext('2d');

                    ctx2.save();
                    ctx2.fillStyle = '#fff';
                    ctx2.lineWidth = 1;
                    for (var j of u.sources) {
                        var label_w = j.size.width * zoom;
                        var label_h = j.size.height * zoom;
                        var label_x = j.x * zoom - coords.x * tile.width - label_w;
                        var label_y = j.y * zoom - coords.y * tile.height - label_h;

                        if (intersects.boxBox(0, 0, tile.width, tile.height, label_x, label_y, label_w, label_h))
                            drawHex(tile, ctx2, label_x + label_w * .5, label_y + label_h * .5, label_w * .5, label_h * .5);
                    }
                    ctx2.restore();

                    ctx2.globalCompositeOperation = 'source-in';
                    ctx2.save();
                    ctx2.imageSmoothingQuality = 'low';
                    ctx2.drawImage(temp_canvas, 1, 1, temp_canvas.width - 2, temp_canvas.height - 2, 0, 0, tile.width, tile.height);
                    ctx2.restore();

                    ctx.clearRect(0, 0, temp_canvas.width, temp_canvas.height);
                    delete ctx;
                    delete temp_canvas;

                    done(null, tile);
                }
                setTimeout(() => draw(0, 0, 0), 0);
                return tile;
            }

        });

        return {
            Create: (MaxZoom, Offset, API) => {
                var u = new VectorControlGridPrototype();
                var size = u.getTileSize();
                u.setOpacity(.5);
                u.sources = [];
                u.max_zoom = MaxZoom;
                u.offset = Offset;
                u.grid_x_size = Math.pow(2, MaxZoom);
                u.grid_x_width = size.x / u.grid_x_size;
                u.grid_y_size = Math.pow(2, MaxZoom);
                u.grid_y_height = size.y / u.grid_y_size;
                u.Offset = Offset;
                u.API = API;

                u.addHex = (x, y, width, height) => {
                    u.sources.push(
                        {
                            size: {
                                width: width * 2,
                                height: height * 2
                            },
                            x: x + Offset[0] + width,
                            y: y + Offset[1] + height
                        });
                };
                return u;
            }
        }
    });