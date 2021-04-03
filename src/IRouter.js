define(['leaflet', 'json-loader!../Roads.geojson', 'json-loader!../hex.geojson', './geojson-path-finder/index.js', 'leaflet-routing-machine', '../towns.json'],
    function (L, Paths, HexBorders, PathFinder, routing_machine, towns) {
        return {
            FoxholeRouter: function (mymap, API, Narrator) {
                var JSONRoads = L.geoJSON(Paths);
                var MainRoutes = { crs: Paths.crs, features: [], type: "FeatureCollection", filter: Paths.filter };
                var WardenRoutes = { crs: Paths.crs, features: [], type: "FeatureCollection", filter: Paths.filter };
                var ColonialRoutes = { crs: Paths.crs, features: [], type: "FeatureCollection", filter: Paths.filter };

                var Intersections = {};
                var BorderCache = {};
                var BorderCrossings = {};

                var keys = Object.keys(JSONRoads._layers);

                for (var i = 0; i < Paths.features.length; i++) {
                    var feature = Paths.features[i];
                    var scratch = {};
                    for (var k = 0; k < feature.geometry.coordinates.length; k++) {
                        var p = feature.geometry.coordinates[k];
                        var hash = p[0].toFixed(3).concat("|").concat(p[1].toFixed(3));
                        if (scratch[hash] === true) {
                            feature.geometry.coordinates.splice(k, 1);
                            k--;
                        }
                        else
                            scratch[hash] = true;
                    }
                    if (feature.geometry.coordinates.length < 2) {
                        Paths.features.splice(i, 1);
                        keys.splice(i, 1);
                        i--;
                    }
                }

                for (var i = 0; i < Paths.features.length; i++) {
                    var feature = Paths.features[i];
                    var warden_features = new Array();
                    var colonial_features = new Array();
                    var all_features = new Array();
                    var last_ownership = "NONE";
                    var last_p = null;

                    for (var k = 0; k < feature.geometry.coordinates.length; k++) {
                        var p = feature.geometry.coordinates[k];
                        var hash = p[0].toFixed(3).concat("|").concat(p[1].toFixed(3));
                        var increment = (k === 0 || k == feature.geometry.coordinates.length - 1) ? 1 : 2;

                        Intersections[hash] = Intersections[hash] == null ? increment : (Intersections[hash] + increment);


                        if (BorderCache[hash] == null)
                            BorderCache[hash] = feature.properties.region;
                        else if (BorderCache[hash] != feature.properties.region && feature.properties != null && feature.properties.region != null)
                            BorderCrossings[hash] = 1;

                        var region = Paths.features[i].properties.region;
                        var ownership = API.ownership(p[0], p[1], region).ownership;
                        JSONRoads._layers[keys[i]]._latlngs[k].ownership = ownership;

                        if (API.mapControl[feature.properties.region] != null)
                            all_features.push(p);

                        if (ownership != "OFFLINE" && ownership != "") {

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
                    if (all_features.length > 1)
                        MainRoutes.features.push({ type: "Feature", properties: Paths.features[i].properties, geometry: { type: "LineString", coordinates: all_features } });

                }

                var RoadsGroup = L.layerGroup().addTo(mymap);
                var WardenRoadsGroup = L.layerGroup().addTo(mymap);
                var ColonialRoadsGroup = L.layerGroup().addTo(mymap);
                var NeutralRoadsGroup = L.layerGroup().addTo(mymap);
                var renderer = L.canvas({ tolerance: .2 }).addTo(mymap);

                var TownHalls = L.layerGroup().addTo(mymap);
                var Resources = L.layerGroup().addTo(mymap);
                var Components = L.layerGroup().addTo(mymap);
                var Salvage = L.layerGroup().addTo(mymap);
                var Fuel = L.layerGroup().addTo(mymap);
                var Sulfur = L.layerGroup().addTo(mymap);


                var resolveIcon = function (ic) {
                    if (ic.icon == null)
                        return null;
                    if (ic.icon == 5)
                        icon = 'MapIconStaticBase1';
                    else if (ic.icon == 6)
                        icon = 'MapIconStaticBase2';
                    else if (ic.icon == 7)
                        icon = 'MapIconStaticBase3';
                    else if (ic.icon == 27)
                        icon = 'MapIconKeep'
                    else if (ic.icon >= 45 && ic.icon <= 47)
                        icon = 'MapIconRelicBase';
                    else
                        return null;

                    if (ic.ownership == "WARDENS")
                        icon = icon.concat('Warden');
                    else if (ic.ownership == "COLONIALS")
                        icon = icon.concat('Colonial');
                    else if (ic.ownership == "NONE");
                    else
                        return null;


                    return icon.concat('.webp');
                };

                var resolveResource = function (ic) {
                    if (ic.icon == null)
                        return null;

                    if (ic.icon == 20)
                        return 'MapIconSalvage.webp';
                    if (ic.icon == 21)
                        return 'MapIconComponents.webp';
                    if (ic.icon == 23)
                        return 'MapIconSulfur.webp';
                    if (ic.icon == 32)
                        return 'MapIconSulfurMine.webp';
                    if (ic.icon == 38)
                        return 'MapIconSalvageMine.webp';
                    if (ic.icon == 40)
                        return 'MapIconComponentMine.webp';
                    if (ic.icon == 41)
                        return 'MapIconOilWell.webp';

                    return null;
                }

                var rkeys = Object.keys(API.resources);

                for (var t = 0; t < rkeys.length; t++) {
                    var region = API.resources[rkeys[t]];
                    var keys2 = Object.keys(region);
                    for (var k = 0; k < keys2.length; k++) {

                        var th = region[keys2[k]];
                        var data = { ownership: th.control, icon: th.mapIcon };
                        var icon = resolveResource(data);
                        if (icon != null) {
                            var ResourceLayer = Resources;
                            switch (data.icon) {
                                case 21:
                                case 40:
                                    ResourceLayer = Components;
                                    break;
                                case 23:
                                case 32:
                                    ResourceLayer = Sulfur;
                                    break;
                                case 38:
                                case 20:
                                    ResourceLayer = Salvage;
                                    break;
                                case 41:
                                    ResourceLayer = Fuel;
                                    break;
                            }

                            L.marker([th.y, th.x], {
                                clickable: false,
                                zIndexOffset: -1001,
                                icon: L.icon({
                                    iconUrl: 'MapIcons/'.concat(icon),
                                    iconSize: [24, 24],
                                    className: "resource-icon"
                                })
                            }).addTo(ResourceLayer);
                        }
                    }
                }

                var keys = Object.keys(API.mapControl);

                for (var t = 0; t < keys.length; t++) {
                    var region = API.mapControl[keys[t]];
                    var keys2 = Object.keys(region);
                    for (var k = 0; k < keys2.length; k++) {

                        var th = region[keys2[k]];
                        var data = { ownership: th.control, icon: th.mapIcon };
                        var icon = resolveIcon(data);
                        if (icon != null)
                            L.marker([th.y, th.x], {
                                clickable: false,
                                zIndexOffset: -1000,
                                icon: L.icon({
                                    iconUrl: 'MapIcons/'.concat(icon),
                                    iconSize: [24, 24],
                                    className: "town-hall-icon"
                                })
                            }).addTo(TownHalls);
                    }
                }

                var ks = Object.keys(towns);
                for (var t = 0; t < ks.length; t++) {

                    var th = towns[ks[t]];
                    if (th.major == 1)
                        new L.Marker([th.y, th.x], { icon: new L.DivIcon({ className: 'town-label', html: '<span>'.concat(ks[t]).concat('</span>') }) }).addTo(TownHalls);
                    else
                        new L.Marker([th.y, th.x], { icon: new L.DivIcon({ className: 'minor-town-label', html: '<span>'.concat(ks[t]).concat('</span>') }) }).addTo(TownHalls);

                }

                function scale_th(zoom) {
                    if (zoom == null)
                        zoom = mymap.getZoom();
                    var scale = Math.round(32.0 * Math.sqrt(zoom / 6));
                    var x = document.getElementsByClassName('town-hall-icon');
                    if (x != null)
                        for (var i = 0; i < x.length; i++) {
                            x[i].style.width = scale.toFixed().toString().concat("px");
                            x[i].style.height = scale.toFixed().toString().concat("px");
                            x[i].style["margin-left"] = (-scale / 2).toFixed().toString().concat("px");
                            x[i].style["margin-top"] = (-scale / 2).toFixed().toString().concat("px");
                        }
                    var y = document.getElementsByClassName('town-label');
                    var visible = zoom > 2 ? 'block' : 'none';
                    if (y != null)
                        for (var i = 0; i < y.length; i++)
                            y[i].style["display"] = visible;

                    var y = document.getElementsByClassName('minor-town-label');
                    var visible = zoom > 3 ? 'block' : 'none';
                    if (y != null)
                        for (var i = 0; i < y.length; i++)
                            y[i].style["display"] = visible;

                }

                function scale_r(zoom) {
                    if (zoom == null)
                        zoom = mymap.getZoom();
                    var scale = Math.round(32.0 * Math.sqrt(zoom / 6));
                    var x = document.getElementsByClassName('resource-icon');
                    if (x != null)
                        for (var i = 0; i < x.length; i++) {
                            x[i].style.width = (scale * .65).toFixed().toString().concat("px");
                            x[i].style.height = (scale * .65).toFixed().toString().concat("px");
                            x[i].style["margin-left"] = (-scale / 2).toFixed().toString().concat("px");
                            x[i].style["margin-top"] = (-scale / 2).toFixed().toString().concat("px");
                        }

                }

                var ScaleNeutralRoads = function (zoom) {
                    if (zoom == null)
                        zoom = mymap.getZoom();
                    scale = 8.0 * zoom / 6;
                    NeutralRoadsGroup.eachLayer(function (layer) {
                        layer.options.weight = scale;
                    });
                };

                var ScaleWardenRoads = function (zoom) {
                    if (zoom == null)
                        zoom = mymap.getZoom();
                    var scale = 8.0 * zoom / 6;
                    WardenRoadsGroup.eachLayer(function (layer) {
                        layer.options.weight = scale;
                    });
                };

                var ScaleColonialRoads = function (zoom) {
                    if (zoom == null)
                        zoom = mymap.getZoom();
                    var scale = 8.0 * zoom / 6;
                    ColonialRoadsGroup.eachLayer(function (layer) {
                        layer.options.weight = scale;
                    });
                };

                var ScaleRoadTypes = function (zoom) {
                    if (zoom == null)
                        zoom = mymap.getZoom();
                    var scale = 16.0 * zoom / 6;
                    RoadsGroup.eachLayer(function (layer) {
                        layer.options.weight = scale;
                    });
                };

                var ScaleRoads = function (zoom) {
                    ScaleRoadTypes(zoom);
                    ScaleWardenRoads(zoom);
                    ScaleNeutralRoads(zoom);
                    ScaleColonialRoads(zoom);
                };

                var ScaleTownHalls = function (zoom) {
                    scale_th(zoom);
                    scale_r(zoom);
                };

                mymap.on('overlayadd', (e) => {
                    if (e.layer == Resources) scale_r(null); else if (e.layer == TownHalls) scale_th(null);
                    else if (e.layer == ColonialRoadsGroup)
                        ScaleColonialRoads(null);
                    else if (e.layer == WardenRoadsGroup)
                        ScaleWardenRoads(null);
                    else if (e.layer == NeutralRoadsGroup)
                        ScaleNeutralRoads(null);
                    else if (e.layer == RoadsGroup)
                        ScaleRoadTypes(null);
                });
                mymap.on('zoomanim', (e) => { ScaleTownHalls(e.zoom); ScaleRoads(e.zoom); });

                for (var key in JSONRoads._layers) {
                    var layer = JSONRoads._layers[key];
                    for (var k = 1; k < layer._latlngs.length; k++) {
                        var region = layer.feature.properties.region;
                        var tier = layer.feature.properties.tier;
                        var lat = layer._latlngs[k - 1].lat;
                        var lng = layer._latlngs[k - 1].lng;
                        var lat2 = layer._latlngs[k].lat;
                        var lng2 = layer._latlngs[k].lng;

                        var tiercolor = tier == 3 ? '#5a9565' : (tier == 2 ? '#94954e' : '#957458');

                        if (lat != null && lng != null && lat2 != null && lng2 != null) {
                            var control = layer._latlngs[k - 1].ownership;
                            new L.polyline([[lat, lng], [lat2, lng2]], { color: tiercolor, weight: 10, opacity: 1.0, renderer: renderer, interactive: false, smoothFactor: 48 }).addTo(RoadsGroup).bringToFront();
                        }
                    }
                }
                for (var key in JSONRoads._layers) {
                    var layer = JSONRoads._layers[key];
                    for (var k = 1; k < layer._latlngs.length; k++) {
                        var region = layer.feature.properties.region;
                        var lat = layer._latlngs[k - 1].lat;
                        var lng = layer._latlngs[k - 1].lng;
                        var lat2 = layer._latlngs[k].lat;
                        var lng2 = layer._latlngs[k].lng;
                        if (lat != null && lng != null && lat2 != null && lng2 != null) {

                            var control = layer._latlngs[k - 1].ownership;
                            if (control == "COLONIALS")
                                new L.polyline([[lat, lng], [lat2, lng2]], { color: '#516C4B', weight: 5, opacity: 1.0, renderer: renderer, interactive: false, smoothFactor: 48 }).addTo(ColonialRoadsGroup).bringToFront();

                            else if (control == "WARDENS")
                                new L.polyline([[lat, lng], [lat2, lng2]], { color: '#235683', weight: 5, opacity: 1.0, renderer: renderer, interactive: false, smoothFactor: 48 }).addTo(WardenRoadsGroup).bringToFront();

                            else if (control == "OFFLINE")
                                new L.polyline([[lat, lng], [lat2, lng2]], { color: '#505050', weight: 5, opacity: 1.0, renderer: renderer, interactive: false, smoothFactor: 48 }).addTo(RoadsGroup).bringToFront();

                            else if (control === "NONE")
                                new L.polyline([[lat, lng], [lat2, lng2]], { color: '#CCCCCC', weight: 5, opacity: 1.0, renderer: renderer, interactive: false, smoothFactor: 48 }).addTo(NeutralRoadsGroup).bringToFront();
                        }
                    }
                }
                var highlighter = L.layerGroup().addTo(mymap);
                var borderLayer = L.layerGroup().addTo(mymap);
                var debug_markers = L.layerGroup();
                if (beta) {
                    var k = Object.keys(BorderCrossings);
                    for (var i = 0; i < k.length; i++) {
                        var b = k[i].split(/\|/);
                        L.circleMarker([parseFloat(b[1]), parseFloat(b[0])], {
                            color: '#FF0000',
                            clickable: false,
                            zIndexOffset: -1000,
                            opacity: .5
                        }).addTo(debug_markers);
                    }

                    var k = Object.keys(Intersections);
                    for (var i = 0; i < k.length; i++) {
                        if (Intersections[k[i]] > 2) {
                            var b = k[i].split(/\|/);
                            L.circleMarker([parseFloat(b[1]), parseFloat(b[0])], {
                                color: '#00FF00',
                                clickable: false,
                                zIndexOffset: -2000,
                                opacity: .5
                            }).addTo(debug_markers);
                        }
                    }

                }

                var playbutton = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:a="http://ns.adobe.com/AdobeSVGViewerExtensions/3.0/" x="0px" y="0px" width="32px" height="32px" viewBox="20 20 173.7 173.7" enable-background="new 0 0 213.7 213.7" xml:space="preserve"><polygon class="triangle" id="XMLID_18_" fill="none" stroke-width="15" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" points="73.5,62.5 148.5,105.8 73.5,149.1 "/></svg>'

                var speed = beta ? '<tr class="detailed-routeinfo"><td colspan="2"><span class="slow"></span><span class="slidecontainer"><input type="range" min="d /1" max="100" value="50" class="slider" oninput="updateSlider(this)"></span><span class="fast"></span></td></tr>' : '';
                //: 120
                var FoxholeRouter = {
                    summaryTemplate: '<table class="route-summary"><tr class="route-summary-header"><td><img src=\'{name}.webp\' /><span>{name}</span><span style=\'font-weight: bold; margin-left: 1em\' class=\'summary-routeinfo\'>{distance}</span>'
                        .concat(!window.beta ? "" : '<div class="audio-controls detailed-routeinfo"><button class="play-button" style="pointer-events: auto" onclick="window.narrateDirections()">'.concat(playbutton).concat('</button></div>')).concat('</td></tr>').concat(speed).concat('<tr><td class="no-click">{time}</td></tr></table>'),
                    TownHalls: TownHalls,
                    Resources: Resources,
                    Components: Components,
                    Fuel: Fuel,
                    Salvage: Salvage,
                    Sulfur: Sulfur,
                    API: API,
                    Debug: debug_markers,
                    ScaleTownHalls: ScaleTownHalls,
                    ScaleRoads: ScaleRoads,
                    Borders: L.geoJSON(HexBorders).addTo(mymap),
                    Roads: JSONRoads,
                    NeutralRoadsCanvas: NeutralRoadsGroup,
                    RoadsCanvas: RoadsGroup,
                    WardenRoadsCanvas: WardenRoadsGroup,
                    ColonialRoadsCanvas: ColonialRoadsGroup,
                    renderer: renderer,
                    WardenNetworkLayer: L.layerGroup().addTo(mymap),
                    ColonialNetworkLayer: L.layerGroup().addTo(mymap),
                    NetworkLayer: L.layerGroup().addTo(mymap),
                    calculateAngle: function (v1, v2) {
                        angle = Math.atan2(v2[1] - v1[1], v2[0] - v1[0]);
                        if (angle < 0)
                            angle += Math.PI * 2;
                        return angle;
                    },
                    truckSpeed: 3600.0 / 45000.0, // 45 kmh
                    jeepSpeed: 3600.0 / 55000.0,
                    flatbedSpeed: 3600 / 25000.0,
                    pathFinder: new PathFinder(MainRoutes, {
                        compact: null,
                        weightFn: function (a, b, props) { var dx = a[0] - b[0]; var dy = a[1] - b[1]; return Math.sqrt(dx * dx + dy * dy); }
                    }),
                    setRoute: (route) => { FoxholeRouter.currentRoute = route; },
                    wardenPathFinder: WardenRoutes != null && WardenRoutes.features != null && WardenRoutes.features.length > 0 ? new PathFinder(WardenRoutes, {
                        compact: null,
                        weightFn: function (a, b, props) { var dx = a[0] - b[0]; var dy = a[1] - b[1]; return Math.sqrt(dx * dx + dy * dy); }
                    }) : null,
                    colonialPathFinder: ColonialRoutes != null && ColonialRoutes.features != null && ColonialRoutes.features.length > 0 ? new PathFinder(ColonialRoutes, {
                        compact: null,
                        weightFn: function (a, b, props) { var dx = a[0] - b[0]; var dy = a[1] - b[1]; return Math.sqrt(dx * dx + dy * dy); }
                    }) : null,
                    routeLine: function (route, options) {
                        return new Line(route, options);
                    },
                    narrate: function () {
                        Narrator.giveDirections(FoxholeRouter.currentRoute.instructions);
                    },
                    cardinalDirections: ['East', 'Northeast', 'North', 'Northwest', 'West', 'Southwest', 'South', 'Southeast'],
                    angleToDirection: function (angle) {
                        return FoxholeRouter.cardinalDirections[parseInt(Math.round((angle / (Math.PI * 2)) * 8)) % 8];
                    },
                    route: function (waypoints, callback, context, options) {
                        highlighter.clearLayers();
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
                                    for (var k = 0; k < p.path.length; k++)
                                        path.path.push(p.path[k]);
                                    path.weight += p.weight;
                                }
                            }

                            if (!no_warden_path && FoxholeRouter.wardenPathFinder != null) {
                                if (wardenPath == null)
                                    wardenPath = FoxholeRouter.wardenPathFinder.findPath({ name: "path", geometry: { coordinates: [start.lng, start.lat] } }, { geometry: { coordinates: [finish.lng, finish.lat] } });
                                else {
                                    var p = FoxholeRouter.wardenPathFinder.findPath({ name: "path", geometry: { coordinates: [start.lng, start.lat] } }, { geometry: { coordinates: [finish.lng, finish.lat] } });
                                    if (p != null && p.path != null) {
                                        for (var k = 0; k < p.path.length; k++)
                                            wardenPath.path.push(p.path[k]);
                                        wardenPath.weight += p.weight;
                                    }
                                    else
                                        wardenPath = null;
                                }
                            }
                            if (wardenPath == null)
                                no_warden_path = true;

                            if (!no_colonial_path && FoxholeRouter.colonialPathFinder != null) {
                                if (colonialPath == null)
                                    colonialPath = FoxholeRouter.colonialPathFinder.findPath({ name: "path", geometry: { coordinates: [start.lng, start.lat] } }, { geometry: { coordinates: [finish.lng, finish.lat] } });
                                else {
                                    var p = FoxholeRouter.colonialPathFinder.findPath({ name: "path", geometry: { coordinates: [start.lng, start.lat] } }, { geometry: { coordinates: [finish.lng, finish.lat] } });
                                    if (p != null && p.path != null) {
                                        for (var k = 0; k < p.path.length; k++)
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
                        var route_builder = function (name, opath, wp) {
                            var coordinates = [];
                            var instructions = [];
                            var accumulated_distance = 0.0;
                            var crossroads = [];
                            var last_region = null;
                            for (var i = 0; i < opath.path.length; i++) {
                                coordinates[i] = L.latLng(opath.path[i][1], opath.path[i][0]);
                                if (i > 0) {
                                    var dy = opath.path[i][0] - opath.path[i - 1][0];
                                    var dx = opath.path[i][1] - opath.path[i - 1][1];

                                    var distance = (Math.sqrt(dx * dx + dy * dy) / 256.0) * 12012.0;
                                    var hash = opath.path[i][0].toFixed(3).concat("|").concat(opath.path[i][1].toFixed(3));
                                    var lastHash = opath.path[i - 1][0].toFixed(3).concat("|").concat(opath.path[i - 1][1].toFixed(3));
                                    var borderStart = BorderCrossings[lastHash] === 1;
                                    var borderEnd = BorderCrossings[hash] === 1;
                                    var intersection = Intersections[hash] > 2 || i == 1 || i == opath.path.length - 1;

                                    if (intersection || borderStart) { /* if this is an intersection or border */
                                        var region = opath.path[i][2];
                                        crossroads.push({
                                            angleIn: FoxholeRouter.calculateAngle(opath.path[i - 1], opath.path[i]),
                                            angleOut: i < opath.path.length - 1 ? FoxholeRouter.calculateAngle(opath.path[i], opath.path[i + 1]) : null,
                                            coordinates: [opath.path[i - 1], opath.path[i]],
                                            distanceFromLast: accumulated_distance + distance,
                                            region: region,
                                            border: borderStart,
                                            regionChange: region != last_region
                                        });
                                        accumulated_distance = 0;
                                    }
                                    else
                                        accumulated_distance += distance;
                                    last_region = region;
                                }
                            }

                            var turns = {
                                0: 'Continue', 1: 'Veer left', 2: 'Turn left', 3: 'Sharp turn left', 4: 'About turn', 5: 'Sharp turn right', 6: 'Turn right', 7: 'Veer right',
                                "-1": 'Veer right', "-2": 'Turn right', "-3": 'Sharp turn right', "-4": 'About turn', "-5": 'Sharp turn left', "-6": 'Turn left', "-7": 'Veer left',
                            };


                            for (var i = 0; i < crossroads.length - 1; i++) {
                                var j = crossroads[i];
                                {
                                    var direction = FoxholeRouter.angleToDirection(j.angleOut);
                                    var jangleIn = parseInt(Math.round((j.angleIn / (Math.PI * 2)) * 8)) % 8;
                                    var jangleOut = parseInt(Math.round((j.angleOut / (Math.PI * 2)) * 8)) % 8;
                                    var border = i < crossroads.length - 1 && (i < crossroads.length - 1 && crossroads[i + 1].border) ? 1 : 0;
                                    var region_change = i == 0 || crossroads[i].regionChange;
                                    var turnicon = turns[jangleOut - jangleIn];
                                    if (jangleIn == jangleOut)
                                        var text = "Continue ".concat(direction).concat(" ").concat(i < crossroads.length - 1 ? crossroads[i + 1].distanceFromLast.toFixed().toString().concat(" meters") : '');
                                    else {
                                        var text = turns[jangleOut - jangleIn].concat(' and drive ').concat(direction).concat(' for ').concat(crossroads[i + 1].distanceFromLast.toFixed().toString()).concat(" meters");
                                    }
                                    instructions.push({ distance: crossroads[i + 1].distanceFromLast, time: 0, text: j.region.concat('|').concat(text).concat('|').concat(border.toString()).concat('|').concat(region_change ? '1' : '0').concat('|').concat(turnicon).concat('|').concat(j.tier) });
                                }
                            }
                            instructions.push({ distance: 0, time: 0, text: crossroads[crossroads.length - 1].region.concat("|").concat("You have arrived at your destination.|0|0|0|") });


                            var distance = (opath.weight / 256.0) * 12012.0; //map scale 
                            return {
                                name: name,
                                summary:
                                {
                                    totalTime: distance,
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
