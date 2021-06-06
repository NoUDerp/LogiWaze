const pip = require('point-in-polygon');
const kriging = require('@sakitam-gis/kriging');
const superagent = require('superagent');

var width = 256 / 5.5;
var height = width * Math.sqrt(3) / 2;
var halfwidth = width * .5;
var halfheight = height * .5;

let regionPolygon = [[halfwidth * .5, halfheight], [halfwidth, 0], [halfwidth * .5, -halfheight], [-halfwidth * .5, -halfheight], [-halfwidth, 0], [-halfwidth * .5, halfheight]];
let ox = 128;
let oy = -128;
let regions = [
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

let regionNameMap = [];
for (var i = 0; i < regions.length; i++)
    regionNameMap[regions[i].name] = regions[i].realName;

function APIQuery(URL, success, error) {
    superagent.get(URL).then(res => {
        success(res.body);
    }).catch(error => { console.log(error); alert("War API cannot be contacted right now: ".concat(error)); });
}


exports.API = {
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
        if (!(region in exports.API.mapControl))
            return "OFFLINE";

        var u = exports.API.mapControl[region];
        var distanceSquared = -1;
        var icon = -1;
        var keys = Object.keys(u);
        for (let key of keys) {
            var j = u[key];
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

        var c = kriging.predict(x, y, exports.API.variogram);
        return { ownership: c < -.25 ? "WARDENS" : (c > .25 ? "COLONIALS" : "NONE"), icon: icon };
    },

    control: (x, y) => {
        return kriging.predict(x, y, exports.API.variogram)
    },

    update: function (completionCallback, shard) {

        if (shard == null)
            shard = 'war-service-live';
        else
            shard = 'war-service-live-'.concat(shard);

        APIQuery("https://".concat(shard).concat(".foxholeservices.com/api/worldconquest/war"),
            function (war) {
                exports.API.war = war;
                //alert(war);
            APIQuery("https://".concat(shard).concat(".foxholeservices.com/api/worldconquest/maps"),
                function (maps) {
                    // iterate here on the maps and collect status
                    var complete = maps.length;
                    var p_x = [], p_y = [], p_t = [];

                    for (var i = 0; i < maps.length; i++) {
                        const mapName = maps[i];
                        APIQuery("https://".concat(shard).concat(".foxholeservices.com/api/worldconquest/maps/").concat(maps[i]).concat("/dynamic/public"),
                            function (mapData) {
                                if (mapData.mapItems.length > 0) {
                                    exports.API.mapControl[mapName] = {};
                                    exports.API.resources[mapName] = {};
                                    var offset = exports.API.remapXY(mapName);
                                    for (var j = 0; j < mapData.mapItems.length; j++) {
                                        var icon = mapData.mapItems[j].iconType;
                                        if (icon == 35 || (icon >= 5 && icon <= 10) || (icon >= 45 && icon <= 47) || icon == 29 || icon == 17 || icon == 34 || icon == 51 || icon == 39 || icon == 52 || icon == 33 || icon == 18 || icon == 19) {
                                            var x = mapData.mapItems[j].x;
                                            var y = mapData.mapItems[j].y;
                                            x = 256 + (((x * 46.54545454545455) + offset.y) - 23.27272727272727);
                                            y = -256 + ((((1 - y) * 40.30954606705751) + offset.x) - 20.15477303352875);
                                            var key = x.toFixed(3).toString().concat('|').concat(y.toFixed(3).toString());
                                            var control = mapData.mapItems[j].teamId;
                                            exports.API.mapControl[mapName][key] = { x: x, y: y, control: control, mapIcon: icon, nuked: (mapData.mapItems[j].flags & 0x10) != 0, town: ((icon >= 5 && icon <= 10) || (icon >= 45 && icon <= 47) || icon == 29) };
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
                                            exports.API.resources[mapName][key] = {
                                                x: x, y: y, control: mapData.mapItems[j].teamId, mapIcon: icon, nuked: (mapData.mapItems[j].flags & 0x10) != 0
                                            };
                                        }
                                    }

                                }


                                if (--complete == 0) {
                                    exports.API.variogram = kriging.train(p_t, p_x, p_y, 'exponential', 0, 100);
                                    completionCallback();
                                }

                            });

                    }
                });
        });
    }
};

