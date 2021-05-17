define(['leaflet', 'intersects'],
    function (L, intersects) {

        var VectorIconGridPrototype = L.GridLayer.extend({

            disabledIcons: {},

            zoomScale: function (zoom) { return .65 * (1 + this.max_zoom - zoom); },

            shadowSize: 20,

            disableIcons: function (icons) {
                for (var i of icons)
                    this.disabledIcons[i] = true;
            },

            enableIcons: function (icons) {
                for (var i of icons)
                    delete this.disabledIcons[i];
            },

            createTile: function (coords, done) {

                function makeOnLoadCallback(icon, u) {
                    return function () {
                        var callbacks = u.imageCache[icon].callbacks;
                        for (var i = 0; i < callbacks.length; i++)
                            callbacks[i]();
                    };
                }

                function makeRenderCallback(u, icon, ctx, img, lx, ly, lw, lh, done, tile, glow, shadow) {
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
                        //ctx.drawImage(img.image, lx, ly, lw, lh);
                        if (--tile.pendingLoad == 0) {
                            setTimeout(() => done(null, tile), 0);
                            delete img.callbacks;
                        }
                    };
                }

                var raw_scale = this.zoomScale(coords.z);
                var hd_ratio = 1;
                var size = this.getTileSize();
                var tile = L.DomUtil.create('canvas', 'leaflet-tile');
                tile.width = size.x * hd_ratio;
                tile.height = size.y * hd_ratio;

                tile.style.width = (size.x * hd_ratio).toString().concat("px");
                tile.style.height = (size.y * hd_ratio).toString().concat("px");

                ctx = tile.getContext('2d');

                var zoom = Math.pow(2, coords.z);
                var max = Math.pow(2, this.max_zoom);

                tile.pendingLoad = 0;

                const shadowSize = 20;

                for (var j of this.sources) {

                    if (coords.z >= j.zoomMin && coords.z < j.zoomMax && j.icon != null && !(j.icon in this.disabledIcons)) {

                        var scale = raw_scale;
                        let shadow = j.glow ? shadowSize * hd_ratio * scale * zoom / max : 0;

                        var label_w = j.size.width * zoom * scale * hd_ratio;
                        var label_h = j.size.height * zoom * scale * hd_ratio;
                        var label_x = j.x * zoom * hd_ratio - coords.x * tile.width - label_w * .5;
                        var label_y = j.y * zoom * hd_ratio - coords.y * tile.height - label_h * .5;


                        if (intersects.boxBox(0, 0, tile.width, tile.height, label_x - 2.0 * shadow, label_y - 2.0 * shadow, label_w + 4.0 * shadow, label_h + 4.0 * shadow)) {
                            var icon = j.icon;
                            var lx = label_x, ly = label_y, lw = label_w, lh = label_h;
                            if (icon in this.imageCache) {
                                var img = this.imageCache[icon];
                                if (img.image.complete) {
                                    if (j.glow) {
                                        ctx.filter = "brightness(0.5) sepia(1) hue-rotate(296deg) saturate(10000%) blur(".concat(shadow).concat("px)"); // blur(10px)
                                        ctx.drawImage(img.image, lx, ly, lw, lh);
                                        ctx.drawImage(img.image, lx, ly, lw, lh);
                                        ctx.drawImage(img.image, lx, ly, lw, lh);
                                        ctx.filter = "none";
                                    }
                                    else
                                        ctx.drawImage(img.image, lx, ly, lw, lh);
                                }
                                else {
                                    img.callbacks.push(makeRenderCallback(this, icon, ctx, img, lx, ly, lw, lh, done, tile, j.glow, shadow));
                                    tile.pendingLoad++;
                                }
                            }
                            else {
                                tile.pendingLoad++;
                                var img = { image: new Image() };
                                img.callbacks = [makeRenderCallback(this, icon, ctx, img, lx, ly, lw, lh, done, tile, j.glow, shadow)];
                                this.imageCache[icon] = img;
                                img.image.src = 'MapIcons/'.concat(j.icon);
                                img.image.onload = makeOnLoadCallback(icon, this);
                            }
                        }
                    }
                }
                if (tile.pendingLoad == 0)
                    setTimeout(() => done(null, tile), 0);
                return tile;
            }
        });

        return {
            Create: function (MaxZoom, Offset) {
                var u = new VectorIconGridPrototype({ updateWhenZooming: false });
                var size = u.getTileSize();
                u.sources = [];
                u.max_zoom = MaxZoom;
                u.offset = Offset;
                u.grid_x_size = Math.pow(2, MaxZoom);
                u.grid_x_width = size.x / u.grid_x_size;
                u.grid_y_size = Math.pow(2, MaxZoom);
                u.grid_y_height = size.y / u.grid_y_size;
                u.Offset = Offset;
                u.imageCache = {};
                u.addIcon = (icon, x, y, glow, zoomMin, zoomMax) => {
                    u.sources.push(
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
                return u;
            }
        }
    });