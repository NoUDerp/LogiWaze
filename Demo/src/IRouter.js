define(['leaflet', 'json-loader!../../Mapped/Unified.fitted-for-leaflet.geojson', 'json-loader!../../hex.geojson', 'geojson-path-finder', '../towns.json', 'leaflet-routing-machine'], function (L, Paths, HexBorders, PathFinder, towns, routing_machine) {
    return {
        FoxholeRouter: function(mymap) {
            var FoxholeRouter = {
		Borders: L.geoJSON(HexBorders).addTo(mymap),
                Roads: L.geoJSON(Paths).addTo(mymap),
                renderer: L.canvas().addTo(mymap),
                NetworkLayer: L.layerGroup().addTo(mymap),
                pathFinder: new PathFinder(Paths, { precision: 1e-1 }),
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
                    }

                    let call = callback.bind(FoxholeRouter);

                    if (path === null)
                        call({ status: -1, message: "Could not find a route" }, []);
                    else {
                        var coordinates = [];
                        var instructions = [];
                        for (var i = 0; i < path.path.length; i++) {
                            coordinates[i] = L.latLng(path.path[i][0], path.path[i][1]);
                            instructions[i] = "";
                        }

                        var result = call(null, [{
                            name: "route name",
                            summary:
                            {
                                totalTime: 0.0,
                                totalDistance: path.weight
                            },
                            waypoints: waypoints,
                            coordinates: coordinates,
                            instructions: instructions
                        }], context);
                        FoxholeRouter.NetworkLayer.clearLayers()
                        for (var i = 0; i < path.path.length - 1; i++) {
                            new L.polyline(
                                [
                                    [path.path[i][1], path.path[i][0]],
                                    [path.path[i + 1][1], path.path[i + 1][0]]
                                ], { color: 'white', weight: 7, opacity: 1.0, renderer: FoxholeRouter.renderer, interactive: false, smoothFactor: 1 }
                            ).addTo(FoxholeRouter.NetworkLayer).bringToFront();
                        }
                        return result;
                    }
                }
            };
            return FoxholeRouter;
        }
    };
});
