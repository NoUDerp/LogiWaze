define(['jquery', 'point-in-polygon', '@sakitam-gis/kriging', '../towns.json'], function ($, pip, kriging, towns) {
    return {
        API: function () {
            var width = 256 / 5.5;
            var height = width * Math.sqrt(3) / 2;
            var halfwidth = width * .5;
            var halfheight = height * .5;

            var regionPolygon = [[halfwidth * .5, halfheight], [halfwidth, 0], [halfwidth * .5, -halfheight], [-halfwidth * .5, -halfheight], [-halfwidth, 0], [-halfwidth * .5, halfheight]];
            var ox = 128;
            var oy = -128;
            var regions = [
                { name: "GodcroftsHex", realName: "Godcrofts", y: .5 * height + oy, x: 2.25 * width + ox },
                { name: "DeadLandsHex", realName: "Deadlands", y: oy, x: ox },
                { name: "ReachingTrailHex", realName: "Reaching Trail", y: oy + 2 * height, x: ox },
                { name: "CallahansPassageHex", realName: "Callahan's Passage", y: oy + height, x: ox },
                { name: "MarbanHollow", realName: "Marban Hollow", y: oy + .5 * height, x: ox + .75 * width },
                { name: "UmbralWildwoodHex", realName: "Umbral Wildwood", y: oy - height, x: ox },
                { name: "HeartlandsHex", realName: "Heartlands", y: oy - 1.5 * height, x: ox - .75 * width },
                { name: "LochMorHex", realName: "Loch Mor", y: oy - .5 * height, x: ox - .75 * width },
                { name: "LinnMercyHex", realName: "Linn of Mercy", y: oy + .5 * height, x: ox - .75 * width },
                { name: "StonecradleHex", realName: "Stonecradle", y: oy + height, x: ox - 1.5 * width },
                { name: "FarranacCoastHex", realName: "Farranac Coast", y: oy, x: ox - 1.5 * width },
                { name: "WestgateHex", realName: "Westgate", y: oy - height, x: ox - 1.5 * width },
                { name: "FishermansRowHex", realName: "Fisherman's Row", y: oy - .5 * height, x: ox - 2.25 * width },
                { name: "OarbreakerHex", realName: "Oarbreaker", y: oy + .5 * height, x: ox - 2.25 * width },
                { name: "GreatMarchHex", realName: "The Great March", y: oy - 2 * height, x: ox },
                { name: "TempestIslandHex", realName: "Tempest Island", y: oy - .5 * height, x: ox + 2.25 * width },
                { name: "EndlessShoreHex", realName: "Endless Shore", y: oy, x: ox + 1.5 * width },
                { name: "AllodsBightHex", realName: "Allods Bight", y: oy - height, x: ox + 1.5 * width },
                { name: "WeatheredExpanseHex", realName: "Weathered Expanse", y: oy + height, x: ox + 1.5 * width },
                { name: "DrownedValeHex", realName: "Drowned Vale", y: oy - .5 * height, x: ox + .75 * width },
                { name: "ShackledChasmHex", realName: "Shackled Chasm", y: oy - 1.5 * height, x: ox + .75 * width },
                { name: "ViperPitHex", realName: "Viper Pit", y: oy + 1.5 * height, x: ox + .75 * width },
                { name: "MooringCountyHex", realName: "Mooring County", y: oy + 1.5 * height, x: ox - .75 * width }
            ];

            var regionNameMap = [];
            for (var i = 0; i < regions.length; i++)
                regionNameMap[regions[i].name] = regions[i].realName;

            function APIQuery(URL, success, error) {

                // find the etag in the localstorage first
                var existing_etag = window.localStorage.getItem('etag-'.concat(URL));
                var existing = window.localStorage.getItem(URL);

                let result = null;

                $.ajax(
                    {
                        url: URL,
                        type: 'GET',
                        crossDomain: true,
                        data: "json",
                        dataType: "json",
                        cache: false,
                        beforeSend: function (xhr) {
                            if (existing_etag != null && existing_etag != "null")
                                xhr.setRequestHeader('If-None-Match', existing_etag);
                        },
                        ifModified: true,
                        success: function (r) {
                            result = r;
                            success(result);
                        },
                        complete: function (xhr, status) {
                            var eTag = xhr.getResponseHeader('ETag');
                            if (eTag != null && status == "success") {
                                window.localStorage.setItem('etag-'.concat(URL), eTag);
                                window.localStorage.setItem(URL, JSON.stringify(result));
                            }
                            // store this result in the database
                        },
                        error: function (xhr, status, error_thrown) {
                            if (status == "notmodified" && existing != null)
                                success(JSON.parse(existing));
                            else
                                error(xhr, status, error_thrown);
                        }
                    }
                );
            }


            var API = {
                regions: regions,
                mapRegionName: function (x) {
                    return regionNameMap[x];
                },
                calculateRegion: function (x, y) {
                    for (var i = 0; i < regions.length; i++) {
                        var region = regions[i];


                        if (pip([x - region.x, - region.y + y], regionPolygon))
                            return region.name;
                    }
                    return null;
                },
                mapControl: {},
                resources: {},
                remapXY: function (f) {
                    if (f === "GodcroftsHex") return { x: 148.15477, y: -23.27272 };
                    if (f === "DeadLandsHex") return { x: 128, y: -128 };
                    if (f === "ReachingTrailHex") return { x: 208.6191, y: -128 };
                    if (f === "CallahansPassageHex") return { x: 168.30954, y: -128 };
                    if (f === "MarbanHollowHex") return { x: 148.15477, y: -93.09091 };
                    if (f === "MarbanHollow") return { x: 148.15477, y: -93.09091 };
                    if (f === "UmbralWildwoodHex") return { x: 87.69045, y: -128 };
                    if (f === "MoorsHex") return { x: 188.46432, y: -162.90909 };
                    if (f === "MooringCountyHex") return { x: 188.46432, y: -162.90909 };
                    if (f === "HeartlandsHex") return { x: 67.535675, y: -162.90909 };
                    if (f === "LochMorHex") return { x: 107.84523, y: -162.90909 };
                    if (f === "LinnOfMercyHex") return { x: 148.15477, y: -162.90909 };
                    if (f === "LinnMercyHex") return { x: 148.15477, y: -162.90909 };
                    if (f === "StonecradleHex") return { x: 168.30954, y: -197.81818 };
                    if (f === "FarranacCoastHex") return { x: 128, y: -197.81818 };
                    if (f === "WestgateHex") return { x: 87.69045, y: -197.81818 };
                    if (f === "FishermansRowHex") return { x: 107.84523, y: -232.72728 };
                    if (f === "OarbreakerHex") return { x: 148.15477, y: -232.72728 };
                    if (f === "GreatMarchHex") return { x: 47.380905, y: -128 };
                    if (f === "TempestIslandHex") return { x: 107.84523, y: -23.27272 };
                    if (f === "EndlessShoreHex") return { x: 128, y: -58.181816 };
                    if (f === "AllodsBightHex") return { x: 87.69045, y: -58.181816 };
                    if (f === "WeatheredExpanseHex") return { x: 168.30954, y: -58.181816 };
                    if (f === "DrownedValeHex") return { x: 107.84523, y: -93.09091 };
                    if (f === "ShackledChasmHex") return { x: 67.535675, y: -93.09091 };
                    if (f === "ViperPitHex") return { x: 188.46432, y: -93.09091 };
                    return { x: 0, y: 0 };
                },

                ownership: function (x, y, region) {
                    var u = API.mapControl[region];
                    if (u === null || typeof u === 'undefined')
                        return "OFFLINE";

                    var distanceSquared = -1;
                    var icon = -1;
                    var keys = Object.keys(u);
                    for (var i = 0; i < keys.length; i++) {
                        var j = u[keys[i]];
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

                    var c = kriging.predict(x, y, API.variogram);
                    return { ownership: c < -.25 ? "WARDENS" : (c > .25 ? "COLONIALS" : "NONE"), icon: icon };
                },

                control: (x, y) => kriging.predict(x, y, API.variogram),

                update: function (completionCallback, shard) {

                    if (shard == null)
                        shard = 'war-service-live';
                    else
                        shard = 'war-service-live-'.concat(shard);
                    APIQuery("https://".concat(shard).concat(".foxholeservices.com/api/worldconquest/maps"),
                        function (maps) {
                            // iterate here on the maps and collect status
                            var complete = maps.length;
                            var p_x = [], p_y = [], p_t = [];

                            for (var i = 0; i < maps.length; i++) {
                                const mapName = maps[i];
                                $.ajax(
                                    {
                                        url: "https://".concat(shard).concat(".foxholeservices.com/api/worldconquest/maps/").concat(maps[i]).concat("/dynamic/public"),
                                        type: 'GET',
                                        crossDomain: true,
                                        data: "json",
                                        dataType: "json",
                                        success: function (mapData) {
                                            if (mapData.mapItems.length > 0) {
                                                API.mapControl[mapName] = [];
                                                API.resources[mapName] = [];
                                                var offset = API.remapXY(mapName);
                                                for (var j = 0; j < mapData.mapItems.length; j++) {
                                                    var icon = mapData.mapItems[j].iconType;
                                                    if (icon == 35 || (icon >= 5 && icon <= 10) || (icon >= 45 && icon <= 47) || icon == 29 || icon == 17 || icon == 34 || icon == 51 || icon == 39 || icon == 52 || icon == 33 || icon == 18 || icon == 19) {
                                                        var x = mapData.mapItems[j].x;
                                                        var y = mapData.mapItems[j].y;
                                                        x = 256 + (((x * 46.54545454545455) + offset.y) - 23.27272727272727);
                                                        y = -256 + ((((1 - y) * 40.30954606705751) + offset.x) - 20.15477303352875);
                                                        var key = x.toFixed(3).toString().concat('|').concat(y.toFixed(3).toString());
                                                        var control = mapData.mapItems[j].teamId;
                                                        API.mapControl[mapName][key] = { x: x, y: y, control: control, mapIcon: icon, nuked: (mapData.mapItems[j].flags & 0x10) != 0, town: ((icon >= 5 && icon <= 10) || (icon >= 45 && icon <= 47) || icon == 29) };

                                                        if ((mapData.mapItems[j].flags & 0x10) == 0 && (control != "OFFLINE" && (icon == 35 || (icon >= 5 && icon <= 10) || (icon >= 45 && icon <= 47) || icon == 29))) {
                                                            p_x.push(x);
                                                            p_y.push(y);
                                                            p_t.push(control == "WARDENS" ? -1 : (control == "COLONIALS" ? 1 : 0));
                                                        }
                                                    }
                                                    else {
                                                        var x = mapData.mapItems[j].x;
                                                        var y = mapData.mapItems[j].y;
                                                        x = 256 + (((x * 46.54545454545455) + offset.y) - 23.27272727272727);
                                                        y = -256 + ((((1 - y) * 40.30954606705751) + offset.x) - 20.15477303352875);
                                                        var key = x.toFixed(3).toString().concat('|').concat(y.toFixed(3).toString());
                                                        API.resources[mapName][key] = {
                                                            x: x, y: y, control: mapData.mapItems[j].teamId, mapIcon: icon, nuked: (mapData.mapItems[j].flags & 0x10) != 0
                                                        };
                                                    }
                                                }

                                            }


                                            if (--complete == 0) {
                                                API.variogram = kriging.train(p_t, p_x, p_y, 'exponential', 0, 100);
                                                completionCallback();
                                            }

                                        },
                                        error: function (failure) { --complete; alert(JSON.stringify(failure)); }
                                    }
                                );
                            }
                        },
                        function (e) { alert(JSON.stringify(e)); }
                    );
                }
            };
            return API;
        }
    }
});

