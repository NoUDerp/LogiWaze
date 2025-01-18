var $2K9WE$pointinpolygon = require("point-in-polygon");
var $2K9WE$sakitamgiskriging = require("@sakitam-gis/kriging");
var $2K9WE$superagent = require("superagent");
var $2K9WE$leaflet = require("leaflet");
var $2K9WE$jquery = require("jquery");


function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

      var $parcel$global = globalThis;
    
function $parcel$defineInteropFlag(a) {
  Object.defineProperty(a, '__esModule', {value: true, configurable: true});
}

var $parcel$modules = {};
var $parcel$inits = {};

var parcelRequire = $parcel$global["parcelRequire94c2"];

if (parcelRequire == null) {
  parcelRequire = function(id) {
    if (id in $parcel$modules) {
      return $parcel$modules[id].exports;
    }
    if (id in $parcel$inits) {
      var init = $parcel$inits[id];
      delete $parcel$inits[id];
      var module = {id: id, exports: {}};
      $parcel$modules[id] = module;
      init.call(module.exports, module, module.exports);
      return module.exports;
    }
    var err = new Error("Cannot find module '" + id + "'");
    err.code = 'MODULE_NOT_FOUND';
    throw err;
  };

  parcelRequire.register = function register(id, init) {
    $parcel$inits[id] = init;
  };

  $parcel$global["parcelRequire94c2"] = parcelRequire;
}

var parcelRegister = parcelRequire.register;
parcelRegister("alnMM", function(module, exports) {

$parcel$export(module.exports, "Create", () => $a14044949345dffb$export$8ade6fcbf3a7de5d, (v) => $a14044949345dffb$export$8ade6fcbf3a7de5d = v);
//@ts-nocheck
var $a14044949345dffb$export$8ade6fcbf3a7de5d;
define([
    'leaflet',
    'intersects'
], function(L, intersects) {
    var VectorControlGridPrototype = L.GridLayer.extend({
        controls: [
            true,
            true,
            true,
            true
        ],
        quality: true,
        draw: true,
        drawHexes: true,
        shadowSize: 20,
        disabledIcons: {},
        zoomScale: function(zoom) {
            return .65 * (1 + this.max_zoom - zoom);
        },
        shadowSize: 20,
        pixelScale: 1,
        drawHex: (tile, ctx, x, y, w, h, scale)=>{
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
        fillHex: (tile, ctx, x, y, w, h, scale)=>{
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
        drawBorders: function(c) {
            let coords = c.coords;
            let tile = c.tile;
            if (!c.t.drawHexes) return tile;
            var zoom = Math.pow(2, coords.z);
            var u = this;
            var lineWidth = .2 * Math.pow(2, coords.z);
            var shadow = lineWidth * .5 / Math.pow(2, c.t.max_zoom);
            c.ctx.save();
            c.ctx.strokeStyle = '#303030';
            c.ctx.opacity = .8;
            c.ctx.scale(c.t.pixelScale, c.t.pixelScale);
            for (var j of c.t.hex_sources){
                var label_w = j.size.width * zoom + shadow * 2;
                var label_h = j.size.height * zoom + shadow * 2;
                var label_x = j.x * zoom - coords.x * tile.width / c.t.pixelScale - label_w - shadow;
                var label_y = j.y * zoom - coords.y * tile.height / c.t.pixelScale - label_h - shadow;
                if (intersects.boxBox(0, 0, tile.width, tile.height, label_x, label_y, label_w, label_h)) c.t.drawHex(c.tile, c.ctx, label_x + label_w * .5, label_y + label_h * .5, label_w * .5, label_h * .5, lineWidth);
            }
            c.ctx.restore();
        },
        drawValidRegions: function(tile, ctx, coords, t) {
            var zoom = Math.pow(2, coords.z);
            var lineWidth = 1 * Math.pow(2, coords.z);
            var shadow = lineWidth * .5 / Math.pow(2, t.max_zoom);
            ctx.save();
            ctx.fillStyle = '#FFFFFFFF';
            ctx.strokeStyle = '#FFFFFFFF';
            ctx.scale(t.pixelScale, t.pixelScale);
            for (var j of t.hex_sources)if (!j.offline) {
                var label_w = j.size.width * zoom + shadow * 2;
                var label_h = j.size.height * zoom + shadow * 2;
                var label_x = j.x * zoom - coords.x * tile.width / t.pixelScale - label_w - shadow;
                var label_y = j.y * zoom - coords.y * tile.height / t.pixelScale - label_h - shadow;
                if (intersects.boxBox(0, 0, tile.width, tile.height, label_x, label_y, label_w, label_h)) t.fillHex(tile, ctx, label_x + label_w * .5, label_y + label_h * .5, label_w * .5, label_h * .5, lineWidth);
            }
            ctx.restore();
        },
        drawInvalidRegions: function(tile, ctx, coords, t) {
            var zoom = Math.pow(2, coords.z);
            var lineWidth = 1 * Math.pow(2, coords.z);
            var shadow = lineWidth * .5 / Math.pow(2, t.max_zoom);
            ctx.save();
            ctx.fillStyle = '#000000FF';
            ctx.strokeStyle = '#000000FF';
            for (var j of t.hex_sources)if (j.offline) {
                var label_w = j.size.width * zoom + shadow * 2;
                var label_h = j.size.height * zoom + shadow * 2;
                var label_x = j.x * zoom - coords.x * tile.width / t.pixelScale - label_w - shadow; // / t.pixelScale
                var label_y = j.y * zoom - coords.y * tile.height / t.pixelScale - label_h - shadow;
                if (intersects.boxBox(0, 0, tile.width, tile.height, label_x, label_y, label_w, label_h)) t.fillHex(tile, ctx, label_x + label_w * .5, label_y + label_h * .5, label_w * .5, label_h * .5, lineWidth);
            }
            ctx.restore();
        },
        disableIcons: function(icons) {
            for (var i of icons)this.disabledIcons[i] = true;
        },
        enableIcons: function(icons) {
            for (var i of icons)delete this.disabledIcons[i];
        },
        loadIcons: function(c) {
            var raw_scale = c.t.zoomScale(c.coords.z);
            var zoom = Math.pow(2, c.coords.z);
            var max = Math.pow(2, c.t.max_zoom);
            c.pendingLoad = 0;
            const shadowSize = 20;
            for (var j of c.t.icon_sources)if (c.coords.z >= j.zoomMin && c.coords.z < j.zoomMax && j.icon != null && !(j.icon in c.t.disabledIcons)) {
                var scale = raw_scale;
                let shadow = j.glow ? shadowSize * scale * zoom / max : 0;
                var label_w = j.size.width * zoom * scale;
                var label_h = j.size.height * zoom * scale;
                var label_x = j.x * zoom - c.coords.x * c.tile.width - label_w * .5;
                var label_y = j.y * zoom - c.coords.y * c.tile.height - label_h * .5;
                if (intersects.boxBox(0, 0, c.tile.width, c.tile.height, label_x - 2.0 * shadow, label_y - 2.0 * shadow, label_w + 4.0 * shadow, label_h + 4.0 * shadow)) {
                    if (!(j.icon in c.t.imageCache)) {
                        c.pendingLoad++;
                        var img = {
                            image: new Image()
                        };
                        c.t.imageCache[j.icon] = img;
                        img.image.src = 'MapIcons/'.concat(j.icon);
                        img.image.onload = function() {
                            --c.pendingLoad;
                        };
                    }
                }
            }
        },
        drawIcons: function(c) {
            function makeOnLoadCallback(icon, u) {
                return function() {
                    var callbacks = u.imageCache[icon].callbacks;
                    for(var i = 0; i < callbacks.length; i++)callbacks[i]();
                };
            }
            function makeRenderCallback(u, icon, ctx, img, lx, ly, lw, lh, tile, glow, shadow) {
                return function() {
                    if (glow) {
                        ctx.filter = "brightness(0.5) sepia(1) hue-rotate(296deg) saturate(10000%) blur(".concat(shadow).concat("px)"); // blur(10px)
                        ctx.drawImage(img.image, lx, ly, lw, lh);
                        ctx.drawImage(img.image, lx, ly, lw, lh);
                        ctx.drawImage(img.image, lx, ly, lw, lh);
                        ctx.filter = "none";
                    } else ctx.drawImage(img.image, lx, ly, lw, lh);
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
            for (var j of c.t.icon_sources)if (c.coords.z >= j.zoomMin && c.coords.z < j.zoomMax && j.icon != null && !(j.icon in c.t.disabledIcons)) {
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
                            } else c.ctx.drawImage(img.image, lx, ly, lw, lh);
                        } else {
                            img.callbacks.push(makeRenderCallback(c.t, icon, c.ctx, img, lx, ly, lw, lh, c.tile, j.glow, shadow));
                            c.tile.pendingLoad++;
                        }
                    } else {
                        c.tile.pendingLoad++;
                        var img = {
                            image: new Image()
                        };
                        img.callbacks = [
                            makeRenderCallback(c.t, icon, c.ctx, img, lx, ly, lw, lh, c.tile, j.glow, shadow)
                        ];
                        c.t.imageCache[icon] = img;
                        img.image.src = 'MapIcons/'.concat(j.icon);
                        img.image.onload = makeOnLoadCallback(icon, c.t);
                    }
                }
            }
            if (c.tile.pendingLoad == 0) c.t.yield(c, 8);
        },
        pixelScale: 1,
        build: "",
        renderer: function(c, phase) {
            switch(phase){
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
                        c.img.onload = ()=>c.t.yield(c, 2);
                        c.t.yield(c, 3);
                        return c.tile;
                    }
                case 2:
                    var scale = Math.pow(2, Math.max(0, c.coords.z - c.t.max_native_zoom));
                    var ox = c.coords.x % scale;
                    var oy = c.coords.y % scale;
                    var bx = c.img.width / scale;
                    var by = c.img.height / scale;
                    c.ctx.drawImage(c.img, bx * ox, by * oy, bx, by, 0, 0, c.tile.width, c.tile.height);
                    delete c.img;
                    c.phase_2_complete = true;
                    if (c.phase_3_complete) c.t.yield(c, 4);
                    break;
                case 3:
                    c.hd_ratio = c.coords.z < 2 ? 8 : 16;
                    if (!c.t.draw) {
                        c.phase_3_complete = true;
                        if (c.phase_2_complete) c.t.yield(c, 4);
                        return;
                    }
                    c.temp_canvas = L.DomUtil.create('canvas', '');
                    c.temp_canvas.width = 2 + c.tile.width / c.t.pixelScale / c.hd_ratio;
                    c.temp_canvas.height = 2 + c.tile.height / c.t.pixelScale / c.hd_ratio;
                    c.temp_ctx = c.temp_canvas.getContext('2d', {
                        alpha: false
                    });
                    c.x = 0;
                    c.y = 0;
                    c.i = 0;
                    c.d = c.temp_ctx.getImageData(0, 0, c.temp_canvas.width, c.temp_canvas.height);
                    c.t.calculateControl(c);
                    break;
                case 4:
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
                        //delete overlay_ctx;
                        //delete overlay;
                        delete c.temp_canvas;
                    }
                    c.t.yield(c, 5);
                    break;
                case 5:
                    c.ctx.save();
                    c.ctx.scale(c.t.pixelScale, c.t.pixelScale);
                    c.t.drawRoads(c);
                    break;
                case 6:
                    c.ctx.restore();
                    c.t.drawBorders(c);
                    c.t.yield(c, 7);
                    break;
                case 7:
                    c.ctx.save();
                    c.ctx.scale(c.t.pixelScale, c.t.pixelScale);
                    c.t.drawIcons(c);
                    break;
                case 8:
                    c.ctx.restore();
                    setTimeout(()=>c.done(null, c.tile), 0);
                    break;
            }
        },
        drawRoads: function(c) {
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
            //var quality = c.t.quality;
            let pixelScale = c.t.pixelScale;
            function draw(i, start_x, start_y, end_x, end_y, x, y, step) {
                var startTime = Date.now();
                if (step == 1) {
                    /*if (quality) {
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

                        }*/ // move to step 2, reset all starting values (only once)
                    step = 2;
                    x = start_x;
                    y = start_y;
                    i = 0;
                }
                if (step == 2) {
                    ctx.lineWidth = innerWidth;
                    var colors = [
                        '#516C4B',
                        '#235683',
                        '#303030',
                        '#CCCC44'
                    ];
                    for(; y <= end_y; y++, x = start_x)for(; x <= end_x; x++, i = 0)if (x >= 0 && y >= 0 && x < grid_x_size && y < grid_y_size) {
                        for(; i < sources[x][y].length; i++){
                            var j = sources[x][y][i];
                            if (controls[0 /*j.options.control*/ ]) {
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
                                setTimeout(()=>draw(i, start_x, start_y, end_x, end_y, x, y, step), 0);
                                return;
                            }
                        }
                        if (Date.now() - startTime > 3) {
                            setTimeout(()=>draw(i, start_x, start_y, end_x, end_y, x, y, step), 0);
                            return;
                        }
                    }
                    c.t.yield(c, 6);
                    return;
                }
            }
            draw(0, start_x, start_y, end_x, end_y, start_x, start_y, 1);
        },
        calculateControl: function(c) {
            var start = Date.now();
            var max = Math.pow(2, c.t.max_zoom - c.coords.z);
            var zoom = Math.pow(2, c.coords.z);
            var hdrz = c.hd_ratio / zoom;
            var grid = {
                x: c.coords.x * max,
                y: c.coords.y * max
            };
            var colors = [
                {
                    r: 0.1372549019607843,
                    g: 0.3372549019607843,
                    b: 0.5137254901960784
                },
                {
                    r: 0.3176470588235294,
                    g: 0.4235294117647059,
                    b: 0.2941176470588235
                }
            ];
            for(var counter = 0; c.y < c.temp_canvas.height; c.y++, c.x = 0)for(; c.x < c.temp_canvas.width; c.x++, counter++){
                if (counter > 16 && Date.now() - start > 3) {
                    setTimeout(()=>c.t.calculateControl(c), 0);
                    return;
                }
                var scale = {
                    x: grid.x + (c.x - 1) * hdrz,
                    y: -(grid.y + (c.y - 1) * hdrz)
                };
                var v = c.t.API.control(scale.x, scale.y);
                if (v < 0) {
                    v++;
                    c.d.data[c.i++] = Math.floor(255 * (v * (1.0 - colors[0].r) + colors[0].r));
                    c.d.data[c.i++] = Math.floor(255 * (v * (.4 - colors[0].g) + colors[0].g));
                    c.d.data[c.i] = Math.floor(255 * (v * (.2666 - colors[0].b) + colors[0].b));
                    c.i += 2;
                } else if (v > 0) {
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
            if (c.phase_2_complete) c.t.yield(c, 4);
        },
        yield: (c, phase)=>setTimeout(()=>c.t.renderer(c, phase), 0),
        createTile: function(coords, done) {
            let scale = Math.pow(2, coords.z);
            if (coords.x < 0 || coords.x >= scale || coords.y < 0 || coords.y >= scale || coords.z < 0) {
                let t = L.DomUtil.create('canvas', 'leaflet-tile');
                let size = this.getTileSize();
                t.width = this.pixelScale * size.x;
                t.height = this.pixelScale * size.y;
                setTimeout(()=>done(null, t), 0);
                return t;
            }
            return this.renderer({
                t: this,
                coords: coords,
                done: done
            }, 1);
        }
    });
    let createFn = (MaxNativeZoom, MaxZoom, Offset, API, RoadWidth, ControlWidth, GridDepth)=>{
        var u = new VectorControlGridPrototype({
            updateWhenZooming: false,
            noWrap: true,
            maxZoom: MaxZoom,
            minZoom: 0
        });
        var size = u.getTileSize();
        u.RoadWidth = RoadWidth;
        u.ControlWidth = ControlWidth;
        u.road_sources = [];
        u.max_zoom = MaxZoom;
        u.grid_depth = GridDepth;
        u.offset = Offset;
        var max = Math.pow(2, GridDepth);
        u.grid_x_size = max;
        u.grid_x_width = size.x / u.grid_x_size;
        u.grid_y_size = max;
        u.grid_y_height = size.y / u.grid_y_size;
        var max_road_width = Math.max(RoadWidth, ControlWidth);
        var margin = max_road_width * max;
        for(var x = 0; x < u.grid_x_size; x++){
            u.road_sources.push([]);
            for(var y = 0; y < u.grid_y_size; y++)u.road_sources[x].push([]);
        }
        var marginx = margin / u.grid_x_size;
        var marginy = margin / u.grid_y_size;
        var addLine = (x, y, p, options, u, Offset)=>{
            if (x >= 0 && y >= 0 && x < u.grid_x_size && y < u.grid_y_size) u.road_sources[x][y].push({
                points: p,
                options: options
            });
        };
        var gx = 1.0 / u.grid_x_width;
        var gy = 1.0 / u.grid_y_height;
        u.addRoad = (points, options)=>{
            var c = [
                [
                    -points[0][0] - Offset[1],
                    points[0][1] - Offset[0]
                ],
                [
                    -points[1][0] - Offset[1],
                    points[1][1] - Offset[0]
                ]
            ];
            var p = [
                [
                    c[0][0],
                    c[0][1]
                ],
                [
                    c[1][0],
                    c[1][1]
                ]
            ];
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
            for(var x = start_tile_x; x <= end_tile_x; x++)for(var y = start_tile_y; y <= end_tile_y; y++)if (intersects.lineBox(x1, y1, x2, y2, x * u.grid_x_width - marginx, y * u.grid_y_height - marginy, width, height)) addLine(x, y, p, options, u, Offset);
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
        u.addIcon = (icon, x, y, glow, zoomMin, zoomMax)=>{
            u.icon_sources.push({
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
        u.addHex = (x, y, width, height, offline)=>{
            u.hex_sources.push({
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
        u.when = function(event_name, event_action) {
            switch(event_name){
                case 'loaded':
                    loaded_events.push(event_action);
                    break;
                case 'unloaded':
                    unloaded_events.push(event_action);
                    break;
            }
        };
        u.on('loading', ()=>{
            for (let i of unloaded_events)i();
        });
        u.on('load', ()=>{
            for (let i of loaded_events)i();
        });
        return u;
    };
    $a14044949345dffb$export$8ade6fcbf3a7de5d = createFn;
    return {
        Create: createFn
    };
});

});

parcelRegister("60CBY", function(module, exports) {
//@ts-nocheck
define([
    'leaflet',
    'intersects'
], function(L, intersects) {
    function controlToFont(control, ctx1, boring_font) {
        if (boring_font) switch(control){
            case 0:
            case 1:
            case 2:
            case 3:
                ctx1.font = '70px Renner';
                break;
            case 4:
                ctx1.font = '90px Renner';
                break;
        }
        else switch(control){
            case 0:
                ctx1.font = '54px Roman';
                break;
            case 1:
                ctx1.font = '60px Celtic';
                break;
            case 2:
            case 3:
                ctx1.font = '50px Italic';
                break;
            case 4:
                ctx1.font = '80px Italic';
                break;
        }
    }
    var VectorGridPrototype = L.GridLayer.extend({
        zoomScale: function(zoom) {
            return .65 * (1 + this.max_zoom - zoom);
        },
        shadowSize: 20,
        draw: true,
        boring: true,
        pixelScale: window.devicePixelRatio,
        recalculateSizes: function() {
            var canvas = L.DomUtil.create('canvas', 'leaflet-tile');
            ctx = canvas.getContext('2d');
            for (let k of this.sources){
                controlToFont(k.control, ctx, this.boring);
                var size = ctx.measureText(this.boring ? k.original_text : k.text);
                k.size = {
                    width: (size.actualBoundingBoxRight - size.actualBoundingBoxLeft) / this.grid_x_size,
                    height: (size.actualBoundingBoxAscent + size.actualBoundingBoxDescent) / this.grid_y_size
                };
            }
        },
        createTile: function(coords, done) {
            var raw_scale = this.zoomScale(coords.z);
            var hd_ratio = this.pixelScale;
            var size = this.getTileSize();
            var tile = null;
            tile = L.DomUtil.create('canvas', 'leaflet-tile logiwaze-text');
            tile.crossorigin = "Anonymous";
            tile.setAttribute("crossorigin", "Anonymous");
            tile.width = size.x * hd_ratio;
            tile.height = size.y * hd_ratio;
            tile.style.width = (size.x * hd_ratio).toString().concat("px");
            tile.style.height = (size.y * hd_ratio).toString().concat("px");
            if (!this.draw) {
                setTimeout(()=>done(null, tile), 0);
                return tile;
            }
            let ctx1 = tile.getContext('2d');
            let zoom = Math.pow(2, coords.z);
            let max = Math.pow(2, this.max_zoom);
            let sources = this.sources;
            let shadowSize = this.shadowSize;
            function draw(i, boring) {
                var startTime = Date.now();
                for(; i < sources.length; i++){
                    let j = sources[i];
                    if (coords.z >= j.zoomMin && coords.z < j.zoomMax) {
                        let scale = raw_scale * j.scale;
                        let text_scale = hd_ratio * scale * zoom / max;
                        let shadow = shadowSize * text_scale;
                        let label_w = j.size.width * zoom * scale * hd_ratio + shadow * 2;
                        let label_h = j.size.height * zoom * scale * hd_ratio + shadow * 2;
                        let label_x = j.x * zoom * hd_ratio - coords.x * tile.width - label_w * .5 - shadow;
                        let label_y = j.y * zoom * hd_ratio - coords.y * tile.height - label_h * .25 - shadow;
                        if (intersects.boxBox(0, 0, tile.width, tile.height, label_x, label_y, label_w, label_h)) {
                            ctx1.setTransform(text_scale, 0, 0, text_scale, label_x + label_w * .5, label_y + label_h * .5);
                            controlToFont(j.control, ctx1, boring);
                            ctx1.shadowColor = "rgba(0, 0, 0, 1)";
                            ctx1.shadowBlur = shadow;
                            ctx1.fillStyle = j.color;
                            ctx1.strokeStyle = j.color;
                            ctx1.textAlign = 'center';
                            ctx1.textBaseline = 'middle';
                            ctx1.fillText(boring ? j.original_text : j.text, 0, 0);
                            ctx1.fillText(boring ? j.original_text : j.text, 0, 0);
                            ctx1.fillText(boring ? j.original_text : j.text, 0, 0);
                            ctx1.fillText(boring ? j.original_text : j.text, 0, 0);
                            ctx1.shadowColor = "rgba(0, 0, 0, 0)";
                            ctx1.shadowBlur = 0;
                            ctx1.setTransform(1, 0, 0, 1, 0, 0);
                        }
                    }
                    if (Date.now() - startTime > 3) {
                        setTimeout(()=>draw(i, boring), 0);
                        return;
                    }
                }
                done(null, tile);
            }
            setTimeout(()=>draw(0, this.boring), 0);
            return tile;
        }
    });
    return {
        Create: function(MaxZoom, Offset) {
            var u = new VectorGridPrototype({
                updateWhenZooming: false,
                noWrap: true
            });
            var size = u.getTileSize();
            u.sources = [];
            u.max_zoom = MaxZoom;
            u.offset = Offset;
            u.grid_x_size = Math.pow(2, MaxZoom);
            u.grid_x_width = size.x / u.grid_x_size;
            u.grid_y_size = Math.pow(2, MaxZoom);
            u.grid_y_height = size.y / u.grid_y_size;
            u.Offset = Offset;
            var canvas = L.DomUtil.create('canvas', 'leaflet-tile');
            ctx = canvas.getContext('2d');
            u.Offset = Offset;
            u.addText = (text, original_text, control, x, y, zoomMin, zoomMax, color, scale)=>{
                controlToFont(control, ctx, u.boring);
                var size = ctx.measureText(u.boring ? original_text : text);
                u.sources.push({
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
            u.when = function(event_name, event_action) {
                switch(event_name){
                    case 'loaded':
                        loaded_events.push(event_action);
                        break;
                    case 'unloaded':
                        unloaded_events.push(event_action);
                        break;
                }
            };
            u.on('loading', ()=>{
                for (let i of unloaded_events)i();
            });
            u.on('load', ()=>{
                for (let i of loaded_events)i();
            });
            return u;
        }
    };
});

});

parcelRegister("XuuxV", function(module, exports) {

$parcel$export(module.exports, "API", () => $f37945235684ed0b$export$2c4e825dc9120f87, (v) => $f37945235684ed0b$export$2c4e825dc9120f87 = v);
//@ts-nocheck
var $f37945235684ed0b$export$2c4e825dc9120f87;



var $f37945235684ed0b$var$width = 256 / 7;
var $f37945235684ed0b$var$height = $f37945235684ed0b$var$width * Math.sqrt(3) / 2;
var $f37945235684ed0b$var$halfwidth = $f37945235684ed0b$var$width * .5;
var $f37945235684ed0b$var$halfheight = $f37945235684ed0b$var$height * .5;
let $f37945235684ed0b$var$regionPolygon = [
    [
        $f37945235684ed0b$var$halfwidth * .5,
        $f37945235684ed0b$var$halfheight
    ],
    [
        $f37945235684ed0b$var$halfwidth,
        0
    ],
    [
        $f37945235684ed0b$var$halfwidth * .5,
        -$f37945235684ed0b$var$halfheight
    ],
    [
        -$f37945235684ed0b$var$halfwidth * .5,
        -$f37945235684ed0b$var$halfheight
    ],
    [
        -$f37945235684ed0b$var$halfwidth,
        0
    ],
    [
        -$f37945235684ed0b$var$halfwidth * .5,
        $f37945235684ed0b$var$halfheight
    ]
];
let $f37945235684ed0b$var$ox = 0;
let $f37945235684ed0b$var$oy = 0;
let $f37945235684ed0b$var$regions = [
    {
        name: "KingsCageHex",
        realName: "King's Cage",
        x: $f37945235684ed0b$var$ox - 1.5 * $f37945235684ed0b$var$width,
        y: $f37945235684ed0b$var$oy
    },
    {
        name: "WestgateHex",
        realName: "Westgate",
        x: $f37945235684ed0b$var$ox + -2.25 * $f37945235684ed0b$var$width,
        y: $f37945235684ed0b$var$oy + -0.5 * $f37945235684ed0b$var$height
    },
    {
        name: "FarranacCoastHex",
        realName: "Farranac Coast",
        x: $f37945235684ed0b$var$ox + -2.25 * $f37945235684ed0b$var$width,
        y: $f37945235684ed0b$var$oy + .5 * $f37945235684ed0b$var$height
    },
    {
        name: "EndlessShoreHex",
        realName: "Endless Shore",
        x: $f37945235684ed0b$var$ox + 2.25 * $f37945235684ed0b$var$width,
        y: $f37945235684ed0b$var$oy + -0.5 * $f37945235684ed0b$var$height
    },
    {
        name: "StlicanShelfHex",
        realName: "Stlican Shelf",
        x: $f37945235684ed0b$var$ox + 2.25 * $f37945235684ed0b$var$width,
        y: $f37945235684ed0b$var$oy + .5 * $f37945235684ed0b$var$height
    },
    {
        name: "OarbreakerHex",
        realName: "Oarbreaker",
        x: $f37945235684ed0b$var$ox + -3 * $f37945235684ed0b$var$width,
        y: $f37945235684ed0b$var$oy + 1 * $f37945235684ed0b$var$height
    },
    {
        name: "FishermansRowHex",
        realName: "Fisherman's Row",
        x: $f37945235684ed0b$var$ox + -3 * $f37945235684ed0b$var$width,
        y: $f37945235684ed0b$var$oy + 0 * $f37945235684ed0b$var$height
    },
    {
        name: "StemaLandingHex",
        realName: "Stema Landing",
        x: $f37945235684ed0b$var$ox + -3 * $f37945235684ed0b$var$width,
        y: $f37945235684ed0b$var$oy + -1 * $f37945235684ed0b$var$height
    },
    {
        name: "GodcroftsHex",
        realName: "Godcrofts",
        x: $f37945235684ed0b$var$ox + 3 * $f37945235684ed0b$var$width,
        y: $f37945235684ed0b$var$oy + 1 * $f37945235684ed0b$var$height
    },
    {
        name: "SableportHex",
        realName: "Sableport",
        x: $f37945235684ed0b$var$ox + -1.5 * $f37945235684ed0b$var$width,
        y: $f37945235684ed0b$var$oy + -1 * $f37945235684ed0b$var$height
    },
    {
        name: "TempestIslandHex",
        realName: "Tempest Island",
        x: $f37945235684ed0b$var$ox + 3 * $f37945235684ed0b$var$width,
        y: $f37945235684ed0b$var$oy + 0 * $f37945235684ed0b$var$height
    },
    {
        name: "ReaversPassHex",
        realName: "Reaver's Pass",
        x: $f37945235684ed0b$var$ox + 2.25 * $f37945235684ed0b$var$width,
        y: $f37945235684ed0b$var$oy + -1.5 * $f37945235684ed0b$var$height
    },
    {
        name: "TheFingersHex",
        realName: "TheFingersHex",
        x: $f37945235684ed0b$var$ox + 3 * $f37945235684ed0b$var$width,
        y: $f37945235684ed0b$var$oy + -1 * $f37945235684ed0b$var$height
    },
    {
        name: "ClahstraHex",
        realName: "The Clahstra",
        x: $f37945235684ed0b$var$ox + 1.5 * $f37945235684ed0b$var$width,
        y: $f37945235684ed0b$var$oy + 0 * $f37945235684ed0b$var$height
    },
    {
        name: "DeadLandsHex",
        realName: "Deadlands",
        x: $f37945235684ed0b$var$ox + 0 * $f37945235684ed0b$var$width,
        y: $f37945235684ed0b$var$oy + 0 * $f37945235684ed0b$var$height
    },
    {
        name: "CallahansPassageHex",
        realName: "Callahan's Passage",
        x: $f37945235684ed0b$var$ox + 0 * $f37945235684ed0b$var$width,
        y: $f37945235684ed0b$var$oy + 1 * $f37945235684ed0b$var$height
    },
    {
        name: "MarbanHollow",
        realName: "Marban Hollow",
        x: $f37945235684ed0b$var$ox + .75 * $f37945235684ed0b$var$width,
        y: $f37945235684ed0b$var$oy + .5 * $f37945235684ed0b$var$height
    },
    {
        name: "UmbralWildwoodHex",
        realName: "Umbral Wildwood",
        x: $f37945235684ed0b$var$ox + 0 * $f37945235684ed0b$var$width,
        y: $f37945235684ed0b$var$oy + -1 * $f37945235684ed0b$var$height
    },
    {
        name: "MooringCountyHex",
        realName: "The Moors",
        x: $f37945235684ed0b$var$ox + -0.75 * $f37945235684ed0b$var$width,
        y: $f37945235684ed0b$var$oy + 1.5 * $f37945235684ed0b$var$height
    },
    {
        name: "HeartlandsHex",
        realName: "Heartlands",
        x: $f37945235684ed0b$var$ox + -0.75 * $f37945235684ed0b$var$width,
        y: $f37945235684ed0b$var$oy + -1.5 * $f37945235684ed0b$var$height
    },
    {
        name: "LochMorHex",
        realName: "Loch M\xf3r",
        x: $f37945235684ed0b$var$ox + -0.75 * $f37945235684ed0b$var$width,
        y: $f37945235684ed0b$var$oy + -0.5 * $f37945235684ed0b$var$height
    },
    {
        name: "LinnMercyHex",
        realName: "Linn of Mercy",
        x: $f37945235684ed0b$var$ox + -0.75 * $f37945235684ed0b$var$width,
        y: $f37945235684ed0b$var$oy + .5 * $f37945235684ed0b$var$height
    },
    {
        name: "ReachingTrailHex",
        realName: "Reaching Trail",
        x: $f37945235684ed0b$var$ox + 0 * $f37945235684ed0b$var$width,
        y: $f37945235684ed0b$var$oy + 2 * $f37945235684ed0b$var$height
    },
    {
        name: "StonecradleHex",
        realName: "Stonecradle",
        x: $f37945235684ed0b$var$ox + -1.5 * $f37945235684ed0b$var$width,
        y: $f37945235684ed0b$var$oy + 1 * $f37945235684ed0b$var$height
    },
    {
        name: "GreatMarchHex",
        realName: "Great March",
        x: $f37945235684ed0b$var$ox + 0 * $f37945235684ed0b$var$width,
        y: $f37945235684ed0b$var$oy + -2 * $f37945235684ed0b$var$height
    },
    {
        name: "AllodsBightHex",
        realName: "Allod's Bight",
        x: $f37945235684ed0b$var$ox + 1.5 * $f37945235684ed0b$var$width,
        y: $f37945235684ed0b$var$oy + -1 * $f37945235684ed0b$var$height
    },
    {
        name: "WeatheredExpanseHex",
        realName: "Weathered Expanse",
        x: $f37945235684ed0b$var$ox + 1.5 * $f37945235684ed0b$var$width,
        y: $f37945235684ed0b$var$oy + 1.0 * $f37945235684ed0b$var$height
    },
    {
        name: "DrownedValeHex",
        realName: "Drowned Vale",
        x: $f37945235684ed0b$var$ox + .75 * $f37945235684ed0b$var$width,
        y: $f37945235684ed0b$var$oy + -0.5 * $f37945235684ed0b$var$height
    },
    {
        name: "ShackledChasmHex",
        realName: "Shackled Chasm",
        x: $f37945235684ed0b$var$ox + .75 * $f37945235684ed0b$var$width,
        y: $f37945235684ed0b$var$oy + -1.5 * $f37945235684ed0b$var$height
    },
    {
        name: "ViperPitHex",
        realName: "Viper Pit",
        x: $f37945235684ed0b$var$ox + .75 * $f37945235684ed0b$var$width,
        y: $f37945235684ed0b$var$oy + 1.5 * $f37945235684ed0b$var$height
    },
    {
        name: "NevishLineHex",
        realName: "Nevish Line",
        x: $f37945235684ed0b$var$ox + -2.25 * $f37945235684ed0b$var$width,
        y: $f37945235684ed0b$var$oy + 1.5 * $f37945235684ed0b$var$height
    },
    {
        name: "AcrithiaHex",
        realName: "Acrithia",
        x: $f37945235684ed0b$var$ox + .75 * $f37945235684ed0b$var$width,
        y: $f37945235684ed0b$var$oy + -2.5 * $f37945235684ed0b$var$height
    },
    {
        name: "RedRiverHex",
        realName: "Red River",
        x: $f37945235684ed0b$var$ox + -0.75 * $f37945235684ed0b$var$width,
        y: $f37945235684ed0b$var$oy + -2.5 * $f37945235684ed0b$var$height
    },
    {
        name: "CallumsCapeHex",
        realName: "Callum's Cape",
        x: $f37945235684ed0b$var$ox + -1.5 * $f37945235684ed0b$var$width,
        y: $f37945235684ed0b$var$oy + 2 * $f37945235684ed0b$var$height
    },
    {
        name: "SpeakingWoodsHex",
        realName: "Speaking Woods",
        x: $f37945235684ed0b$var$ox + -0.75 * $f37945235684ed0b$var$width,
        y: $f37945235684ed0b$var$oy + 2.5 * $f37945235684ed0b$var$height
    },
    {
        name: "BasinSionnachHex",
        realName: "Basin Sionnach",
        x: $f37945235684ed0b$var$ox + 0 * $f37945235684ed0b$var$width,
        y: $f37945235684ed0b$var$oy + 3 * $f37945235684ed0b$var$height
    },
    {
        name: "HowlCountyHex",
        realName: "Howl County",
        x: $f37945235684ed0b$var$ox + .75 * $f37945235684ed0b$var$width,
        y: $f37945235684ed0b$var$oy + 2.5 * $f37945235684ed0b$var$height
    },
    {
        name: "ClansheadValleyHex",
        realName: "Clanshead Valley",
        x: $f37945235684ed0b$var$ox + 1.5 * $f37945235684ed0b$var$width,
        y: $f37945235684ed0b$var$oy + 2 * $f37945235684ed0b$var$height
    },
    {
        name: "MorgensCrossingHex",
        realName: "Morgen's Crossing",
        x: $f37945235684ed0b$var$ox + 2.25 * $f37945235684ed0b$var$width,
        y: $f37945235684ed0b$var$oy + 1.5 * $f37945235684ed0b$var$height
    },
    {
        name: "TerminusHex",
        realName: "Terminus",
        x: $f37945235684ed0b$var$ox + 1.5 * $f37945235684ed0b$var$width,
        y: $f37945235684ed0b$var$oy + -2 * $f37945235684ed0b$var$height
    },
    {
        name: "KalokaiHex",
        realName: "Kalokai",
        x: $f37945235684ed0b$var$ox + 0 * $f37945235684ed0b$var$width,
        y: $f37945235684ed0b$var$oy + -3 * $f37945235684ed0b$var$height
    },
    {
        name: "AshFieldsHex",
        realName: "Ash Fields",
        x: $f37945235684ed0b$var$ox + -1.5 * $f37945235684ed0b$var$width,
        y: $f37945235684ed0b$var$oy + -2 * $f37945235684ed0b$var$height
    },
    {
        name: "OriginHex",
        realName: "Origin",
        x: $f37945235684ed0b$var$ox + -2.25 * $f37945235684ed0b$var$width,
        y: $f37945235684ed0b$var$oy + -1.5 * $f37945235684ed0b$var$height
    }
];
let $f37945235684ed0b$var$regionNameMap = [];
for(var $f37945235684ed0b$var$i = 0; $f37945235684ed0b$var$i < $f37945235684ed0b$var$regions.length; $f37945235684ed0b$var$i++)$f37945235684ed0b$var$regionNameMap[$f37945235684ed0b$var$regions[$f37945235684ed0b$var$i].name] = $f37945235684ed0b$var$regions[$f37945235684ed0b$var$i].realName;
function $f37945235684ed0b$var$APIQuery(URL, success, retryer) {
    $2K9WE$superagent.get(URL).then((res)=>{
        success(res.body);
    }).catch((error)=>{
        if (retryer != null) retryer(error);
    }); // { console.log(error); alert("War API cannot be contacted right now: ".concat(error)); });
}
$f37945235684ed0b$export$2c4e825dc9120f87 = {
    regions: $f37945235684ed0b$var$regions,
    mapRegionName: function(x) {
        return $f37945235684ed0b$var$regionNameMap[x];
    },
    calculateRegion: function(x, y) {
        for(var i = 0; i < $f37945235684ed0b$var$regions.length; i++){
            var region = $f37945235684ed0b$var$regions[i];
            if ($2K9WE$pointinpolygon([
                x - region.x - 128,
                -region.y + y + 128
            ], $f37945235684ed0b$var$regionPolygon)) return region.name;
        }
        return null;
    },
    mapControl: {},
    resources: {},
    remapXY: function(f) {
        var w = 256 / 7;
        var k = w * Math.sqrt(3) / 2;
        if (f == "KingsCageHex") return {
            x: -1.5 * w,
            y: 0
        };
        if (f == "WestgateHex") return {
            x: -2.25 * w,
            y: -0.5 * k
        };
        if (f == "FarranacCoastHex") return {
            x: -2.25 * w,
            y: .5 * k
        };
        if (f == "EndlessShoreHex") return {
            x: 2.25 * w,
            y: -0.5 * k
        };
        if (f == "StlicanShelfHex") return {
            x: 2.25 * w,
            y: .5 * k
        };
        if (f == "OarbreakerHex") return {
            x: -3 * w,
            y: 1 * k
        };
        if (f == "FishermansRowHex") return {
            x: -3 * w,
            y: 0
        };
        if (f == "StemaLandingHex") return {
            x: -3 * w,
            y: -1 * k
        };
        if (f == "GodcroftsHex") return {
            x: 3 * w,
            y: 1 * k
        };
        if (f == "SableportHex") return {
            x: -1.5 * w,
            y: -1 * k
        };
        if (f == "TempestIslandHex") return {
            x: 3 * w,
            y: 0
        };
        if (f == "ReaversPassHex") return {
            x: 2.25 * w,
            y: -1.5 * k
        };
        if (f == "TheFingersHex") return {
            x: 3 * w,
            y: -1 * k
        };
        if (f == "ClahstraHex") return {
            x: 1.5 * w,
            y: 0
        };
        if (f == "DeadLandsHex") return {
            x: 0,
            y: 0
        };
        if (f == "CallahansPassageHex") return {
            x: 0,
            y: 1 * k
        };
        if (f == "MarbanHollow") return {
            x: .75 * w,
            y: .5 * k
        };
        if (f == "UmbralWildwoodHex") return {
            x: 0,
            y: -1 * k
        };
        if (f == "MooringCountyHex") return {
            x: -0.75 * w,
            y: 1.5 * k
        };
        if (f == "HeartlandsHex") return {
            x: -0.75 * w,
            y: -1.5 * k
        };
        if (f == "LochMorHex") return {
            x: -0.75 * w,
            y: -0.5 * k
        };
        if (f == "LinnMercyHex") return {
            x: -0.75 * w,
            y: .5 * k
        };
        if (f == "ReachingTrailHex") return {
            x: 0,
            y: 2 * k
        };
        if (f == "StonecradleHex") return {
            x: -1.5 * w,
            y: 1 * k
        };
        if (f == "GreatMarchHex") return {
            x: 0,
            y: -2 * k
        };
        if (f == "AllodsBightHex") return {
            x: 1.5 * w,
            y: -1 * k
        };
        if (f == "WeatheredExpanseHex") return {
            x: 1.5 * w,
            y: 1.0 * k
        };
        if (f == "DrownedValeHex") return {
            x: .75 * w,
            y: -0.5 * k
        };
        if (f == "ShackledChasmHex") return {
            x: .75 * w,
            y: -1.5 * k
        };
        if (f == "ViperPitHex") return {
            x: .75 * w,
            y: 1.5 * k
        };
        if (f == "NevishLineHex") return {
            x: -2.25 * w,
            y: 1.5 * k
        };
        if (f == "AcrithiaHex") return {
            x: .75 * w,
            y: -2.5 * k
        };
        if (f == "RedRiverHex") return {
            x: -0.75 * w,
            y: -2.5 * k
        };
        if (f == "CallumsCapeHex") return {
            x: -1.5 * w,
            y: 2 * k
        };
        if (f == "SpeakingWoodsHex") return {
            x: -0.75 * w,
            y: 2.5 * k
        };
        if (f == "BasinSionnachHex") return {
            x: 0,
            y: 3 * k
        };
        if (f == "HowlCountyHex") return {
            x: .75 * w,
            y: 2.5 * k
        };
        if (f == "ClansheadValleyHex") return {
            x: 1.5 * w,
            y: 2 * k
        };
        if (f == "MorgensCrossingHex") return {
            x: 2.25 * w,
            y: 1.5 * k
        };
        if (f == "TerminusHex") return {
            x: 1.5 * w,
            y: -2 * k
        };
        if (f == "KalokaiHex") return {
            x: 0,
            y: -3 * k
        };
        if (f == "AshFieldsHex") return {
            x: -1.5 * w,
            y: -2 * k
        };
        if (f == "OriginHex") return {
            x: -2.25 * w,
            y: -1.5 * k
        };
        return {
            x: 0,
            y: 0
        };
    },
    ownership: function(x, y, region) {
        if (!(region in $f37945235684ed0b$export$2c4e825dc9120f87.mapControl)) return "OFFLINE";
        x -= 128;
        y += 128;
        var u = $f37945235684ed0b$export$2c4e825dc9120f87.mapControl[region];
        var distanceSquared = -1;
        var icon = -1;
        var keys = Object.keys(u);
        for (let key of keys){
            var j = u[key];
            if (j.town) {
                var px = j.x;
                var py = j.y;
                var distanceCalculation = (x - px) * (x - px) + (y - py) * (y - py);
                if (distanceSquared < 0 || distanceCalculation < distanceSquared) {
                    control = j.control;
                    icon = j.mapIcon;
                    distanceSquared = distanceCalculation;
                }
            }
        }
        var c = $2K9WE$sakitamgiskriging.predict(x, y, $f37945235684ed0b$export$2c4e825dc9120f87.variogram);
        return {
            ownership: c < -0.25 ? "WARDENS" : c > .25 ? "COLONIALS" : "NONE",
            icon: icon
        };
    },
    control: (x, y)=>{
        return $2K9WE$sakitamgiskriging.predict(x - 128, y + 128, $f37945235684ed0b$export$2c4e825dc9120f87.variogram);
    },
    townHallIcons: [
        35,
        5,
        6,
        7,
        8,
        9,
        10,
        45,
        46,
        47,
        29,
        17,
        34,
        51,
        39,
        12,
        52,
        33,
        18,
        19,
        56,
        57,
        58,
        59,
        60
    ],
    krigingControlPointIcons: [
        /* safe house 35, */ 5,
        6,
        7,
        8,
        9,
        10,
        45,
        46,
        47,
        29,
        56,
        57,
        58,
        59,
        60
    ],
    update: function(completionCallback, shard, retryer) {
        if (shard == null) shard = 'war-service-live';
        $f37945235684ed0b$var$APIQuery("https://".concat(shard).concat(".foxholeservices.com/api/worldconquest/war"), function(war) {
            $f37945235684ed0b$export$2c4e825dc9120f87.war = war;
            //alert(war);
            $f37945235684ed0b$var$APIQuery("https://".concat(shard).concat(".foxholeservices.com/api/worldconquest/maps"), function(maps) {
                // iterate here on the maps and collect status
                var complete = maps.length;
                var p_x = [], p_y = [], p_t = [];
                var xf = 256 / 7;
                var yf = xf * Math.sqrt(3) / 2;
                for(var i = 0; i < maps.length; i++){
                    const mapName = maps[i];
                    $f37945235684ed0b$var$APIQuery("https://".concat(shard).concat(".foxholeservices.com/api/worldconquest/maps/").concat(maps[i]).concat("/dynamic/public"), function(mapData) {
                        if (mapData.mapItems.length > 0) {
                            $f37945235684ed0b$export$2c4e825dc9120f87.mapControl[mapName] = {};
                            $f37945235684ed0b$export$2c4e825dc9120f87.resources[mapName] = {};
                            var offset = $f37945235684ed0b$export$2c4e825dc9120f87.remapXY(mapName);
                            for(var j = 0; j < mapData.mapItems.length; j++){
                                var icon = mapData.mapItems[j].iconType;
                                if ($f37945235684ed0b$export$2c4e825dc9120f87.townHallIcons.includes(icon)) {
                                    var x = mapData.mapItems[j].x;
                                    var y = mapData.mapItems[j].y;
                                    x = x * xf + offset.x - xf * .5;
                                    y = (1 - y) * yf + offset.y - yf * .5;
                                    var key = x.toFixed(3).toString().concat('|').concat(y.toFixed(3).toString());
                                    var control1 = mapData.mapItems[j].teamId;
                                    $f37945235684ed0b$export$2c4e825dc9120f87.mapControl[mapName][key] = {
                                        x: x,
                                        y: y,
                                        control: control1,
                                        mapIcon: icon,
                                        nuked: (mapData.mapItems[j].flags & 0x10) != 0,
                                        town: $f37945235684ed0b$export$2c4e825dc9120f87.krigingControlPointIcons.includes(icon)
                                    };
                                    if ((mapData.mapItems[j].flags & 0x10) == 0 && control1 != "OFFLINE" && $f37945235684ed0b$export$2c4e825dc9120f87.krigingControlPointIcons.includes(icon)) {
                                        p_x.push(x);
                                        p_y.push(y);
                                        p_t.push(control1 == "WARDENS" ? -1 : control1 == "COLONIALS" ? 1 : 0);
                                    }
                                } else {
                                    var x = mapData.mapItems[j].x;
                                    var y = mapData.mapItems[j].y;
                                    x = x * xf + offset.x - xf * .5;
                                    y = (1 - y) * yf + offset.y - yf * .5;
                                    var key = x.toFixed(3).toString().concat('|').concat(y.toFixed(3).toString());
                                    $f37945235684ed0b$export$2c4e825dc9120f87.resources[mapName][key] = {
                                        x: x,
                                        y: y,
                                        control: mapData.mapItems[j].teamId,
                                        mapIcon: icon,
                                        nuked: (mapData.mapItems[j].flags & 0x10) != 0
                                    };
                                }
                            }
                        }
                        if (--complete == 0) {
                            $f37945235684ed0b$export$2c4e825dc9120f87.variogram = $2K9WE$sakitamgiskriging.train(p_t, p_x, p_y, 'exponential', 0, 100);
                            completionCallback();
                        }
                    });
                }
            }, retryer);
        }, retryer);
    }
};

});

parcelRegister("byRwI", function(module, exports) {
//@ts-nocheck
define([
    'leaflet',
    '../towns.json'
], function(L, towns) {
    return {
        FoxholeGeocoder: function(API) {
            var l = Object.keys(towns);
            //for (var i = 0; i < l.length; i++)
            //  towns[l[i]].region = API.calculateRegion(towns[l[i]].x, towns[l[i]].y);
            var FoxholeGeocoder = {
                API: API,
                Towns: towns,
                /* distance between two strings */ levinshtein: function(a, b) {
                    if (a.length == 0) return b.length;
                    if (b.length == 0) return a.length;
                    var matrix = [];
                    // increment along the first column of each row
                    var i;
                    for(i = 0; i <= b.length; i++)matrix[i] = [
                        i
                    ];
                    // increment each column in the first row
                    var j;
                    for(j = 0; j <= a.length; j++)matrix[0][j] = j;
                    // Fill in the rest of the matrix
                    for(i = 1; i <= b.length; i++){
                        for(j = 1; j <= a.length; j++)if (b.charAt(i - 1) == a.charAt(j - 1)) matrix[i][j] = matrix[i - 1][j - 1];
                        else matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)); // deletion
                    }
                    return matrix[b.length][a.length];
                },
                /* The geocoder resolve function, name -> location */ geocode: function(q, callback, context) {
                    var query = q.toLowerCase();
                    var townkey = Object.keys(towns).find((key)=>key.toLowerCase() === query);
                    if (townkey != null) {
                        var town = towns[townkey];
                        let call = callback.bind(context);
                        var value = {
                            center: L.latLng(town.y, town.x),
                            name: query,
                            bbox: L.latLngBounds(L.latLng(town.y, town.x), L.latLng(town.y, town.x))
                        };
                        return call([
                            value
                        ], []);
                    } else {
                        let call = callback.bind(context);
                        return call([], []);
                    }
                },
                lookup: function(q) {
                    var query = "major-".concat(q.toLowerCase());
                    var townkey = Object.keys(towns).find((key)=>key.toLowerCase() === query);
                    if (townkey != null) {
                        var town = towns[townkey];
                        return {
                            x: town.x + 128,
                            y: town.y - 128
                        };
                    }
                    query = "minor-".concat(q.replace(/ \(area\)$/i, '').toLowerCase());
                    townkey = Object.keys(towns).find((key)=>key.toLowerCase() === query);
                    if (townkey != null) {
                        var town = towns[townkey];
                        return {
                            x: town.x + 128,
                            y: town.y - 128
                        };
                    }
                    return null;
                },
                /* The geocoding reverse lookup - nearest point */ reverseExact: function(location) {
                    var region = API.calculateRegion(location.lng, location.lat);
                    location = {
                        lng: location.lng - 128,
                        lat: location.lat + 128
                    };
                    var townlist = Object.keys(towns);
                    if (townlist.length === 0) return null;
                    for(var i = 0; i < townlist.length; i++)if (towns[townlist[i]].region === region) {
                        if (location.lat == towns[townlist[i]].y && location.lng == towns[townlist[i]].x) return towns[townlist[i]].name.concat(towns[townlist[i]].major == 0 ? ' (area)' : '');
                    }
                    return null;
                },
                /* The geocoding reverse lookup - nearest point */ reverse: function(location, scale, callback, context) {
                    var region = API.calculateRegion(location.lng, location.lat);
                    location = {
                        lng: location.lng - 128,
                        lat: location.lat + 128
                    };
                    let call = callback.bind(context);
                    var townlist = Object.keys(towns);
                    if (townlist.length === 0) return call([], []);
                    var distance = -1;
                    var index = -1;
                    for(var i = 0; i < townlist.length; i++)if (towns[townlist[i]].region === region) {
                        var disty = location.lat - towns[townlist[i]].y;
                        var distx = location.lng - towns[townlist[i]].x;
                        var dist_squared = distx * distx + disty * disty;
                        if (distance < 0 || dist_squared < distance) {
                            distance = dist_squared;
                            index = i;
                        }
                    }
                    if (index == -1) return call([], []);
                    var town = towns[townlist[index]];
                    var value = {
                        center: L.latLng(town.y - 128, town.x + 128),
                        name: town.name.concat(town.major == 0 ? ' (area)' : ''),
                        bbox: L.latLngBounds(L.latLng(town.y - 128, town.x + 128), L.latLng(town.y, town.x))
                    };
                    return call([
                        value
                    ], []);
                },
                /* Auto-suggest using indexof and levinshtein distance */ suggest: function(q, callback, context) {
                    var query = q.toLowerCase();
                    let call = callback.bind(context);
                    var townlist = Object.keys(towns);
                    if (townlist.length === 0) return call([], []);
                    var results = [];
                    for(var i = 0; i < townlist.length; i++){
                        var townname = towns[townlist[i]].name.toLowerCase();
                        if (townname.indexOf(query) >= 0) {
                            var d = FoxholeGeocoder.levinshtein(query, townname);
                            results.push({
                                key: townlist[i],
                                name: towns[townlist[i]].name.concat(towns[townlist[i]].major == 0 ? " (area)" : ""),
                                distance: d
                            });
                        }
                    }
                    results.sort((x)=>x.distance);
                    var output = [];
                    for(var i = 0; i < 5 && i < results.length; i++){
                        var town = towns[results[i].key];
                        output.push({
                            center: L.latLng(town.y - 128, town.x + 128),
                            name: results[i].name,
                            bbox: L.latLngBounds(L.latLng(town.y - 128, town.x + 128), L.latLng(town.y - 128, town.x + 128))
                        });
                    }
                    return call(output, []);
                }
            };
            return FoxholeGeocoder;
        }
    };
});

});

parcelRegister("b0mzB", function(module, exports) {
//@ts-nocheck
define(null, function() {
    return {
        Narrator: function() {
            var ss = window.speechSynthesis;
            var voices = window.speechSynthesis.getVoices();
            var selected_voice = voices[0]; //Math.round(Math.random() * 1000).toFixed() % voices.length];
            var Narrator = {
                speechSynthesis: ss,
                voices: voices,
                selectedVoice: selected_voice,
                instructions: [],
                currentInstruction: -1,
                paused: false,
                speed: 1.0,
                setSpeed: function(speed) {
                    Narrator.speed = speed;
                },
                speak: function(text) {
                    var utter = new SpeechSynthesisUtterance();
                    utter.rate = 1.2;
                    utter.pitch = 1.0;
                    utter.volume = .5;
                    utter.text = text;
                    utter.voice = Narrator.selectedVoice;
                    Narrator.speechSynthesis.speak(utter);
                },
                clearInstructions: function() {
                    Narrator.instructions = [];
                    this.currentInstruction = -1;
                },
                giveDirections: function(instructions) {
                    var time = 0;
                    if (instructions.length == Narrator.instructions.length) {
                        var clear = false;
                        for(var i = 0; i < instructions.length; i++)if (instructions[i] != Narrator.instructions[i]) {
                            clear = true;
                            break;
                        }
                    }
                    //if (clear)
                    Narrator.clearInstructions();
                    for(var i = 0; i < instructions.length; i++){
                        var direction = instructions[i];
                        var text = direction.text.split(/\|/)[1];
                        var border = instructions[i].border;
                        var delta = i == 0 ? 0.0 : instructions[i - 1].distance / 35000.0 * 3600.0;
                        if (border) {
                            Narrator.instructions.push({
                                time: delta,
                                text: "You are approaching a border crossing, check your radio"
                            });
                            Narrator.instructions.push({
                                time: 0,
                                text: text
                            });
                        } else Narrator.instructions.push({
                            time: delta,
                            text: text
                        });
                        time += delta;
                    }
                    Narrator.queueNextInstruction();
                },
                pauseNarration: function() {},
                resumeNarration: function() {},
                queueNextInstruction: function() {
                    if (Narrator.instructions === null || Narrator.instructions.length == 0) return;
                    var index = ++Narrator.currentInstruction;
                    var f = document.getElementsByClassName("narrator-step-".concat(index - 1));
                    if (f != null && f.length > 0) {
                        f[0].style.background = null;
                        f[0].style.color = null;
                    }
                    var f = document.getElementsByClassName("narrator-step-".concat(index));
                    if (f != null && f.length > 0) {
                        f[0].style.background = "#666666";
                        f[0].style.color = "#FFFFFF";
                    }
                    const direction = Narrator.instructions[index];
                    setTimeout(function() {
                        Narrator.queueNextInstruction();
                        Narrator.speak(direction.text);
                    }, direction.time * 1000.0 / Narrator.speed);
                }
            };
            return Narrator;
        }
    };
});

});

parcelRegister("5wF0h", function(module, exports) {

$parcel$export(module.exports, "Panel", () => $fa18b56bd4e30c38$export$2ddb90ad54e5f587, (v) => $fa18b56bd4e30c38$export$2ddb90ad54e5f587 = v);
//@ts-nocheck
var $fa18b56bd4e30c38$export$2ddb90ad54e5f587;
define([
    'leaflet',
    './Itinerary.js',
    'jquery'
], function(L, Itinerary, $) {
    class custom_time_formatter extends L.Routing.Formatter {
        constructor(FHR){
            super();
            this.FoxholeRouter = FHR;
        }
        formatTime(distance) {
            var time = distance * this.FoxholeRouter.truckSpeed;
            var t1 = L.Routing.Formatter.prototype.formatTime.call(this, time);
            var t2 = L.Routing.Formatter.prototype.formatTime.call(this, time);
            var jeep_time = distance * this.FoxholeRouter.jeepSpeed;
            var t3 = L.Routing.Formatter.prototype.formatTime.call(this, jeep_time);
            var t4 = L.Routing.Formatter.prototype.formatTime.call(this, jeep_time);
            var flatbed_time = distance * this.FoxholeRouter.flatbedSpeed;
            var t5 = L.Routing.Formatter.prototype.formatTime.call(this, flatbed_time);
            var t6 = L.Routing.Formatter.prototype.formatTime.call(this, flatbed_time);
            var htd_time = distance * this.FoxholeRouter.htdSpeed;
            var t7 = L.Routing.Formatter.prototype.formatTime.call(this, htd_time);
            var a = "<div class=\'detailed-routeinfo\'><table class=\"vehicle-speed-panel\">";
            a = a.concat("<tr>");
            a = a.concat("<td style=\"text-align: right\"><img src=\'Truck.webp\' class='fast-truck' /></td>");
            a = a.concat("<td style=\"text-align: left\">").concat(t2).concat("</td>");
            a = a.concat("<td style=\"text-align: right\"><img src=\'Flatbed.webp\' class='fast-truck' /></td>");
            a = a.concat("<td style=\"text-align: left\">").concat(t6).concat("</td>");
            a = a.concat("<td style=\"text-align: right\"><img src=\'HTD.webp\' class='slowest-truck' /></td>");
            a = a.concat("<td style=\"text-align: left\">").concat(t7).concat("</td>");
            a = a.concat("</tr>");
            a = a.concat("</table></div>");
            return a;
        }
        formatDistance(d, precision) {
            if (typeof d === 'object') {
                let a = L.Routing.Formatter.prototype.formatDistance.call(this, d.distance, precision).replace(' ', '');
                if (d.breakdown[2] > 0) a = a.concat('<div class="roadtier" style="width: 100%"><div style="background-color: #957458; width: ').concat(d.breakdown[2] * 100.0).concat('%"><span>Gravel/Paved&nbsp;(').concat(Math.round(d.breakdown[2] * 100.0)).concat('%)</span></div></div>');
                if (d.breakdown[1] > 0) a = a.concat('<div class="roadtier" style="width: 100%"><div style="background-color: #94954e; width: ').concat(d.breakdown[1] * 100.0).concat('%"><span>Dirt&nbsp;(').concat(Math.round(d.breakdown[1] * 100.0)).concat('%)</span></div></div>');
                if (d.breakdown[0] > 0) a = a.concat('<div class="roadtier" style="width: 100%"><div style="background-color: #eee;  width: ').concat(d.breakdown[0] * 100.0).concat('%"><span>Mud&nbsp;(').concat(Math.round(d.breakdown[0] * 100.0)).concat('%)</span></div></div>');
                return a;
            } else return L.Routing.Formatter.prototype.formatDistance.call(this, d, precision).replace(' ', '');
        }
    }
    var prototype = Itinerary.extend({
        options: {
            fitSelectedRoutes: 'smart',
            routeLine: function(route, options) {
                return new Line(route, options);
            },
            autoRoute: true,
            routeWhileDragging: false,
            routeDragInterval: 500,
            waypointMode: 'connect',
            showAlternatives: false,
            defaultErrorHandler: function(e) {
                console.error('Routing error:', e.error);
            }
        },
        initialize: function(options) {
            L.Util.setOptions(this, options);
            this._router = this.options.router || new OSRMv1(options);
            this._plan = this.options.plan || new Plan(this.options.waypoints, options);
            this._requestCount = 0;
            Itinerary.prototype.initialize.call(this, options);
            this.on('routeselected', this._routeSelected, this);
            if (this.options.defaultErrorHandler) this.on('routingerror', this.options.defaultErrorHandler);
            this._plan.on('waypointschanged', this._onWaypointsChanged, this);
            if (options.routeWhileDragging) this._setupRouteDragging();
        },
        _onZoomEnd: function() {
            if (!this._selectedRoute || !this._router.requiresMoreDetail) return;
            var map = this._map;
            if (this._router.requiresMoreDetail(this._selectedRoute, map.getZoom(), map.getBounds())) this.route({
                callback: L.bind(function(err, routes) {
                    var i;
                    if (!err) {
                        for(i = 0; i < routes.length; i++)this._routes[i].properties = routes[i].properties;
                        this._updateLineCallback(err, routes);
                    }
                }, this),
                simplifyGeometry: false,
                geometryOnly: true
            });
        },
        onAdd: function(map) {
            if (this.options.autoRoute) this.route();
            var container = L.Routing.Itinerary.prototype.onAdd.call(this, map);
            this._map = map;
            this._map.addLayer(this._plan);
            this._map.on('zoomend', this._onZoomEnd, this);
            if (this._plan.options.geocoder) container.insertBefore(this._plan.createGeocoders(), container.firstChild);
            return container;
        },
        onRemove: function(map) {
            map.off('zoomend', this._onZoomEnd, this);
            if (this._line) map.removeLayer(this._line);
            map.removeLayer(this._plan);
            if (this._alternatives && this._alternatives.length > 0) for(var i = 0, len = this._alternatives.length; i < len; i++)map.removeLayer(this._alternatives[i]);
            return Itinerary.prototype.onRemove.call(this, map);
        },
        selectedRoute: null,
        getWaypoints: function() {
            return this._plan.getWaypoints();
        },
        setWaypoints: function(waypoints) {
            this._plan.setWaypoints(waypoints);
            return this;
        },
        spliceWaypoints: function() {
            var removed = this._plan.spliceWaypoints.apply(this._plan, arguments);
            return removed;
        },
        getPlan: function() {
            return this._plan;
        },
        getRouter: function() {
            return this._router;
        },
        _routeSelected: function(e) {
            var route = this._selectedRoute = e.route, alternatives = this.options.showAlternatives && e.alternatives, fitMode = this.options.fitSelectedRoutes, fitBounds = fitMode === 'smart' && !this._waypointsVisible() || fitMode !== 'smart' && fitMode;
            this._updateLines({
                route: route,
                alternatives: alternatives
            });
            if (fitBounds) this._map.fitBounds(this._line.getBounds());
            if (this.options.waypointMode === 'snap') {
                this._plan.off('waypointschanged', this._onWaypointsChanged, this);
                this.setWaypoints(route.waypoints);
                this._plan.on('waypointschanged', this._onWaypointsChanged, this);
            }
        },
        _waypointsVisible: function() {
            var wps = this.getWaypoints(), mapSize, bounds, boundsSize, i, p;
            try {
                mapSize = this._map.getSize();
                for(i = 0; i < wps.length; i++){
                    p = this._map.latLngToLayerPoint(wps[i].latLng);
                    if (bounds) bounds.extend(p);
                    else bounds = L.bounds([
                        p
                    ]);
                }
                boundsSize = bounds.getSize();
                return (boundsSize.x > mapSize.x / 5 || boundsSize.y > mapSize.y / 5) && this._waypointsInViewport();
            } catch (e) {
                return false;
            }
        },
        _waypointsInViewport: function() {
            var wps = this.getWaypoints(), mapBounds, i;
            try {
                mapBounds = this._map.getBounds();
            } catch (e) {
                return false;
            }
            for(i = 0; i < wps.length; i++){
                if (mapBounds.contains(wps[i].latLng)) return true;
            }
            return false;
        },
        _updateLines: function(routes) {
            var addWaypoints = this.options.addWaypoints !== undefined ? this.options.addWaypoints : true;
            this._clearLines();
            // add alternatives first so they lie below the main route
            this._alternatives = [];
            if (routes.alternatives) routes.alternatives.forEach(function(alt, i) {
                this._alternatives[i] = this.options.routeLine(alt, L.extend({
                    isAlternative: true
                }, this.options.altLineOptions || this.options.lineOptions));
                this._alternatives[i].addTo(this._map);
                this._hookAltEvents(this._alternatives[i]);
            }, this);
            this._line = this.options.routeLine(routes.route, L.extend({
                addWaypoints: addWaypoints,
                extendToWaypoints: this.options.waypointMode === 'connect'
            }, this.options.lineOptions));
            this._line.addTo(this._map);
            this._hookEvents(this._line);
        },
        _hookEvents: function(l) {
            l.on('linetouched', function(e) {
                if (e.afterIndex < this.getWaypoints().length - 1) this._plan.dragNewWaypoint(e);
            }, this);
        },
        _hookAltEvents: function(l) {
            l.on('linetouched', function(e) {
                var alts = this._routes.slice();
                var selected = alts.splice(e.target._route.routesIndex, 1)[0];
                this.fire('routeselected', {
                    route: selected,
                    alternatives: alts
                });
            }, this);
        },
        _onWaypointsChanged: function(e) {
            if (this.options.autoRoute) this.route({});
            if (!this._plan.isReady()) {
                this._clearLines();
                this._clearAlts();
            }
            this.fire('waypointschanged', {
                waypoints: e.waypoints
            });
        },
        _setupRouteDragging: function() {
            var timer = 0, waypoints;
            this._plan.on('waypointdrag', L.bind(function(e) {
                waypoints = e.waypoints;
                if (!timer) timer = setTimeout(L.bind(function() {
                    this.route({
                        waypoints: waypoints,
                        geometryOnly: true,
                        callback: L.bind(this._updateLineCallback, this)
                    });
                    timer = undefined;
                }, this), this.options.routeDragInterval);
            }, this));
            this._plan.on('waypointdragend', function() {
                if (timer) {
                    clearTimeout(timer);
                    timer = undefined;
                }
                this.route();
            }, this);
        },
        _updateLineCallback: function(err, routes) {
            if (!err) {
                routes = routes.slice();
                var selected = routes.splice(this._selectedRoute.routesIndex, 1)[0];
                this._updateLines({
                    route: selected,
                    alternatives: this.options.showAlternatives ? routes : []
                });
            } else if (err.type !== 'abort') this._clearLines();
        },
        route: function(options) {
            var ts = ++this._requestCount, wps;
            if (this._pendingRequest && this._pendingRequest.abort) {
                this._pendingRequest.abort();
                this._pendingRequest = null;
            }
            options = options || {};
            if (this._plan.isReady()) {
                if (this.options.useZoomParameter) options.z = this._map && this._map.getZoom();
                wps = options && options.waypoints || this._plan.getWaypoints();
                this.fire('routingstart', {
                    waypoints: wps
                });
                this._pendingRequest = this._router.route(wps, function(err, routes) {
                    this._pendingRequest = null;
                    if (options.callback) return options.callback.call(this, err, routes);
                    // Prevent race among multiple requests,
                    // by checking the current request's count
                    // against the last request's; ignore result if
                    // this isn't the last request.
                    if (ts === this._requestCount) {
                        this._clearLines();
                        this._clearAlts();
                        if (err && err.type !== 'abort') {
                            this.fire('routingerror', {
                                error: err
                            });
                            return;
                        }
                        routes.forEach(function(route, i) {
                            route.routesIndex = i;
                        });
                        if (!options.geometryOnly) {
                            this.fire('routesfound', {
                                waypoints: wps,
                                routes: routes
                            });
                            this.setAlternatives(routes);
                        } else {
                            var selectedRoute = routes.splice(0, 1)[0];
                            this._routeSelected({
                                route: selectedRoute,
                                alternatives: routes
                            });
                        }
                    }
                }, this, options);
            }
        },
        _clearLines: function() {
            if (this._line) {
                this._map.removeLayer(this._line);
                delete this._line;
            }
            if (this._alternatives && this._alternatives.length) {
                for(var i in this._alternatives)this._map.removeLayer(this._alternatives[i]);
                this._alternatives = [];
            }
        }
    });
    class PanelFormatter extends L.Routing.ItineraryBuilder {
        constructor(API){
            super();
            this.index = 0;
            this.counter = 1;
            this.first = true;
            this.API = API;
        }
        createStep(text, distance, steps) {
            var region;
            var border = 0;
            var newRegion = false;
            var turnicon = "";
            if (text.indexOf("|") >= 0) {
                var u = text.split("\|");
                region = u[0];
                text = u[1];
                border = parseInt(u[2]);
                newRegion = parseInt(u[3]) === 1;
                turnicon = u[4];
            } else region = "";
            if (newRegion || this.first) {
                var container2 = document.createElement("TR");
                container2.style.padding = ".1em 2px";
                var divider2 = document.createElement("TD");
                divider2.setAttribute("colspan", "2");
                divider2.innerText = this.API.mapRegionName(region);
                divider2.style["font-size"] = "normal";
                divider2.style.width = "100%";
                divider2.style["pointer-events"] = "none";
                container2.appendChild(divider2);
                this.block.appendChild(container2);
                this.first = false;
            }
            if (border === 1) {
                var container3 = document.createElement("TR");
                container3.style.padding = ".1em 2px";
                var divider3 = document.createElement("TD");
                divider3.setAttribute("colspan", "2");
                divider3.innerText = "You are approaching a border crossing, check your radio";
                divider3.style = "font-size: x-small; width: 100%";
                divider3.style["padding-left"] = "2em";
                container3.appendChild(divider3);
                this.block.appendChild(container3);
            }
            var container = document.createElement("TR");
            container.classList.add("narrator-step-".concat((this.counter++).toString()));
            container.classList.add("narrator-steps");
            container.style.padding = ".1em 2px";
            var divider2 = document.createElement("TD");
            if (turnicon != "" && turnicon != null && window.beta) divider2.innerHTML = "<div class=\"".concat(turnicon.replace(' ', '-').toLowerCase()).concat('"></div>');
            var divider1 = document.createElement("TD");
            if (border === 1) divider1.innerText = text.concat(" and cross the border");
            else divider1.innerText = text;
            divider1.style = "font-size: x-small; width: 100%";
            divider1.style["padding-left"] = "2em";
            container.appendChild(divider2);
            container.appendChild(divider1);
            container.index = this.index++;
            this.block.appendChild(container);
            return container;
        }
        createContainer(className) {
            var table = document.createElement("TABLE");
            table.setAttribute("style", "width: 100%");
            if (className != null) table.setAttribute("class", className.concat(" ").concat("detailed-routeinfo"));
            else table.setAttribute("class", "detailed-routeinfo");
            this.container = table;
            return this.container;
        }
        createStepsContainer(container) {
            this.block = L.Routing.ItineraryBuilder.prototype.createStepsContainer(container);
            this.container.appendChild(this.block);
            return this.block;
        }
    }
    let panelFn = (API, Router, Geocoder)=>{
        let pp = new prototype({
            showAlternatives: false,
            show: false,
            routeWhileDragging: false,
            router: Router,
            autoRoute: true,
            geocoder: Geocoder,
            plan: new L.Routing.Plan([], {
                maxGeocoderTolerance: 100000000,
                geocoder: Geocoder,
                reverseWaypoints: true
            }),
            routeLine: function(route, options) {
                if (route.name == "Shortest Route") return L.Routing.line(route, {
                    addWaypoints: options.addWaypoints,
                    styles: [
                        {
                            color: 'black',
                            opacity: 0.15,
                            weight: 7
                        },
                        {
                            color: 'white',
                            opacity: 0.8,
                            weight: 6
                        },
                        {
                            color: '#9E3031',
                            opacity: 1,
                            weight: 2,
                            dashArray: '10,10'
                        }
                    ]
                });
                return L.Routing.line(route, {
                    addWaypoints: options.addWaypoints,
                    styles: [
                        {
                            color: 'black',
                            opacity: 0.15,
                            weight: 7
                        },
                        {
                            color: 'white',
                            opacity: 0.8,
                            weight: 6
                        },
                        {
                            color: '#5E9339',
                            opacity: 1,
                            weight: 2,
                            dashArray: '10,10'
                        }
                    ]
                });
            },
            fitSelectedRoutes: false,
            itineraryBuilder: new PanelFormatter(API),
            summaryTemplate: Router.summaryTemplate,
            collapsible: true,
            formatter: new custom_time_formatter(Router)
        });
        pp.on('routeselected', (e)=>pp.routeSelected = e.route);
        return pp;
    };
    $fa18b56bd4e30c38$export$2ddb90ad54e5f587 = panelFn;
    return {
        Panel: panelFn
    };
});

});

parcelRegister("5yves", function(module, exports) {
module.exports = JSON.parse("{\"Able\":\"war-service-live\",\"Charlie\":\"war-service-live-3\"}");

});


$parcel$defineInteropFlag(module.exports);

$parcel$export(module.exports, "default", () => $882b6d93070905b3$export$2e2bcd8739ae039);
//@ts-nocheck
'use strict';









var $882b6d93070905b3$export$2e2bcd8739ae039 = ()=>{
    $parcel$global.L = $2K9WE$leaflet;
    $parcel$global.$ = $2K9WE$jquery;
    $parcel$global.VectorControlGrid = {
        Create: (MaxNativeZoom, MaxZoom, Offset, API, RoadWidth, ControlWidth, GridDepth)=>(parcelRequire("alnMM")).Create(MaxNativeZoom, MaxZoom, Offset, API, RoadWidth, ControlWidth, GridDepth)
    };
    $parcel$global.VectorTextGrid = {
        Create: (MaxZoom, Offset)=>(parcelRequire("60CBY")).Create(MaxZoom, Offset)
    };
    $parcel$global.FoxholeRouter = {
        Create: (mymap, API, Narrator)=>new undefined('./IRouter.js').FoxholeRouter(mymap, API, Narrator)
    };
    $parcel$global.API = {
        Create: ()=>(parcelRequire("XuuxV")).API
    };
    $parcel$global.FoxholeGeocoder = {
        Create: (API)=>(parcelRequire("byRwI")).FoxholeGeocoder(API)
    };
    $parcel$global.Narrator = {
        Create: ()=>(parcelRequire("b0mzB")).Narrator()
    };
    $parcel$global.Panel = {
        Create: (APIManager, Router, Geocoder)=>(parcelRequire("5wF0h")).Panel(APIManager, Router, Geocoder)
    };
    $parcel$global.Shards = (parcelRequire("5yves"));
};


//# sourceMappingURL=FoxholeRouter.js.map
