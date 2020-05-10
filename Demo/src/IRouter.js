define(['leaflet', 'json-loader!../../Mapped/Unified.fitted-for-leaflet.geojson', 'json-loader!../../hex.geojson', 'geojson-path-finder', '../towns.json', 'leaflet-routing-machine'], function (L, Paths, HexBorders, PathFinder, towns, routing_machine) {
    return {
        FoxholeRouter: function(mymap, API) {
	var JSONRoads = L.geoJSON(Paths);
	var RoadsGroup = L.layerGroup().addTo(mymap);
	var renderer = L.canvas().addTo(mymap);
	for(var key in JSONRoads._layers)
	{
		var layer = JSONRoads._layers[key];
		for(var k=1; k<layer._latlngs.length; k++)
		{
			var region = layer.feature.properties.Region;
			var lat = layer._latlngs[k-1].lat;
			var lng = layer._latlngs[k-1].lng;
			var lat2 = layer._latlngs[k].lat;
			var lng2 = layer._latlngs[k].lng;
			if( lat != null && lng != null && lat2 != null && lng2 != null)
			{
				var control = API.ownership(lng, lat, region);
				var color = '#AAAAAA';
				if(control == "COLONIALS")
					color = 'green';
				else if(control == "WARDENS")
					color = 'blue';
				else if(control == "OFFLINE")
					color = 'black';
			new L.polyline([[lat, lng],[lat2, lng2]], { color: color, weight: 2, opacity: 1.0, renderer: renderer, interactive: false, smoothFactor: 50 }).addTo(RoadsGroup).bringToFront();
			}
		}
	}

	var FoxholeRouter = {
		API: API,
		Borders: L.geoJSON(HexBorders).addTo(mymap),
                Roads: JSONRoads,
		RoadsCanvas: RoadsGroup,
                renderer: renderer,
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
                            instructions[i] = {distance:1, time: 1, text: "x"};
				
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
				var control = FoxholeRouter.API.ownership(path.path[i][1], path.path[i][0], path.path[i][2]);
                            new L.polyline(
                                [
                                    [path.path[i][1], path.path[i][0]],
                                    [path.path[i + 1][1], path.path[i + 1][0]]
                                ], { color: 'white', weight: 5, opacity: 1.0, renderer: FoxholeRouter.renderer, interactive: false, smoothFactor: 1 }
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
