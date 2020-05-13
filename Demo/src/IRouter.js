define(['leaflet', 'json-loader!../../Mapped/Unified.fitted-for-leaflet.geojson', 'json-loader!../../hex.geojson', 'geojson-path-finder', '../towns.json', 'leaflet-routing-machine'], function (L, Paths, HexBorders, PathFinder, towns, routing_machine) {
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
                    if (ownership === "WARDENS" || ownership === "COLONIALS") {
                        var fso = ownership === "COLONIALS" ? colonial_features : warden_features;
                        if (k > 0 && last_ownership != ownership) {
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
                    if (lat != null && lng != null && lat2 != null && lng2 != null) {

                        var control = layer._latlngs[k - 1].ownership;
                        var color = '#AAAAAA';
                        if (control == "COLONIALS")
                            color = 'green';
                        else if (control == "WARDENS")
                            color = 'blue';
                        else if (control == "OFFLINE")
                            color = 'black';
                        new L.polyline([[lat, lng], [lat2, lng2]], { color: color, weight: 2, opacity: 1.0, renderer: renderer, interactive: false, smoothFactor: 50 }).addTo(RoadsGroup).bringToFront();
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

                        if (wardenPath == null)
                            wardenPath = FoxholeRouter.wardenPathFinder.findPath({ name: "path", geometry: { coordinates: [start.lng, start.lat] } }, { geometry: { coordinates: [finish.lng, finish.lat] } });

                        else {
                            var p = FoxholeRouter.wardenPathFinder.findPath({ name: "path", geometry: { coordinates: [start.lng, start.lat] } }, { geometry: { coordinates: [finish.lng, finish.lat] } });
                            if (p != null && p.path != null) {
                                for (var k = 1; k < p.path.length; k++)
                                    wardenPath.path.push(p.path[k]);
                                wardenPath.weight += p.weight;
                            }
                        }

                        if (colonialPath == null)
                            colonialPath = FoxholeRouter.colonialPathFinder.findPath({ name: "path", geometry: { coordinates: [start.lng, start.lat] } }, { geometry: { coordinates: [finish.lng, finish.lat] } });

                        else {
                            var p = FoxholeRouter.colonialPathFinder.findPath({ name: "path", geometry: { coordinates: [start.lng, start.lat] } }, { geometry: { coordinates: [finish.lng, finish.lat] } });
                            if (p != null && p.path != null) {
                                for (var k = 1; k < p.path.length; k++)
                                    colonialPath.path.push(p.path[k]);
                                colonialPath.weight += p.weight;
                            }
                        }

                    }

                    let call = callback.bind(context);
                    var route_builder = function (name, opath, wp) {
                        var coordinates = [];
                        var instructions = [];
                        for (var i = 0; i < opath.path.length; i++) {
                            coordinates[i] = L.latLng(opath.path[i][1], opath.path[i][0]);
                            //instructions[i] = { distance: 1, time: 1, text: "x" };
                        }
                        var distance = (opath.weight / 256.0) * 12012.0;
                        return {
                            name: name,
                            summary:
                            {
                                totalTime: (distance / 35000.0) * 3600.0,
                                totalDistance: distance
                                /*length of a region is 1.89 km
width of a region is 2.184 km
surface area of a region is 3.09811 km

playable map length is 9.45 km
playable map width is 12.012 km
playable map surface area is 71.257 km*/
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

                        var routes = [route_builder("Shortest", path, waypoints)];
                        if (wardenPath != null)
                            routes.push(route_builder("Warden", wardenPath, waypoints));
                        if (colonialPath != null)
                            routes.push(route_builder("Colonial", colonialPath, waypoints));
                        call(null, routes);


                        //var mainRoute = wardenPath != null ? wardenPath : (colonialPath != null ? colonialPath : path);
                        //for (var i = 1; i < mainRoute.path.length; i++) {
                        //L.Routing.control.
                        //}

                        /*FoxholeRouter.NetworkLayer.clearLayers()
                        if (path != null)
                            for (var i = 1; i < path.path.length; i++) {
                                new L.polyline([
                                    [path.path[i - 1][1], path.path[i - 1][0]],
                                    [path.path[i][1], path.path[i][0]]
                                ], { color: '#888888', weight: 1, opacity: 1.0, renderer: FoxholeRouter.renderer, interactive: false, smoothFactor: 1 }).addTo(FoxholeRouter.NetworkLayer).bringToFront();
                            }

                        FoxholeRouter.WardenNetworkLayer.clearLayers()
                        if (wardenPath != null)
                            for (var i = 0; i < wardenPath.path.length - 1; i++) {
                                new L.polyline(
                                    [
                                        [wardenPath.path[i][1], wardenPath.path[i][0]],
                                        [wardenPath.path[i + 1][1], wardenPath.path[i + 1][0]]
                                    ], { color: 'white', lineEnd: 'square', fillColor: 'blue', fill: true, weight: 2, renderer: FoxholeRouter.renderer, interactive: true, smoothFactor: 1 }
                                ).addTo(FoxholeRouter.WardenNetworkLayer).bringToFront();
                            }

                        FoxholeRouter.ColonialNetworkLayer.clearLayers()
                        if (colonialPath != null)
                            for (var i = 0; i < colonialPath.path.length - 1; i++) {
                                new L.polyline(
                                    [
                                        [colonialPath.path[i][1], colonialPath.path[i][0]],
                                        [colonialPath.path[i + 1][1], colonialPath.path[i + 1][0]]
                                    ], { color: 'white', fillColor: 'green', weight: 2, fill: true, renderer: FoxholeRouter.renderer, interactive: true, smoothFactor: 1 }
                                ).addTo(FoxholeRouter.ColonialNetworkLayer).bringToFront();
                            }
                            */
                    }
                }
            };
            return FoxholeRouter;
        }
    };
});
