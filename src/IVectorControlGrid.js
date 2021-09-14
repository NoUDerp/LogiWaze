define(['leaflet', 'intersects'],
    function (L, intersects) {

        var VectorControlGridPrototype = L.GridLayer.extend({

            controls: [true, true, true, true],
            quality: true,
            draw: true,
            drawHexes: true,
            shadowSize: 20,
            disabledIcons: {},
            zoomScale: function (zoom) { return .65 * (1 + this.max_zoom - zoom); },
            shadowSize: 20,
            pixelScale: 1, // temporarily disabled: window.devicePixelRatio,
            drawHex: (tile, ctx, x, y, w, h, scale) => {
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
            },

            fillHex: (tile, ctx, x, y, w, h, scale) => {
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
            },

            drawBorders: function (c) {
                let coords = c.coords;

                let tile = c.tile;

                if (!c.t.drawHexes)
                    return tile;

                var zoom = Math.pow(2, coords.z);

                var u = this;
                var lineWidth = .2 * Math.pow(2, coords.z);
                var shadow = lineWidth * .5 / Math.pow(2, c.t.max_zoom);

                c.ctx.save();
                c.ctx.strokeStyle = '#303030';
                c.ctx.opacity = .8;
                c.ctx.scale(c.t.pixelScale, c.t.pixelScale);
                for (var j of c.t.hex_sources) {

                    var label_w = j.size.width * zoom + shadow * 2;
                    var label_h = j.size.height * zoom + shadow * 2;
                    var label_x = j.x * zoom - coords.x * tile.width / c.t.pixelScale - label_w - shadow;
                    var label_y = j.y * zoom - coords.y * tile.height / c.t.pixelScale - label_h - shadow;

                    if (intersects.boxBox(0, 0, tile.width, tile.height, label_x, label_y, label_w, label_h))
                        c.t.drawHex(c.tile, c.ctx, label_x + label_w * .5, label_y + label_h * .5, label_w * .5, label_h * .5, lineWidth);
                }
                c.ctx.restore();
            },

            drawValidRegions: function (tile, ctx, coords, t) {
                var zoom = Math.pow(2, coords.z);
                var lineWidth = 1 * Math.pow(2, coords.z);
                var shadow = lineWidth * .5 / Math.pow(2, t.max_zoom);
                ctx.save();
                ctx.fillStyle = '#FFFFFFFF';
                ctx.strokeStyle = '#FFFFFFFF';
                ctx.scale(t.pixelScale, t.pixelScale);
                for (var j of t.hex_sources) {
                    if (!j.offline) {
                        var label_w = j.size.width * zoom + shadow * 2;
                        var label_h = j.size.height * zoom + shadow * 2;
                        var label_x = j.x * zoom - coords.x * tile.width / t.pixelScale - label_w - shadow;
                        var label_y = j.y * zoom - coords.y * tile.height / t.pixelScale - label_h - shadow;
                        if (intersects.boxBox(0, 0, tile.width, tile.height, label_x, label_y, label_w, label_h))
                            t.fillHex(tile, ctx, label_x + label_w * .5, label_y + label_h * .5, label_w * .5, label_h * .5, lineWidth);
                    }
                }
                ctx.restore();
            },

            drawInvalidRegions: function (tile, ctx, coords, t) {
                var zoom = Math.pow(2, coords.z);
                var lineWidth = 1 * Math.pow(2, coords.z);
                var shadow = lineWidth * .5 / Math.pow(2, t.max_zoom);
                ctx.save();
                ctx.fillStyle = '#000000FF';
                ctx.strokeStyle = '#000000FF';
                for (var j of t.hex_sources)
                    if (j.offline) {
                        var label_w = j.size.width * zoom + shadow * 2;
                        var label_h = j.size.height * zoom + shadow * 2;
                        var label_x = j.x * zoom - coords.x * tile.width / t.pixelScale - label_w - shadow;// / t.pixelScale
                        var label_y = j.y * zoom - coords.y * tile.height / t.pixelScale - label_h - shadow;
                        if (intersects.boxBox(0, 0, tile.width, tile.height, label_x, label_y, label_w, label_h))
                            t.fillHex(tile, ctx, label_x + label_w * .5, label_y + label_h * .5, label_w * .5, label_h * .5, lineWidth);
                    }
                ctx.restore();
            },

            disableIcons: function (icons) {
                for (var i of icons)
                    this.disabledIcons[i] = true;
            },

            enableIcons: function (icons) {
                for (var i of icons)
                    delete this.disabledIcons[i];
            },

            loadIcons: function (c) {
                var raw_scale = c.t.zoomScale(c.coords.z);
                var zoom = Math.pow(2, c.coords.z);
                var max = Math.pow(2, c.t.max_zoom);
                c.pendingLoad = 0;
                const shadowSize = 20;
                for (var j of c.t.icon_sources) {
                    if (c.coords.z >= j.zoomMin && c.coords.z < j.zoomMax && j.icon != null && !(j.icon in c.t.disabledIcons)) {
                        var scale = raw_scale;
                        let shadow = j.glow ? shadowSize * scale * zoom / max : 0;
                        var label_w = j.size.width * zoom * scale;
                        var label_h = j.size.height * zoom * scale;
                        var label_x = j.x * zoom - c.coords.x * c.tile.width - label_w * .5;
                        var label_y = j.y * zoom - c.coords.y * c.tile.height - label_h * .5;
                        if (intersects.boxBox(0, 0, c.tile.width, c.tile.height, label_x - 2.0 * shadow, label_y - 2.0 * shadow, label_w + 4.0 * shadow, label_h + 4.0 * shadow)) {
                            if (!(j.icon in c.t.imageCache)) {
                                c.pendingLoad++;
                                var img = { image: new Image() };
                                c.t.imageCache[j.icon] = img;
                                img.image.src = 'MapIcons/'.concat(j.icon);
                                img.image.onload = function () {
                                    --c.pendingLoad;
                                };
                            }
                        }
                    }
                }
            },

            drawIcons: function (c) {

                function makeOnLoadCallback(icon, u) {
                    return function () {
                        var callbacks = u.imageCache[icon].callbacks;
                        for (var i = 0; i < callbacks.length; i++)
                            callbacks[i]();
                    };
                }
                function makeRenderCallback(u, icon, ctx, img, lx, ly, lw, lh, tile, glow, shadow) {
                    return function () {
                        if (glow) {
                            ctx.filter = "brightness(0.5) sepia(1) hue-rotate(296deg) saturate(10000%) blur(".concat(shadow).concat("px)"); // blur(10px)
                            ctx.drawImage(img.image, lx, ly, lw, lh);
                            ctx.drawImage(img.image, lx, ly, lw, lh);
                            ctx.drawImage(img.image, lx, ly, lw, lh);
                            ctx.filter = "none";
                        }
                        else
                            ctx.drawImage(img.image, lx, ly, lw, lh);
                        if (--tile.pendingLoad == 0) {
                            c.t.yield(c, 8);
                            delete img.callbacks;
                        }
                    };
                }

                var raw_scale = c.t.zoomScale(c.coords.z);

                var zoom = Math.pow(2, c.coords.z);
                var max = Math.pow(2, c.t.max_zoom);

                c.tile.pendingLoad = 0;

                const shadowSize = 20;

                for (var j of c.t.icon_sources) {

                    if (c.coords.z >= j.zoomMin && c.coords.z < j.zoomMax && j.icon != null && !(j.icon in c.t.disabledIcons)) {

                        var scale = raw_scale;
                        let shadow = j.glow ? shadowSize * scale * zoom / max : 0;

                        var label_w = j.size.width * zoom * scale;
                        var label_h = j.size.height * zoom * scale;
                        var label_x = j.x * zoom - c.coords.x * c.tile.width / c.t.pixelScale - label_w * .5;
                        var label_y = j.y * zoom - c.coords.y * c.tile.height / c.t.pixelScale - label_h * .5;


                        if (intersects.boxBox(0, 0, c.tile.width / c.t.pixelScale, c.tile.height / c.t.pixelScale, label_x - 2.0 * shadow, label_y - 2.0 * shadow, label_w + 4.0 * shadow, label_h + 4.0 * shadow)) {
                            var icon = j.icon;
                            var lx = label_x, ly = label_y, lw = label_w, lh = label_h;
                            if (icon in c.t.imageCache) {
                                var img = c.t.imageCache[icon];
                                if (img.image.complete) {
                                    if (j.glow) {
                                        c.ctx.save();
                                        c.ctx.filter = "brightness(0.5) sepia(1) hue-rotate(296deg) saturate(10000%) blur(".concat(shadow).concat("px)"); // blur(10px)
                                        c.ctx.drawImage(img.image, lx, ly, lw, lh);
                                        c.ctx.drawImage(img.image, lx, ly, lw, lh);
                                        c.ctx.drawImage(img.image, lx, ly, lw, lh);
                                        c.ctx.restore();
                                    }
                                    else
                                        c.ctx.drawImage(img.image, lx, ly, lw, lh);
                                }
                                else {
                                    img.callbacks.push(makeRenderCallback(c.t, icon, c.ctx, img, lx, ly, lw, lh, c.tile, j.glow, shadow));
                                    c.tile.pendingLoad++;
                                }
                            }
                            else {
                                c.tile.pendingLoad++;
                                var img = { image: new Image() };
                                img.callbacks = [makeRenderCallback(c.t, icon, c.ctx, img, lx, ly, lw, lh, c.tile, j.glow, shadow)];
                                c.t.imageCache[icon] = img;
                                img.image.src = 'MapIcons/'.concat(j.icon);
                                img.image.onload = makeOnLoadCallback(icon, c.t);
                            }
                        }
                    }
                }
                if (c.tile.pendingLoad == 0)
                    c.t.yield(c, 8);
            },

            pixelScale: 1, // This is too intense for now: window.devicePixelRatio,
            build: "",
            renderer: function (c, phase) {
                switch (phase) {
                    case 1:
                        {
                            c.tile = L.DomUtil.create('canvas', 'leaflet-tile');
                            //c.tile.crossorigin = "Anonymous";
                            //c.tile.setAttribute("crossorigin", "Anonymous");
                            let size = c.t.getTileSize();
                            c.tile.width = size.x * c.t.pixelScale;
                            c.tile.height = size.y * c.t.pixelScale;
                            c.tile.style.width = c.tile.width.toString().concat('px');
                            c.tile.style.height = c.tile.height.toString().concat('px');
                            c.ctx = c.tile.getContext('2d');
                            c.t.loadIcons(c);
                            c.img = new Image();
                            var scale = Math.pow(2, Math.max(0, c.coords.z - c.t.max_native_zoom));
                            c.img.src = 'Tiles/'.concat(Math.min(c.coords.z, c.t.max_native_zoom)).concat('_').concat(Math.floor(c.coords.x / scale)).concat('_').concat(Math.floor(c.coords.y / scale)).concat('.webp').concat(c.t.build);
                            c.phase_2_complete = false;
                            c.phase_3_complete = false;
                            c.img.onload = () => c.t.yield(c, 2);
                            c.t.yield(c, 3);
                            return c.tile;
                        }
                    case 2:
                        {
                            var scale = Math.pow(2, Math.max(0, c.coords.z - c.t.max_native_zoom));
                            var ox = c.coords.x % scale;
                            var oy = c.coords.y % scale;
                            var bx = (c.img.width / scale);
                            var by = (c.img.height / scale);
                            c.ctx.drawImage(c.img, bx * ox, by * oy, bx, by, 0, 0, c.tile.width, c.tile.height);
                            delete c.img;
                            c.phase_2_complete = true;
                            if (c.phase_3_complete)
                                c.t.yield(c, 4);
                            break;
                        }
                    case 3:
                        {
                            c.hd_ratio = (c.coords.z < 2 ? 8 : 16);
                            if (!c.t.draw) {
                                c.phase_3_complete = true;
                                if(c.phase_2_complete)
                                c.t.yield(c, 4);
                                return;
                            }
                            c.temp_canvas = L.DomUtil.create('canvas', '');
                            c.temp_canvas.width = 2 + c.tile.width / c.t.pixelScale / c.hd_ratio;
                            c.temp_canvas.height = 2 + c.tile.height / c.t.pixelScale / c.hd_ratio;
                            c.temp_ctx = c.temp_canvas.getContext('2d', { alpha: false });
                            c.x = 0;
                            c.y = 0;
                            c.i = 0;
                            c.d = c.temp_ctx.getImageData(0, 0, c.temp_canvas.width, c.temp_canvas.height);

                            c.t.calculateControl(c);
                            break;
                        }
                    case 4:
                        {
                            if (c.temp_canvas != null) {
                                let overlay = document.createElement("canvas");
                                overlay.width = c.tile.width;
                                overlay.height = c.tile.height;

                                let overlay_ctx = overlay.getContext('2d');

                                overlay_ctx.save();
                                c.t.drawValidRegions(overlay, overlay_ctx, c.coords, c.t);
                                overlay_ctx.restore();

                                overlay_ctx.save();
                                overlay_ctx.globalCompositeOperation = 'source-atop';
                                overlay_ctx.imageSmoothingQuality = 'low';
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

                                //c.temp_ctx.clearRect(0, 0, c.temp_canvas.width, c.temp_canvas.height);

                                delete overlay_ctx;
                                delete overlay;
                                delete c.temp_canvas;
                            }
                            c.t.yield(c, 5);
                            break;
                        }
                    case 5:
                        {
                            c.ctx.save();
                            c.ctx.scale(c.t.pixelScale, c.t.pixelScale);
                            c.t.drawRoads(c);
                            break;
                        }
                    case 6:
                        {
                            c.ctx.restore();
                            c.t.drawBorders(c);
                            c.t.yield(c, 7);
                            break;
                        }
                    case 7:
                        {
                            c.ctx.save();
                            c.ctx.scale(c.t.pixelScale, c.t.pixelScale);
                            c.t.drawIcons(c);
                            break;
                        }
                    case 8:
                        {
                            c.ctx.restore();
                            setTimeout(() => c.done(null, c.tile), 0);
                            break;
                        }
                }
            },

            drawRoads: function (c) {
                var coords = c.coords;
                let tile = c.tile;
                let ctx = c.ctx;

                ctx.lineJoin = 'miter';
                ctx.lineCap = 'round';

                var scale = Math.pow(2, c.t.grid_depth - coords.z);
                var start_x = Math.floor(coords.x * scale);
                var start_y = Math.floor(coords.y * scale);

                var end_x = Math.ceil((coords.x + 1) * scale);
                var end_y = Math.ceil((coords.y + 1) * scale);

                var depth_inverse = Math.pow(2, coords.z);
                var sources = c.t.road_sources;
                var offset = c.t.offset;
                var outerWidth = c.t.RoadWidth * depth_inverse;
                var innerWidth = c.t.ControlWidth * depth_inverse;
                var grid_x_size = c.t.grid_x_size;
                var grid_y_size = c.t.grid_y_size;
                var controls = c.t.controls;
                var quality = c.t.quality;
                let pixelScale = c.t.pixelScale;
                function draw(i, start_x, start_y, end_x, end_y, x, y, step) {
                    var startTime = Date.now();
                    if (step == 1) {
                        if (quality) {
                            var tiers = ['', '#957458', '#94954e', '#5a9565'];
                            ctx.lineWidth = outerWidth;
                            for (; y < end_y; y++, x = start_x)
                                for (; x < end_x; x++, i = 0) {

                                    if (x >= 0 && y >= 0 && x < grid_x_size && y < grid_y_size) {
                                        for (; i < sources[x][y].length; i++) {

                                            var j = sources[x][y][i];
                                            ctx.strokeStyle = tiers[j.options.tier];
                                            ctx.beginPath();
                                            var coordsx = coords.x * tile.width / pixelScale;
                                            var coordsy = coords.y * tile.height / pixelScale;
                                            var x1 = (j.points[0][1] + offset[0]) * depth_inverse - coordsx;
                                            var y1 = (j.points[0][0] + offset[1]) * depth_inverse - coordsy;
                                            var x2 = (j.points[1][1] + offset[0]) * depth_inverse - coordsx;
                                            var y2 = (j.points[1][0] + offset[1]) * depth_inverse - coordsy;
                                            ctx.moveTo(x1, y1);
                                            ctx.lineTo(x2, y2);
                                            ctx.stroke();
                                            if (Date.now() - startTime > 3) {
                                                setTimeout(() => draw(i, start_x, start_y, end_x, end_y, x, y, step), 0);
                                                return;
                                            }
                                        }
                                    }
                                    if (Date.now() - startTime > 3) {
                                        setTimeout(() => draw(i, start_x, start_y, end_x, end_y, x, y, step), 0);
                                        return;
                                    }
                                }

                        }
                        // move to step 2, reset all starting values (only once)
                        step = 2;
                        x = start_x;
                        y = start_y;
                        i = 0;
                    }

                    if (step == 2) {
                        ctx.lineWidth = innerWidth;
                        var colors = ['#516C4B', '#235683', '#303030', '#CCCC44'];

                        for (; y <= end_y; y++, x = start_x)
                            for (; x <= end_x; x++, i = 0)
                                if (x >= 0 && y >= 0 && x < grid_x_size && y < grid_y_size) {
                                    for (; i < sources[x][y].length; i++) {
                                        var j = sources[x][y][i];
                                        if (controls[j.options.control]) {
                                            ctx.strokeStyle = colors[j.options.control];
                                            ctx.beginPath();
                                            var coordsx = coords.x * tile.width / pixelScale;
                                            var coordsy = coords.y * tile.height / pixelScale;
                                            var x1 = (j.points[0][1] + offset[0]) * depth_inverse - coordsx;
                                            var y1 = (j.points[0][0] + offset[1]) * depth_inverse - coordsy;
                                            var x2 = (j.points[1][1] + offset[0]) * depth_inverse - coordsx;
                                            var y2 = (j.points[1][0] + offset[1]) * depth_inverse - coordsy;
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
                        c.t.yield(c, 6);
                        return;
                    }
                }
                draw(0, start_x, start_y, end_x, end_y, start_x, start_y, 1);
            },

            calculateControl: function (c) {

                var start = Date.now();
                var max = Math.pow(2, c.t.max_zoom - c.coords.z);
                var zoom = Math.pow(2, c.coords.z);
                var hdrz = c.hd_ratio / zoom;
                var grid = { x: c.coords.x * max, y: c.coords.y * max };
                var colors = [{ r: 0.1372549019607843, g: 0.3372549019607843, b: 0.5137254901960784 }, { r: 0.3176470588235294, g: 0.4235294117647059, b: 0.2941176470588235 }];

                for (var counter = 0; c.y < c.temp_canvas.height; c.y++, c.x = 0)
                    for (; c.x < c.temp_canvas.width; c.x++, counter++) {
                        if (counter > 16 && Date.now() - start > 3) {
                            setTimeout(() => c.t.calculateControl(c), 0);
                            return;
                        }

                        var scale = { x: grid.x + (c.x - 1) * hdrz, y: -(grid.y + (c.y - 1) * hdrz) }
                        var v = c.t.API.control(scale.x, scale.y);

                        if (v < 0) // fade from warden
                        {
                            v++;
                            c.d.data[c.i++] = Math.floor(255 * (v * (1.0 - colors[0].r) + colors[0].r));
                            c.d.data[c.i++] = Math.floor(255 * (v * (.4 - colors[0].g) + colors[0].g));
                            c.d.data[c.i] = Math.floor(255 * (v * (.2666 - colors[0].b) + colors[0].b));
                            c.i += 2;
                        }
                        else if (v > 0) // fade from colonial
                        {
                            v = 1 - v;
                            c.d.data[c.i++] = Math.floor(255 * (v * (1.0 - colors[1].r) + colors[1].r));
                            c.d.data[c.i++] = Math.floor(255 * (v * (.4 - colors[1].g) + colors[1].g));
                            c.d.data[c.i] = Math.floor(255 * (v * (.2666 - colors[1].b) + colors[1].b));
                            c.i += 2;
                        }
                    }

                c.temp_ctx.putImageData(c.d, 0, 0);
                delete c.d;

                c.phase_3_complete = true;
                if (c.phase_2_complete) {
                    c.t.yield(c, 4);
                }
            },

            yield: (c, phase) =>
                setTimeout(() => c.t.renderer(c, phase), 0),

            createTile: function (coords, done) {
                let scale = Math.pow(2, coords.z);
                if (coords.x < 0 || coords.x >= scale || coords.y < 0 || coords.y >= scale || coords.z < 0) {
                    let t = L.DomUtil.create('canvas', 'leaflet-tile');
                    let size = this.getTileSize();
                    t.width = this.pixelScale * size.x;
                    t.height = this.pixelScale * size.y;
                    setTimeout(() => done(null, t), 0);
                    return t;
                }
                return this.renderer({ t: this, coords: coords, done: done }, 1);
            }

        });

        return {
            Create: (MaxNativeZoom, MaxZoom, Offset, API, RoadWidth, ControlWidth, GridDepth) => {
                var u = new VectorControlGridPrototype({ updateWhenZooming: false, noWrap: true, maxZoom: MaxZoom, minZoom: 0 });

                var size = u.getTileSize();

                u.RoadWidth = RoadWidth;
                u.ControlWidth = ControlWidth;
                u.road_sources = [];
                u.max_zoom = MaxZoom;
                u.grid_depth = GridDepth;
                u.offset = Offset;
                var max = Math.pow(2, GridDepth);
                u.grid_x_size = max;
                u.grid_x_width = (size.x / u.grid_x_size);
                u.grid_y_size = max;
                u.grid_y_height = (size.y / u.grid_y_size);

                var max_road_width = Math.max(RoadWidth, ControlWidth);

                var margin = max_road_width * max;

                for (var x = 0; x < u.grid_x_size; x++) {
                    u.road_sources.push([]);
                    for (var y = 0; y < u.grid_y_size; y++)
                        u.road_sources[x].push([]);
                }

                var marginx = margin / u.grid_x_size;
                var marginy = margin / u.grid_y_size;

                var addLine = (x, y, p, options, u, Offset) => {
                    if (x >= 0 && y >= 0 && x < u.grid_x_size && y < u.grid_y_size)
                        u.road_sources[x][y].push({ points: p, options: options });
                };

                var gx = 1.0 / u.grid_x_width;
                var gy = 1.0 / u.grid_y_height;

                u.addRoad = (points, options) => {

                    var c = [[-points[0][0] - Offset[1], points[0][1] - Offset[0]], [-points[1][0] - Offset[1], points[1][1] - Offset[0]]]
                    var p = [[c[0][0], c[0][1]], [c[1][0], c[1][1]]];

                    var x1 = c[0][1] + Offset[0];
                    var y1 = c[0][0] + Offset[1];
                    var x2 = c[1][1] + Offset[0];
                    var y2 = c[1][0] + Offset[1];

                    var angle = Math.atan2(y2 - y1, x2 - x1);
                    var ext_x = Math.cos(angle);
                    var ext_y = Math.sin(angle);

                    x1 -= ext_x * marginx;
                    y1 -= ext_y * marginy;
                    x2 += ext_x * marginx;
                    y2 += ext_y * marginy;

                    var start_tile_x = Math.floor(Math.min(x1, x2) * gx - marginx);
                    var start_tile_y = Math.floor(Math.min(y1, y2) * gy - marginy);

                    var end_tile_x = Math.floor(Math.max(x2, x1) * gx + marginx);
                    var end_tile_y = Math.floor(Math.max(y2, y1) * gy + marginy);

                    var width = u.grid_x_width + marginx * 2.0;
                    var height = u.grid_y_height + marginy * 2.0;

                    for (var x = start_tile_x; x <= end_tile_x; x++)
                        for (var y = start_tile_y; y <= end_tile_y; y++)
                            if (intersects.lineBox(x1, y1, x2, y2, x * u.grid_x_width - marginx, y * u.grid_y_height - marginy, width, height))
                                addLine(x, y, p, options, u, Offset);

                };

                u.max_native_zoom = MaxNativeZoom;
                u.offset = Offset;
                u.Offset = Offset;
                u.API = API;

                u.icon_sources = [];
                u.icon_grid_x_size = Math.pow(2, MaxZoom);
                u.icon_grid_x_width = u.pixelScale * size.x / u.grid_x_size;
                u.icon_grid_y_size = Math.pow(2, MaxZoom);
                u.icon_grid_y_height = u.pixelScale * size.y / u.grid_y_size;
                u.imageCache = {};
                u.addIcon = (icon, x, y, glow, zoomMin, zoomMax) => {
                    u.icon_sources.push(
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


                u.hex_sources = [];
                u.addHex = (x, y, width, height, offline) => {
                    u.hex_sources.push(
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
                u.on('loading', () => { for (let i of unloaded_events) i(); });
                u.on('load', () => { for (let i of loaded_events) i(); });
                return u;
            }
        }
    });