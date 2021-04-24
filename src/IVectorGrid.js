define(['leaflet', 'intersects'],
    function (L, intersects) {
        var VectorGridPrototype = L.GridLayer.extend(
            {
                controls: [true, true, false, true],

                quality: true,

                createTile: function (coords, done) {

                    var size = this.getTileSize();
                    var tile = null;
                    tile = L.DomUtil.create('canvas', 'leaflet-tile');
                    tile.width = size.x;
                    tile.height = size.y;
                    let ctx = tile.getContext('2d');

                    ctx.lineJoin = 'miter';
                    ctx.lineCap = 'round';

                    var scale = Math.pow(2, this.max_zoom - coords.z);
                    var start_x = Math.floor(coords.x * scale);;
                    var start_y = Math.floor(coords.y * scale);

                    var end_x = Math.ceil((coords.x + 1) * scale);
                    var end_y = Math.ceil((coords.y + 1) * scale);

                    var depth_inverse = Math.pow(2, coords.z);
                    var sources = this.sources;
                    var offset = this.offset;
                    var outerWidth = this.RoadWidth * depth_inverse;
                    var innerWidth = this.ControlWidth * depth_inverse;
                    var grid_x_size = this.grid_x_size;
                    var grid_y_size = this.grid_y_size;
                    var controls = this.controls;
                    var quality = this.quality;
                    function draw(i, start_x, start_y, end_x, end_y, x, y, step) {
                        var startTime = Date.now();
                        if (step == 1) {
                            if (quality) {

                                var tiers = ['', '#957458', '#94954e', '#5a9565'];
                                ctx.lineWidth = outerWidth;
                                //initialize x = start_x, y = start_y
                                for (; y < end_y; y++, x = start_x)
                                    for (; x < end_x; x++, i = 0) {

                                        if (x >= 0 && y >= 0 && x < grid_x_size && y < grid_y_size) {
                                            for (; i < sources[x][y].length; i++) {

                                                var j = sources[x][y][i];
                                                ctx.strokeStyle = tiers[j.options.tier];
                                                ctx.beginPath();
                                                var coordsx = coords.x * tile.width;
                                                var coordsy = coords.y * tile.height;
                                                var x1 = (j.points[0][1] + offset[0]) * depth_inverse - coordsx;
                                                var y1 = (j.points[0][0] + offset[1]) * depth_inverse - coordsy;
                                                var x2 = (j.points[1][1] + offset[0]) * depth_inverse - coordsx;
                                                var y2 = (j.points[1][0] + offset[1]) * depth_inverse - coordsy;
                                                ctx.moveTo(x1, y1);
                                                ctx.lineTo(x2, y2);
                                                ctx.stroke();
                                                if (Date.now() - startTime > 5) {
                                                    setTimeout(() => draw(i, start_x, start_y, end_x, end_y, x, y, step), 0);
                                                    return;
                                                }
                                            }
                                        }
                                        if (Date.now() - startTime > 5) {
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
                            var colors = ['#516C4B', '#235683', '#505050', '#CCCC44'];

                            for (; y <= end_y; y++, x = start_x)
                                for (; x <= end_x; x++, i = 0)
                                    if (x >= 0 && y >= 0 && x < grid_x_size && y < grid_y_size) {
                                        for (; i < sources[x][y].length; i++) {
                                            var j = sources[x][y][i];
                                            if (controls[j.options.control]) {
                                                ctx.strokeStyle = colors[j.options.control];
                                                ctx.beginPath();
                                                var coordsx = coords.x * tile.width;
                                                var coordsy = coords.y * tile.height;
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
                            done(null, tile);
                        }
                    }

                    setTimeout(() => draw(0, start_x, start_y, end_x, end_y, start_x, start_y, 1), 0);

                    return tile;
                }
            });

        return {
            Create: (MaxZoom, Offset, RoadWidth, ControlWidth) => {

                var u = new VectorGridPrototype({ updateWhenZooming: false, noWrap: true });
                var size = u.getTileSize();

                u.RoadWidth = RoadWidth;
                u.ControlWidth = ControlWidth;
                u.sources = [];
                u.hashes = [];
                u.max_zoom = MaxZoom;
                u.offset = Offset;
                u.grid_x_size = Math.pow(2, MaxZoom);
                u.grid_x_width = size.x / u.grid_x_size;
                u.grid_y_size = Math.pow(2, MaxZoom);
                u.grid_y_height = size.y / u.grid_y_size;

                var max_road_width = Math.max(RoadWidth, ControlWidth);

                var margin = max_road_width * Math.pow(2, MaxZoom);
                var max = Math.pow(2, MaxZoom);
                for (var x = 0; x < u.grid_x_size; x++) {
                    u.sources.push([]);
                    u.hashes.push([]);
                    for (var y = 0; y < u.grid_y_size; y++) {
                        u.sources[x].push([]);
                        u.hashes[x].push({});
                    }
                }

                var marginx = margin / u.grid_x_size;
                var marginy = margin / u.grid_y_size;

                var addLine = (x, y, p, options, u, Offset) => {
                    if (x >= 0 && y >= 0 && x < u.grid_x_size && y < u.grid_y_size)
                        u.sources[x][y].push({ points: p, options: options });
                };

                var gx = 1.0 / u.grid_x_width;
                var gy = 1.0 / u.grid_y_height;

                u.addRoad = (points, options) => {

                    var c = [[-points[0][0] - 256, points[0][1]], [-points[1][0] - 256, points[1][1]]]
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
                return u;
            }
        }
    });