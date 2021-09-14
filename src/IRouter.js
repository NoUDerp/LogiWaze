define(['leaflet', 'json-loader!../Roads.geojson', './geojson-path-finder/index.js', 'leaflet-routing-machine', '../towns.json', 'jquery'],
    function (L, Paths, PathFinder, routing_machine, towns) {

        return {
            FoxholeRouter: function (mymap, API, Narrator) {

                function Recase(x) {
                    return x.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
                }

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
                        var ownership = !(region in API.mapControl) ? "OFFLINE" : API.ownership(p[0], p[1], region).ownership;
                        JSONRoads._layers[keys[i]]._latlngs[k].ownership = ownership;

                        if (API.mapControl[feature.properties.region] != null && ownership != "OFFLINE" && region in API.mapControl)
                            all_features.push(p);

                        if (ownership != "OFFLINE" && ownership != "" && region in API.mapControl) {

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

                var GridDepth = 6;

                var renderer = L.canvas({ tolerance: .2 }).addTo(mymap);

                var RegionLabels = VectorTextGrid.Create(8, [128, 128]);
                var ControlLayer = VectorControlGrid.Create(5, 8, [128, 128], API, .30, .17, GridDepth);

                var regions = API.regions;
                var h = 256 / 7;
                var w = h * 2 / Math.sqrt(3);

                regions.forEach(region => ControlLayer.addHex(region.x, region.y, w, h, !(region.name in API.mapControl)));

                var resolveIcon = function (ic) {
                    if (ic.icon == null)
                        return null;

                    if (ic.icon == 56 || ic.icon == 5)
                        icon = 'MapIconStaticBase1';
                    else if (ic.icon == 35)
                        icon = "MapIconSafehouse";
                    else if (ic.icon == 57 || ic.icon == 6)
                        icon = 'MapIconStaticBase2';
                    else if (ic.icon == 58 || ic.icon == 7)
                        icon = 'MapIconStaticBase3';
                    else if (ic.icon == 27)
                        icon = 'MapIconKeep'
                    else if (ic.icon >= 45 && ic.icon <= 47)
                        icon = 'MapIconRelicBase';
                    else if (ic.icon == 17)
                        icon = 'MapIconManufacturing';
                    else if (ic.icon == 51)
                        icon = 'MapIconMassProductionFactory';
                    else if (ic.icon == 34)
                        icon = 'MapIconFactory';
                    else if (ic.icon == 33)
                        icon = 'MapIconStorageFacility';
                    else if (ic.icon == 39)
                        icon = 'MapIconConstructionYard';
                    else if (ic.icon == 52)
                        icon = 'MapIconSeaport';
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
                var keys = Object.keys(API.mapControl);

                for (var t of Object.keys(API.resources)) {
                    var region = API.resources[t];
                    for (var k of Object.keys(region)) {
                        var th = region[k];
                        if (th.nuked) {
                            var data = { ownership: th.control, icon: th.mapIcon };
                            var icon = resolveResource(data);
                            ControlLayer.addIcon(icon, th.x, th.y, th.nuked, 0, 9);
                        }
                    }
                }

                for (var t of Object.keys(API.mapControl)) {
                    var region = API.mapControl[t];
                    for (var k of Object.keys(region)) {
                        var th = region[k];
                        if (th.nuked) {
                            var data = { ownership: th.control, icon: th.mapIcon };
                            var icon = resolveIcon(data);
                            ControlLayer.addIcon(icon, th.x, th.y, th.nuked, 0, 9);
                        }
                    }
                }

                for (var t of Object.keys(API.resources)) {
                    var region = API.resources[t];
                    for (var k of Object.keys(region)) {

                        var th = region[k];
                        var data = { ownership: th.control, icon: th.mapIcon };
                        var icon = resolveResource(data);
                        ControlLayer.addIcon(icon, th.x, th.y, false, 0, 9);
                    }
                }

                for (var t of Object.keys(API.mapControl)) {
                    var region = API.mapControl[t];
                    for (var k of Object.keys(region)) {
                        var th = region[k];
                        var data = { ownership: th.control, icon: th.mapIcon };
                        var icon = resolveIcon(data);
                        ControlLayer.addIcon(icon, th.x, th.y, false, 0, 9);
                    }
                }

                var ks = Object.keys(towns);
                for (var t = 0; t < ks.length; t++) {
                    var th = towns[ks[t]];
                    if (th.major != 1) {
                        var ownership = API.ownership(th.x + 128, th.y - 128, th.region).ownership;
                        var control = ownership == "COLONIALS" ? 0 : (ownership == "WARDENS" ? 1 : 2);
                        RegionLabels.addText(Recase(ks[t]), ks[t], control, th.x, th.y, 5, 9, '#bbbbbb');
                    }
                }

                for (var t = 0; t < ks.length; t++) {
                    var th = towns[ks[t]];
                    if (th.major == 1) {
                        var ownership = API.ownership(th.x + 128, th.y - 128, th.region).ownership;
                        var control = ownership == "COLONIALS" ? 0 : (ownership == "WARDENS" ? 1 : 2);
                        RegionLabels.addText(Recase(ks[t]), ks[t], control, th.x, th.y, 3, 9, '#fff');
                    }
                }

                for (var i = 0; i < API.regions.length; i++)
                    RegionLabels.addText(Recase(API.regions[i].realName), API.regions[i].realName, 4, API.regions[i].x, API.regions[i].y, 0, 3, '#ffffff', 2.5);


                for (var credit of [ // wow these are all wrong now
                    { text: "Hayden Grove", x: (139.079-128) * 0.90726470872655477280009094078879, y: (-155.292 + 128) * 0.90726470872655477280009094078879 },
                    { text: "Steely Phil Bridge", x: (18.18-128) * 0.90726470872655477280009094078879, y: (-161.439 + 128) * 0.90726470872655477280009094078879 },
                    { text: "Icanari Killing Fields", x: (134.071 - 128) * 0.90726470872655477280009094078879, y: (-143.104 + 128) * 0.90726470872655477280009094078879 },
                    { text: "Kastow Peak", x: (124.817 -128)* 0.90726470872655477280009094078879, y: (-122.72 + 128) * 0.90726470872655477280009094078879},
                    { text: "DragonZephyr Col", x: (119.176-128) * 0.90726470872655477280009094078879, y: (-83.464 + 128) *0.90726470872655477280009094078879},
                    { text: "Skaj Sound", x: (49.826-128)*0.90726470872655477280009094078879, y:(-102.048+128)*0.90726470872655477280009094078879}]
                )
                    RegionLabels.addText(Recase(credit.text), credit.text, control, credit.x, credit.y, 7, 9, '#DAA520');

                for (var key in JSONRoads._layers) {
                    var layer = JSONRoads._layers[key];
                    for (var k = 1; k < layer._latlngs.length; k++) {
                        var region = layer.feature.properties.region;
                        var lat = layer._latlngs[k - 1].lat;
                        var lng = layer._latlngs[k - 1].lng;
                        var lat2 = layer._latlngs[k].lat;
                        var lng2 = layer._latlngs[k].lng;
                        var tier = layer.feature.properties.tier;
                        if (lat != null && lng != null && lat2 != null && lng2 != null) {
                            let control = layer._latlngs[k - 1].ownership;
                            ControlLayer.addRoad([[lat, lng], [lat2, lng2]], { control: control == "COLONIALS" ? 0 : (control == "WARDENS" ? 1 : (control == "OFFLINE" ? 2 : 3)), tier: tier });
                        }
                    }
                }

                ControlLayer.addTo(mymap);
                RegionLabels.addTo(mymap);

                var highlighter = L.layerGroup().addTo(mymap);

                var copy_paste_canvas = document.createElement("canvas");
                copy_paste_canvas.id = "copy-paste";
                copy_paste_canvas.style.opacity = '0';
                copy_paste_canvas.style.position = "absolute";
                copy_paste_canvas.style.left = '0';
                copy_paste_canvas.style.top = '0';

                resizer();

                for (let i of document.getElementsByClassName("leaflet-zoom-animated")) {
                    if (i.localName == "canvas") {
                        i.after(copy_paste_canvas);
                        break;
                    }
                }

                mymap.whenReady(function () {
                    for (let i of document.getElementsByClassName("leaflet-zoom-animated")) {
                        if (i.localName == "canvas") {
                            i.after(copy_paste_canvas);
                            break;
                        }
                    }
                }, null);

                function resizer(e) {
                    if (e == null)
                        e = {
                            newSize: { x: window.innerWidth, y: window.innerHeight }
                        };


                    if (ControlLayer.loaded && RegionLabels.loaded) {
                        var parent_parent_transform = copy_paste_canvas.parentElement.parentElement.style.transform;
                        let styles = [];
                        while (parent_parent_transform != "") {
                            if (/^\s*scale\(.*\)/i.test(parent_parent_transform)) {
                                styles.unshift(copy_paste_canvas.style.transform.concat(' scale('.concat(1.0 / parseFloat(parent_parent_transform.match(/scale\(([^\(]+)\)/i)[1]))));
                                parent_parent_transform = parent_parent_transform.replace(/^\s*scale\(.*\)/i, '');
                            }
                            else if (/^\s*translate3d\(.*\)/i.test(parent_parent_transform)) {
                                let j = parent_parent_transform.match(/translate3d\(([^,]+)px\s*,\s*([^,]+)px\s*,\s*([^p]+)px\)/i);
                                styles.unshift('translate3d('.concat(-parseFloat(j[1])).concat('px,').concat(-parseFloat(j[2])).concat('px,').concat(-parseFloat(j[3])).concat('px)'));
                                parent_parent_transform = parent_parent_transform.replace(/translate3d\(([^\(]+)\)/i, '');
                            }
                            else
                                break;
                        }
                        copy_paste_canvas.style.transform = styles.join(' ');

                        var scale = 1; // temporarily disabled: window.devicePixelRatio;

                        copy_paste_canvas.width = (e.newSize.x - getPanelVisibleWidth()) * scale;
                        copy_paste_canvas.height = (e.newSize.y - getPanelVisibleHeight()) * scale;

                        copy_paste_canvas.style.width = (e.newSize.x - getPanelVisibleWidth()).toString().concat('px');
                        copy_paste_canvas.style.height = (e.newSize.y - getPanelVisibleHeight()).toString().concat('px');
                        FoxholeRouter.update_copy_paste(copy_paste_canvas, scale);
                    }
                }

                ControlLayer.loaded = false;
                RegionLabels.loaded = false;
                ControlLayer.when('unloaded', () => ControlLayer.loaded = false);
                RegionLabels.when('unloaded', () => RegionLabels.loaded = false);

                ControlLayer.when('loaded', function () {
                    ControlLayer.loaded = true;
                    resizer();
                });
                RegionLabels.when('loaded', function () {
                    RegionLabels.loaded = true;
                    resizer();
                });

                mymap.on('resize', (e) => resizer());

                //mymap.on('dragend', (e) => resizer());

                mymap.on('moveend', (e) => resizer());

                var playbutton = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:a="http://ns.adobe.com/AdobeSVGViewerExtensions/3.0/" x="0px" y="0px" width="32px" height="32px" viewBox="20 20 173.7 173.7" enable-background="new 0 0 213.7 213.7" xml:space="preserve"><polygon class="triangle" id="XMLID_18_" fill="none" stroke-width="15" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" points="73.5,62.5 148.5,105.8 73.5,149.1 "/></svg>'

                var speed = beta ? '<tr class="detailed-routeinfo"><td colspan="2"><span class="slow"></span><span class="slidecontainer"><input type="range" min="d /1" max="100" value="50" class="slider" oninput="updateSlider(this)"></span><span class="fast"></span></td></tr>' : '';

                var FoxholeRouter = {
                    summaryTemplate: '<table class="route-summary"><tr class="route-summary-header"><td><img src=\'{name}.webp\' /><span>{name}</span><span style=\'font-weight: bold; margin-left: 1em\' class=\'summary-routeinfo\'>{distance}</span>'
                        .concat(!window.beta ? "" : '<div class="audio-controls detailed-routeinfo"><button class="play-button" style="pointer-events: auto" onclick="window.narrateDirections()">'.concat(playbutton).concat('</button></div>')).concat('</td></tr>').concat(speed).concat('<tr><td class="no-click">{time}</td></tr></table>'),
                    TownHalls: L.layerGroup().addTo(mymap),
                    RegionLabels: RegionLabels,
                    Components: L.layerGroup().addTo(mymap),
                    Fuel: L.layerGroup().addTo(mymap),
                    Salvage: L.layerGroup().addTo(mymap),
                    Sulfur: L.layerGroup().addTo(mymap),
                    VectorControlGrid: ControlLayer,
                    API: API,
                    Roads: JSONRoads,

                    // virtual layers
                    BoringFont: L.layerGroup().addTo(mymap),
                    Borders: L.layerGroup().addTo(mymap),
                    RoadsCanvas: L.layerGroup().addTo(mymap),
                    MapControl: L.layerGroup().addTo(mymap),
                    Labels: L.layerGroup().addTo(mymap),
                    Factories: L.layerGroup().addTo(mymap),
                    Refineries: L.layerGroup().addTo(mymap),
                    Storage: L.layerGroup().addTo(mymap),
                    WardenRoads: L.layerGroup().addTo(mymap),
                    ColonialRoads: L.layerGroup().addTo(mymap),
                    NeutralRoads: L.layerGroup().addTo(mymap),

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

                    truckSpeed: 3600.0 / 50000.0 / .5, // 45 kmh (75% of 60kmh)
                    jeepSpeed: 3600.0 / 55000.0 / .5,
                    flatbedSpeed: 3600 / 25000.0 / .5,
                    htdSpeed: 3600 / 14500 / .90 / .65,

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

                    showBoringFont: function () {
                        RegionLabels.boring = true;
                        RegionLabels.recalculateSizes();
                        RegionLabels.redraw();
                    },

                    hideBoringFont: function () {
                        RegionLabels.boring = false;
                        RegionLabels.recalculateSizes();
                        RegionLabels.redraw();
                    },

                    hideLabels: function () {
                        RegionLabels.draw = false;
                        RegionLabels.redraw();
                    },

                    showLabels: function () {
                        RegionLabels.draw = true;
                        RegionLabels.redraw();
                    },

                    hideTownHalls: function () {
                        ControlLayer.disableIcons(['MapIconSafehouse.webp', 'MapIconSafehouseWarden.webp', 'MapIconSafehouseColonial.webp', 'MapIconStaticBase1.webp', 'MapIconStaticBase2.webp', 'MapIconStaticBase3.webp', 'MapIconKeep.webp', 'MapIconRelicBase.webp',
                            'MapIconStaticBase1Warden.webp', 'MapIconStaticBase2Warden.webp', 'MapIconStaticBase3Warden.webp', 'MapIconKeepWarden.webp', 'MapIconRelicBaseWarden.webp',
                            'MapIconStaticBase1Colonial.webp', 'MapIconStaticBase2Colonial.webp', 'MapIconStaticBase3Colonial.webp', 'MapIconKeepColonial.webp', 'MapIconRelicBaseColonial.webp'
                        ]);
                        ControlLayer.redraw();
                    },

                    showBorders: function () {
                        ControlLayer.drawHexes = true;
                        ControlLayer.redraw();
                    },

                    hideBorders: function () {
                        ControlLayer.drawHexes = false;
                        ControlLayer.redraw();
                    },

                    showTownHalls: function () {
                        ControlLayer.enableIcons(['MapIconSafehouse.webp', 'MapIconSafehouseWarden.webp', 'MapIconSafehouseColonial.webp', 'MapIconStaticBase1.webp', 'MapIconStaticBase2.webp', 'MapIconStaticBase3.webp', 'MapIconKeep.webp', 'MapIconRelicBase.webp',
                            'MapIconStaticBase1Warden.webp', 'MapIconStaticBase2Warden.webp', 'MapIconStaticBase3Warden.webp', 'MapIconKeepWarden.webp', 'MapIconRelicBaseWarden.webp',
                            'MapIconStaticBase1Colonial.webp', 'MapIconStaticBase2Colonial.webp', 'MapIconStaticBase3Colonial.webp', 'MapIconKeepColonial.webp', 'MapIconRelicBaseColonial.webp'
                        ]);
                        ControlLayer.redraw();
                    },

                    hideControl: function () {
                        ControlLayer.draw = false;
                        ControlLayer.redraw();
                    },

                    showControl: function () {
                        ControlLayer.draw = true;
                        ControlLayer.redraw();
                    },

                    showQuality: function () {
                        ControlLayer.quality = true;
                        ControlLayer.redraw();
                    },

                    hideQuality: function () {
                        ControlLayer.quality = false;
                        ControlLayer.redraw();
                    },

                    hideColonial: function () {
                        ControlLayer.controls[0] = false;
                        ControlLayer.redraw();
                    },

                    showColonial: function () {
                        ControlLayer.controls[0] = true;
                        ControlLayer.redraw();
                    },

                    hideWarden: function () {
                        ControlLayer.controls[1] = false;
                        ControlLayer.redraw();
                    },

                    showWarden: function () {
                        ControlLayer.controls[1] = true;
                        ControlLayer.redraw();
                    },

                    hideNeutral: function () {
                        ControlLayer.controls[3] = false;
                        ControlLayer.controls[2] = false;
                        ControlLayer.redraw();
                    },

                    showNeutral: function () {
                        ControlLayer.controls[2] = true;
                        ControlLayer.controls[3] = true;
                        ControlLayer.redraw();
                    },

                    hideOffline: function () {
                        ControlLayer.controls[2] = false;
                        ControlLayer.redraw();
                    },

                    showOffline: function () {
                        ControlLayer.controls[2] = true;
                        ControlLayer.redraw();
                    },

                    hideSalvage: function () {
                        ControlLayer.disableIcons(['MapIconSalvage.webp', 'MapIconSalvageMine.webp', 'MapIconSalvageWarden.webp', 'MapIconSalvageMineWarden.webp', 'MapIconSalvageColonial.webp', 'MapIconSalvageMineColonial.webp']);
                        ControlLayer.redraw();
                    },

                    showSalvage: function () {
                        ControlLayer.enableIcons(['MapIconSalvage.webp', 'MapIconSalvageMine.webp', 'MapIconSalvageWarden.webp', 'MapIconSalvageMineWarden.webp', 'MapIconSalvageColonial.webp', 'MapIconSalvageMineColonial.webp']);
                        ControlLayer.redraw();
                    },

                    hideComponents: function () {
                        ControlLayer.disableIcons(['MapIconComponents.webp', 'MapIconComponentMine.webp', 'MapIconComponentsWarden.webp', 'MapIconComponentMineWarden.webp', 'MapIconComponentsColonial.webp', 'MapIconComponentMineColonial.webp']);
                        ControlLayer.redraw();
                    },

                    showComponents: function () {
                        ControlLayer.enableIcons(['MapIconComponents.webp', 'MapIconComponentMine.webp', 'MapIconComponentsWarden.webp', 'MapIconComponentMineWarden.webp', 'MapIconComponentsColonial.webp', 'MapIconComponentMineColonial.webp']);
                        ControlLayer.redraw();
                    },

                    hideStorage: function () {
                        ControlLayer.disableIcons(['MapIconStorageFacility.webp', 'MapIconSeaport.webp', 'MapIconStorageFacilityWarden.webp', 'MapIconSeaportWarden.webp', 'MapIconStorageFacilityColonial.webp', 'MapIconSeaportColonial.webp']);
                        ControlLayer.redraw();
                    },

                    showStorage: function () {
                        ControlLayer.enableIcons(['MapIconStorageFacility.webp', 'MapIconSeaport.webp', 'MapIconStorageFacilityWarden.webp', 'MapIconSeaportWarden.webp', 'MapIconStorageFacilityColonial.webp', 'MapIconSeaportColonial.webp']);
                        ControlLayer.redraw();
                    },

                    hideSulfur: function () {
                        ControlLayer.disableIcons(['MapIconSulfur.webp', 'MapIconSulfurMine.webp', 'MapIconSulfurWarden.webp', 'MapIconSulfurMineWarden.webp', 'MapIconSulfurColonial.webp', 'MapIconSulfurMineColonial.webp']);
                        ControlLayer.redraw();
                    },

                    showSulfur: function () {
                        ControlLayer.enableIcons(['MapIconSulfur.webp', 'MapIconSulfurMine.webp', 'MapIconSulfurWarden.webp', 'MapIconSulfurMineWarden.webp', 'MapIconSulfurColonial.webp', 'MapIconSulfurMineColonial.webp']);
                        ControlLayer.redraw();
                    },

                    hideRefineries: function () {
                        ControlLayer.disableIcons(['MapIconManufacturing.webp', 'MapIconManufacturingWarden.webp', 'MapIconManufacturingColonial.webp']);
                        ControlLayer.redraw();
                    },

                    showRefineries: function () {
                        //
                        ControlLayer.enableIcons(['MapIconManufacturing.webp', 'MapIconManufacturingWarden.webp', 'MapIconManufacturingColonial.webp']);
                        ControlLayer.redraw();
                    },

                    showFuel: function () {
                        ControlLayer.enableIcons(['MapIconOilWell.webp', 'MapIconOilWellWarden.webp', 'MapIconOilWellColonial.webp']);
                        ControlLayer.redraw();
                    },

                    hideFuel: function () {
                        ControlLayer.disableIcons(['MapIconOilWell.webp', 'MapIconOilWellWarden.webp', 'MapIconOilWellColonial.webp']);
                        ControlLayer.redraw();
                    },


                    showFactories: function () {
                        ControlLayer.enableIcons(['MapIconFactory.webp', 'MapIconMassProductionFactory.webp', 'MapIconConstructionYard.webp', 'MapIconFactoryWarden.webp', 'MapIconMassProductionFactoryWarden.webp', 'MapIconConstructionYardWarden.webp', 'MapIconFactoryColonial.webp', 'MapIconMassProductionFactoryColonial.webp', 'MapIconConstructionYardColonial.webp']);
                        ControlLayer.redraw();
                    },

                    hideFactories: function () {
                        ControlLayer.disableIcons(['MapIconFactory.webp', 'MapIconMassProductionFactory.webp', 'MapIconConstructionYard.webp', 'MapIconFactoryWarden.webp', 'MapIconMassProductionFactoryWarden.webp', 'MapIconConstructionYardWarden.webp', 'MapIconFactoryColonial.webp', 'MapIconMassProductionFactoryColonial.webp', 'MapIconConstructionYardColonial.webp']);
                        ControlLayer.redraw();
                    },

                    screenshot: function () {
                        let c = document.createElement("canvas");
                        var pixelScale = 1; // temporarily disabled: window.devicePixelRatio;
                        c.width = pixelScale * (window.innerWidth - getPanelWidth());
                        c.height = pixelScale * (window.innerHeight - getPanelHeight());
                        c.setAttribute("crossorigin", "Anonymous");
                        c.crossorigin = "Anonymous";
                        this.render_view(c, pixelScale);
                        c.toBlob((blob) => {
                            require('file-saver').saveAs(blob, new Date().toUTCString().concat('.webp'));
                        }, "image/webp", .9);
                    },

                    copy: function () {
                        let c = document.createElement("canvas");
                        var pixelScale = 1; // temporarily disabled: window.devicePixelRatio;
                        c.width = pixelScale * (window.innerWidth - getPanelWidth());
                        c.height = pixelScale * (window.innerHeight - getPanelHeight());
                        c.setAttribute("crossorigin", "Anonymous");
                        c.crossorigin = "Anonymous";
                        this.render_view(c, pixelScale);
                        c.toBlob((blob) => {
                            try {
                                navigator.clipboard.write([
                                    new ClipboardItem({
                                        'image/png': blob
                                    })
                                ]);
                            }
                            catch (error) {
                                console.log(error);
                            }
                        }, "image/png", .9);
                    },

                    update_copy_paste: function (copy_paste_canvas, scale) {
                        this.render_view(copy_paste_canvas, scale);
                    },


                    render_view: function (c, scale) {
                        if (scale == null)
                            scale = 2; // temporarily disabled: window.devicePixelRatio;// 2;

                        //var pixelRatio = 2;//window.devicePixelRatio;
                        let ctx = c.getContext("2d");
                        ctx.imageSmoothingQuality = 'high';
                        ctx.save();
                        ctx.scale(scale, scale);
                        ctx.fillStyle = '#FF000000';
                        ctx.fillRect(0, 0, c.width, c.height);
                        for (let e of document.getElementsByClassName("leaflet-tile")) {
                            if (e.localName == "canvas" && !e.classList.contains('logiwaze-text') && e.classList.contains('leaflet-tile-loaded')) {
                                var offset = e.style.transform.match(/translate3d\(([^\)]+)\)/i)[1].replace(/px/ig, '').split(',');
                                let x = parseFloat(offset[0]); // these can be extracted from a private member in the e object, this is more work but seems more stable
                                let y = parseFloat(offset[1]);
                                let tt = e.parentElement.style.transform;
                                let parent_translate = /translate3d\(.*\)/i.test(tt) ? tt.match(/translate3d\(([^\(]+)\)/i)[1].replace(/px/ig, '').split(',') : "0,0";
                                let parent_scale = /scale\(.*\)/i.test(tt) ? parseFloat(tt.match(/scale\(([^\(]+)\)/i)[1]) : 1;
                                let camera = e.parentElement.parentElement.parentElement.parentElement.style.transform.match(/translate3d\(([^\)]+)\)/i)[1].split(',');
                                let cx = parseFloat(camera[0].replace(/px/ig, ''));
                                let cy = parseFloat(camera[1].replace(/px/ig, ''));
                                ctx.drawImage(e,
                                    (parent_scale * x + parseFloat(parent_translate[0]) + cx),
                                    (parent_scale * y + parseFloat(parent_translate[1]) + cy),
                                    e.width * parent_scale / scale,
                                    e.height * parent_scale / scale
                                );
                            }
                        }

                        for (let e of document.getElementsByClassName("leaflet-tile")) {
                            if (e.localName == "canvas" && e.classList.contains('logiwaze-text') && e.classList.contains('leaflet-tile-loaded')) { // 
                                var offset = e.style.transform.match(/translate3d\(([^\)]+)\)/i)[1].replace(/px/ig, '').split(',');
                                let x = parseFloat(offset[0]); // these can be extracted from a private member in the e object, this is more work but seems more stable
                                let y = parseFloat(offset[1]);
                                let sx = parseFloat(e.style.width.replace(/px/ig, ''));
                                let sy = parseFloat(e.style.height.replace(/px/ig, ''));
                                let rx = sx / e.width;
                                let ry = sy / e.height;

                                let tt = e.parentElement.style.transform;
                                let parent_translate = /translate3d\(.*\)/i.test(tt) ? tt.match(/translate3d\(([^\(]+)\)/i)[1].replace(/px/ig, '').split(',') : "0,0";
                                let parent_scale = /scale\(.*\)/i.test(tt) ? parseFloat(tt.match(/scale\(([^\(]+)\)/i)[1]) : 1;

                                let camera = e.parentElement.parentElement.parentElement.parentElement.style.transform.match(/translate3d\(([^\)]+)\)/i)[1].split(',');
                                let cx = parseFloat(camera[0].replace(/px/ig, ''));
                                let cy = parseFloat(camera[1].replace(/px/ig, ''));

                                ctx.drawImage(e,
                                    parent_scale * x + parseFloat(parent_translate[0]) + cx,
                                    parent_scale * y + parseFloat(parent_translate[1]) + cy,
                                    e.width * parent_scale * rx, e.height * parent_scale * ry);
                            }
                        }
                        ctx.restore();


                        this.drawRouteLine(ctx);
                    },

                    routeLine: function (route, options) {
                        return new Line(route, options);
                    },

                    marker: null,
                    marker_shadow: null,

                    drawRouteLine: function (ctx) {
                        let cam = mymap.getPixelBounds();
                        let cx = cam.min.x;
                        let cy = cam.min.y;



                        if (this.Control.routeSelected != null) {
                            ctx.save();
                            var pixelScale = 2; // temporarily disabled: window.devicePixelRatio;
                            ctx.scale(pixelScale, pixelScale);
                            for (let style of [
                                { color: 'black', opacity: 0.15, weight: 9 },
                                { color: 'white', opacity: 0.8, weight: 6 },
                                { color: this.Control.routeSelected.name == "Shortest Route" ? "#9E3031" : "#5E9339", opacity: 1, weight: 2 }]) {

                                ctx.save();
                                ctx.beginPath();

                                if (style.color == "#9E3031" || style.color == "#5E9339")
                                    ctx.setLineDash([10, 10]);

                                ctx.lineCap = 'round';
                                ctx.strokeStyle = style.color;
                                ctx.lineWidth = style.weight;
                                ctx.opacity = style.opacity;
                                let first = true;
                                for (let s of this.Control.routeSelected.coordinates) {
                                    let u = mymap.project(s);
                                    if (first)
                                        ctx.moveTo(u.x - cx, u.y - cy);
                                    else
                                        ctx.lineTo(u.x - cx, u.y - cy);
                                    first = false;
                                }
                                ctx.stroke();
                                ctx.restore();
                            }

                            let u = this.Control.routeSelected.waypoints;
                            let marker_loaded = false;
                            let marker_shadow_loaded = false;

                            function drawMarkers(ctx) {
                                for (let m of u) {
                                    let p = mymap.project([m.latLng.lat, m.latLng.lng]);
                                    ctx.drawImage(marker_shadow, p.x - cx - marker.width / 2, p.y - cy - marker.height);
                                }
                                for (let m of u) {
                                    let p = mymap.project([m.latLng.lat, m.latLng.lng]);
                                    ctx.drawImage(marker, p.x - cx - marker.width / 2, p.y - cy - marker.height);
                                }
                                ctx.restore();
                            }

                            let marker = this.marker, marker_shadow = this.marker_shadow;
                            if (marker == null) {
                                this.marker = marker = new Image();
                                marker.src = "marker-icon.png";
                                marker.onload = function () {
                                    marker_loaded = true; if (marker_shadow_loaded && marker_loaded) drawMarkers(ctx);
                                }
                                this.marker_shadow = marker_shadow = new Image();
                                marker_shadow.src = "marker-shadow.png";
                                marker_shadow.onload = function () {
                                    marker_shadow_loaded = true; if (marker_shadow_loaded && marker_loaded) drawMarkers(ctx);
                                }
                                // set up the cache on this
                            }
                            else
                                setTimeout(() => drawMarkers(ctx), 0);

                        }
                    },

                    narrate: function () {
                        Narrator.giveDirections(FoxholeRouter.currentRoute.instructions);
                    },

                    cardinalDirections: ['East', 'Northeast', 'North', 'Northwest', 'West', 'Southwest', 'South', 'Southeast'],

                    angleToDirection: function (angle) {
                        return FoxholeRouter.cardinalDirections[parseInt(Math.round((angle / (Math.PI * 2)) * 8)) % 8];
                    },

                    LocateTown: function (name) {

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

                            calcDistance = (x, y) => Math.sqrt(Math.pow(y[0] - x[0], 2) + Math.pow(y[1] - x[1], 2));

                            let sums = [0, 0, 0];
                            for (let i = 0; i < opath.path.length - 1; i++)
                                sums[(opath.path[i][3] - 1) % 3] += calcDistance(opath.path[i], opath.path[i + 1]);

                            let sumSum = sums[0] + sums[1] + sums[2];

                            return {
                                name: name,
                                summary:
                                {
                                    totalTime: distance,
                                    totalDistance: {
                                        distance: distance,
                                        breakdown: [sums[0] / sumSum, sums[1] / sumSum, sums[2] / sumSum]
                                    }
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
