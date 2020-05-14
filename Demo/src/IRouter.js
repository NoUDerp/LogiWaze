define(['leaflet', 'json-loader!../../Mapped/Unified.fitted-for-leaflet.geojson', 'json-loader!../../hex.geojson', './geojson-path-finder/index.js', '../towns.json', 'leaflet-routing-machine'], function (L, Paths, HexBorders, PathFinder, towns, routing_machine) {
    return {
        FoxholeRouter: function (mymap, API) {
            var JSONRoads = L.geoJSON(Paths);
            var WardenRoutes = { crs: Paths.crs, features: [], type: "FeatureCollection", filter: Paths.filter };
            var ColonialRoutes = { crs: Paths.crs, features: [], type: "FeatureCollection", filter: Paths.filter };
            for (var i = 0; i < Paths.features.length; i++) {
                var warden_features = new Array();
                var colonial_features = new Array();
                var last_ownership = "NONE";
                var last_p = null;
                var keys = Object.keys(JSONRoads._layers);
                for (var k = 0; k < Paths.features[i].geometry.coordinates.length; k++) {
                    var p = Paths.features[i].geometry.coordinates[k];
                    var ownership = API.ownership(p[0], p[1], Paths.features[i].properties.Region);
                    JSONRoads._layers[keys[i]]._latlngs[k].ownership = ownership;
                    if (ownership === "WARDENS" || ownership === "COLONIALS" || ownership === "NONE") {
                        var fso = ownership === "COLONIALS" ? colonial_features : warden_features;
                        if (k > 0 && last_ownership != ownership && ownership != "NONE") {
                            var fs = last_ownership === "COLONIALS" ? colonial_features : warden_features;
                            break_feature_set = fs.length > 0 && (last_p[0] != p[0] || last_p[1] != p[1]);
                        }
                        else
                            break_feature_set = false;

                        if (break_feature_set) {
                            // break the feature set, start a new one with this point

                            if (ownership == "WARDENS" && warden_features.length > 0) {
                                WardenRoutes.features.push({ type: "Feature", properties: Paths.features[i].properties, geometry: { type: "LineString", coordinates: warden_features } });
                                warden_features = new Array();
                            }

                            if (last_ownership == "COLONIALS" && colonial_features.length > 0) {
                                ColonialRoutes.features.push({ type: "Feature", properties: Paths.features[i].properties, geometry: { type: "LineString", coordinates: colonial_features } });
                                colonial_features = new Array();
                            }
                        }

                        if (ownership == "NONE") {
                            warden_features.push(p);
                            colonial_features.push(p);
                        }
                        else
                            fso.push(p);
                    }
                    last_p = p;
                    last_ownership = ownership;
                }
                if (warden_features.length > 1)
                    WardenRoutes.features.push({ type: "Feature", properties: Paths.features[i].properties, geometry: { type: "LineString", coordinates: warden_features } });
                if (colonial_features.length > 1)
                    ColonialRoutes.features.push({ type: "Feature", properties: Paths.features[i].properties, geometry: { type: "LineString", coordinates: colonial_features } });
            }

            var RoadsGroup = L.layerGroup().addTo(mymap);
            var renderer = L.canvas().addTo(mymap);

            for (var key in JSONRoads._layers) {
                var layer = JSONRoads._layers[key];
                for (var k = 1; k < layer._latlngs.length; k++) {
                    var region = layer.feature.properties.Region;
                    var lat = layer._latlngs[k - 1].lat;
                    var lng = layer._latlngs[k - 1].lng;
                    var lat2 = layer._latlngs[k].lat;
                    var lng2 = layer._latlngs[k].lng;
                    if (lat != null && lng != null && lat2 != null && lng2 != null)
                        new L.polyline([[lat, lng], [lat2, lng2]], { color: '#000000', weight: 2, opacity: 1.0, renderer: renderer, interactive: false, smoothFactor: 10 }).addTo(RoadsGroup).bringToFront();
                }
            }
            for (var key in JSONRoads._layers) {
                var layer = JSONRoads._layers[key];
                for (var k = 1; k < layer._latlngs.length; k++) {
                    var region = layer.feature.properties.Region;
                    var lat = layer._latlngs[k - 1].lat;
                    var lng = layer._latlngs[k - 1].lng;
                    var lat2 = layer._latlngs[k].lat;
                    var lng2 = layer._latlngs[k].lng;
                    if (lat != null && lng != null && lat2 != null && lng2 != null) {

                        var control = layer._latlngs[k - 1].ownership;
                        var color = '#AAAAAA';
                        if (control == "COLONIALS")
                            color = '#516C4B';
                        else if (control == "WARDENS")
                            color = '#235683';
                        else if (control == "OFFLINE")
                            color = '#505050';
                        new L.polyline([[lat, lng], [lat2, lng2]], { color: color, weight: 1.5, opacity: 1.0, renderer: renderer, interactive: false, smoothFactor: 10 }).addTo(RoadsGroup).bringToFront();
                    }
                }
            }


            var FoxholeRouter = {
                API: API,
                Borders: L.geoJSON(HexBorders).addTo(mymap),
                Roads: JSONRoads,
                RoadsCanvas: RoadsGroup,
                renderer: renderer,
                WardenNetworkLayer: L.layerGroup().addTo(mymap),
                ColonialNetworkLayer: L.layerGroup().addTo(mymap),
                NetworkLayer: L.layerGroup().addTo(mymap),
                pathFinder: new PathFinder(Paths, {
                    precision: 1e-3,
                    weightFn: function (a, b, props) { var dx = a[0] - b[0]; var dy = a[1] - b[1]; return Math.sqrt(dx * dx + dy * dy); }
                }),
                wardenPathFinder: new PathFinder(WardenRoutes, {
                    precision: 1e-3,
                    weightFn: function (a, b, props) { var dx = a[0] - b[0]; var dy = a[1] - b[1]; return Math.sqrt(dx * dx + dy * dy); }
                }),
                colonialPathFinder: new PathFinder(ColonialRoutes, {
                    precision: 1e-3,
                    weightFn: function (a, b, props) { var dx = a[0] - b[0]; var dy = a[1] - b[1]; return Math.sqrt(dx * dx + dy * dy); }
                }),
                routeLine: function (route, options) {
                    return new Line(route, options);
                },
                route: function (waypoints, callback, context, options) {
                    // modify new waypoints to find closest ones
                    for (var i = 0; i < waypoints.length; i++) {
                        var closestPoint = null;
                        var distance = 0.0;
                        for (var key in FoxholeRouter.Roads._layers) {
                            var layer = FoxholeRouter.Roads._layers[key];
                            for (var k = 0; k < layer._latlngs.length; k++) {
                                var lat = layer._latlngs[k].lat;
                                var wplat = waypoints[i].latLng.lat;
                                var lng = layer._latlngs[k].lng;
                                var wplng = waypoints[i].latLng.lng;
                                var distance_squared = (lat - wplat) * (lat - wplat) + (lng - wplng) * (lng - wplng);
                                if (!closestPoint || distance_squared < distance) {
                                    distance = distance_squared;
                                    closestPoint = L.latLng(lat, lng);
                                }
                            }
                        }
                        waypoints[i].latLng = closestPoint;
                    }

                    var path = null;
                    var wardenPath = null;
                    var colonialPath = null;
                    var no_warden_path = false;
                    var no_colonial_path = false;

                    for (var i = 0; i < waypoints.length - 1; i++) {
                        var start = waypoints[i].latLng;
                        var finish = waypoints[i + 1].latLng;
                        if (path == null)
                            path = FoxholeRouter.pathFinder.findPath({ name: "path", geometry: { coordinates: [start.lng, start.lat] } }, { geometry: { coordinates: [finish.lng, finish.lat] } });

                        else {
                            var p = FoxholeRouter.pathFinder.findPath({ name: "path", geometry: { coordinates: [start.lng, start.lat] } }, { geometry: { coordinates: [finish.lng, finish.lat] } });
                            if (p != null && p.path != null) {
                                for (var k = 1; k < p.path.length; k++)
                                    path.path.push(p.path[k]);
                                path.weight += p.weight;
                            }
                        }

                        if (!no_warden_path) {
                            if (wardenPath == null)
                                wardenPath = FoxholeRouter.wardenPathFinder.findPath({ name: "path", geometry: { coordinates: [start.lng, start.lat] } }, { geometry: { coordinates: [finish.lng, finish.lat] } });
                            else {
                                var p = FoxholeRouter.wardenPathFinder.findPath({ name: "path", geometry: { coordinates: [start.lng, start.lat] } }, { geometry: { coordinates: [finish.lng, finish.lat] } });
                                if (p != null && p.path != null) {
                                    for (var k = 1; k < p.path.length; k++)
                                        wardenPath.path.push(p.path[k]);
                                    wardenPath.weight += p.weight;
                                }
                                else
                                    wardenPath = null;
                            }
                        }
                        if (wardenPath == null)
                            no_warden_path = true;

                        if (!no_colonial_path) {
                            if (colonialPath == null)
                                colonialPath = FoxholeRouter.colonialPathFinder.findPath({ name: "path", geometry: { coordinates: [start.lng, start.lat] } }, { geometry: { coordinates: [finish.lng, finish.lat] } });
                            else {
                                var p = FoxholeRouter.colonialPathFinder.findPath({ name: "path", geometry: { coordinates: [start.lng, start.lat] } }, { geometry: { coordinates: [finish.lng, finish.lat] } });
                                if (p != null && p.path != null) {
                                    for (var k = 1; k < p.path.length; k++)
                                        colonialPath.path.push(p.path[k]);
                                    colonialPath.weight += p.weight;
                                }
                                else
                                    colonialPath = null;
                            }
                        }
                        if (colonialPath == null)
                            no_colonial_path = true;

                    }

                    if (no_colonial_path)
                        colonialPath = null;

                    if (no_warden_path)
                        wardenPath = null;

                    let call = callback.bind(context);
                    var directions = ['East', 'Northeast', 'North', 'Northwest', 'West', 'Southwest', 'South', 'Southeast'];
                    var route_builder = function (name, opath, wp) {
                        var coordinates = [];
                        var instructions = [];
                        var accumulated_distance = 0.0;

                        last_point = L.latLng(opath.path[0][0], opath.path[1][1]);
                        var last_direction = "";

                        for (var i = 0; i < opath.path.length; i++) {
                            coordinates[i] = L.latLng(opath.path[i][1], opath.path[i][0]);
                            if (i > 0) {
                                var dy = opath.path[i][0] - opath.path[i - 1][0];
                                var dx = opath.path[i][1] - opath.path[i - 1][1];

                                angle = Math.atan2(opath.path[i][1] - opath.path[i - 1][1], opath.path[i][0] - opath.path[i - 1][0]);
                                if (angle < 0)
                                    angle += Math.PI * 2;

                                var direction = directions[parseInt(Math.round((angle / (Math.PI * 2)) * 8)) % 8];
                                var distance = (Math.sqrt(dx * dx + dy * dy) / 256.0) * 12012.0;

                                if ((last_direction != direction && (distance + accumulated_distance >= 100 || (i == opath.path.length - 1 && distance + accumulated_distance >= 30)))) {
                                    angle = Math.atan2(opath.path[i][1] - last_point.lng, opath.path[i][0] - last_point.lat);
                                    if (angle < 0)
                                        angle += Math.PI * 2;
                                    var generaldirection = directions[parseInt(Math.round((angle / (Math.PI * 2)) * 8)) % 8];

                                    if (instructions.length > 0 && instructions[instructions.length - 1].text === generaldirection)
                                        instructions[instructions.length - 1].distance += (distance + accumulated_distance);
                                    else
                                        instructions.push({ distance: distance + accumulated_distance, time: 1, dir: direction, text: generaldirection });
                                    accumulated_distance = 0.0;
                                    last_point = L.latLng(opath.path[i][0], opath.path[i][1]);
                                }
                                else
                                    accumulated_distance += distance;
                                last_direction = direction;
                            }
                        }

                        var distance = (opath.weight / 256.0) * 12012.0; //map scale 
                        return {
                            name: name,
                            summary:
                            {
                                totalTime: (distance / 35000.0) * 3600.0, // truck speed
                                modifiedTime: (distance / 35000.0) * 3600.0 / .75, //+40% delay for slow trucks
                                totalDistance: distance
                            },
                            inputWaypoints: wp,
                            waypoints: wp,
                            instructions: instructions,
                            coordinates: coordinates
                        }
                    };

                    if (path === null)
                        call({ status: -1, message: "Could not find a route" }, []);
                    else {

                        if (path != null && (
                            (wardenPath != null && wardenPath.path.length == path.path.length && wardenPath.path.reduce(function (result, value, index, array) { if (!result) return false; return path.path[index][0] == wardenPath.path[index][0] && path.path[index][1] == wardenPath.path[index][1]; }))
                            ||
                            (colonialPath != null && colonialPath.path.length == path.path.length && colonialPath.path.reduce(function (result, value, index, array) { if (!result) return false; return path.path[index][0] == colonialPath.path[index][0] && path.path[index][1] == colonialPath.path[index][1]; }))
                        )
                        )
                            var routes = [];
                        else
                            var routes = [route_builder("Shortest Route", path, waypoints)];

                        if (wardenPath != null)
                            routes.unshift(route_builder("Warden Route", wardenPath, waypoints));
                        if (colonialPath != null)
                            routes.unshift(route_builder("Colonial Route", colonialPath, waypoints));

                        call(null, routes);
                    }
                }
            };
            return FoxholeRouter;
        }
    };
});
