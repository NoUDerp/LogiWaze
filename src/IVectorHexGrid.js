define(['leaflet', 'intersects'],
    function (L, intersects) {

        var VectorHexGridPrototype = L.GridLayer.extend({

            draw: true,

            shadowSize: 20,

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

            createTile: function (coords) {

                var hd_ratio = 1;
                var size = this.getTileSize();
                var tile = L.DomUtil.create('canvas', 'leaflet-tile');
                tile.width = size.x * hd_ratio;
                tile.height = size.y * hd_ratio;

                tile.style.width = (size.x * hd_ratio).toString().concat("px");
                tile.style.height = (size.y * hd_ratio).toString().concat("px");

                if (!this.draw)
                    return tile;

                ctx = tile.getContext('2d');
                var zoom = Math.pow(2, coords.z);

                var u = this;
                var lineWidth = .2 * Math.pow(2, coords.z);
                var shadow = lineWidth * .5 / Math.pow(2, this.max_zoom);

                ctx.strokeStyle = '#303030';
                ctx.opacity = .8;

                for (var j of u.sources) {

                    var label_w = j.size.width * zoom * hd_ratio + shadow * 2;
                    var label_h = j.size.height * zoom * hd_ratio + shadow * 2;
                    var label_x = j.x * zoom * hd_ratio - coords.x * tile.width - label_w - shadow;
                    var label_y = j.y * zoom * hd_ratio - coords.y * tile.height - label_h - shadow;


                    if (intersects.boxBox(0, 0, tile.width, tile.height, label_x, label_y, label_w, label_h))
                        this.drawHex(tile, ctx, label_x + label_w * .5, label_y + label_h * .5, label_w * .5, label_h * .5, lineWidth);
                }
                return tile;
            }
        });

        return {
            Create:  (MaxZoom, Offset) => {
                var u = new VectorHexGridPrototype({ updateWhenZooming: false, noWrap: true });
                var size = u.getTileSize();
                u.sources = [];
                u.max_zoom = MaxZoom;
                u.offset = Offset;
                u.grid_x_size = Math.pow(2, MaxZoom);
                u.grid_x_width = size.x / u.grid_x_size;
                u.grid_y_size = Math.pow(2, MaxZoom);
                u.grid_y_height = size.y / u.grid_y_size;
                u.Offset = Offset;
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