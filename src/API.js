const pip = require('point-in-polygon');
const kriging = require('@sakitam-gis/kriging');
const superagent = require('superagent');

var height = 256 / 7;
var width = height * 2 / Math.sqrt(3);
var halfwidth = width * .5;
var halfheight = height * .5;

let regionPolygon = [[halfwidth * .5, halfheight], [halfwidth, 0], [halfwidth * .5, -halfheight], [-halfwidth * .5, -halfheight], [-halfwidth, 0], [-halfwidth * .5, halfheight]];
let ox = 0;
let oy = 0;
let regions = [
    { name: "NevishLineHex", realName: "Nevish Line", y: oy + 1.5 * height, x: ox - 2.25 * width },
    { name: "AcrithiaHex", realName: "Acrithia", y: oy - 2.5 * height, x: ox + .75 * width },
    { name: "RedRiverHex", realName: "Red River", y: oy - 2.5 * height, x: ox - .75 * width },
    { name: "CallumsCapeHex", realName: "Callum's Cape", y: oy + 2 * height, x: ox - 1.5 * width },
    { name: "SpeakingWoodsHex", realName: "Speaking Woods", y: oy + 2.5 * height, x: ox - .75 * width },
    { name: "BasinSionnachHex", realName: "Basin Sionnach", y: oy + 3 * height, x: ox },
    { name: "HowlCountyHex", realName: "Howl County", y: oy + 2.5 * height, x: ox + .75 * width },
    { name: "ClansheadValleyHex", realName: "Clanshead Valley", y: oy + 2 * height, x: ox + 1.5 * width },
    { name: "MorgensCrossingHex", realName: "Morgen's Crossing", y: oy + 1.5 * height, x: ox + 2.25 * width },
    { name: "TheFingersHex", realName: "The Fingers", y: oy - 1.5 * height, x: ox + 2.25 * width },
    { name: "TerminusHex", realName: "Terminus", y: oy - 2 * height, x: ox + 1.5 * width },
    { name: "KalokaiHex", realName: "Kalokai", y: oy - 3 * height, x: ox },
    { name: "AshFieldsHex", realName: "Ash Fields", y: oy - 2 * height, x: ox - 1.5 * width },
    { name: "OriginHex", realName: "Origin", y: oy - 1.5 * height, x: ox - 2.25 * width },
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


            if (pip([x - region.x - 128, - region.y + y + 128], regionPolygon))
                return region.name;
        }
        return null;
    },
    mapControl: {},
    resources: {},
    remapXY: function (f) {
        var k = 256 / 7;
        var w = k * 2 / Math.sqrt(3);
        if (f == "DeadLandsHex") return { x: 0, y: 0 };
        if (f == "CallahansPassageHex") return { x: 0, y: k };
        if (f == "MarbanHollow") return { x: 0.75 * w, y: 0.5 * k };
        if (f == "UmbralWildwoodHex") return { x: 0, y: -k };
        if (f == "MooringCountyHex") return { x: -0.75 * w, y: 1.5 * k };
        if (f == "HeartlandsHex") return { x: -0.75 * w, y: - 1.5 * k };
        if (f == "LochMorHex") return { x: -0.75 * w, y: -0.5 * k };
        if (f == "LinnMercyHex") return { x: -0.75 * w, y: 0.5 * k };
        if (f == "ReachingTrailHex") return { x: 0, y: 2 * k };
        if (f == "StonecradleHex") return { x: -1.5 * w, y: k };
        if (f == "FarranacCoastHex") return { x: -1.5 * w, y: 0 };
        if (f == "WestgateHex") return { x: -1.5 * w, y: -k };
        if (f == "FishermansRowHex") return { x: -2.25 * w, y: -0.5 * k };
        if (f == "OarbreakerHex") return { x: -2.25 * w, y: 0.5 * k };
        if (f == "GreatMarchHex") return { x: 0, y: -2 * k };
        if (f == "TempestIslandHex") return { x: 2.25 * w, y: -0.5 * k };
        if (f == "GodcroftsHex") return { x: 2.25 * w, y: 0.5 * k };
        if (f == "EndlessShoreHex") return { x: 1.5 * w, y: 0 };
        if (f == "AllodsBightHex") return { x: 1.5 * w, y: -k };
        if (f == "WeatheredExpanseHex") return { x: 1.5 * w, y: k };
        if (f == "DrownedValeHex") return { x: 0.75 * w, y: -0.5 * k };
        if (f == "ShackledChasmHex") return { x: 0.75 * w, y: -1.5 * k };
        if (f == "ViperPitHex") return { x: 0.75 * w, y: 1.5 * k };
        if (f == "NevishLineHex") return { x: -2.25 * w, y: 1.5 * k };
        if (f == "AcrithiaHex") return { x: 0.75 * w, y: -2.5 * k };
        if (f == "RedRiverHex") return { x: -0.75 * w, y: -2.5 * k };
        if (f == "CallumsCapeHex") return { x: -1.5 * w, y: 2 * k };
        if (f == "SpeakingWoodsHex") return { x: -0.75 * w, y: 2.5 * k };
        if (f == "BasinSionnachHex") return { x: 0, y: 3 * k };
        if (f == "HowlCountyHex") return { x: 0.75 * w, y: 2.5 * k };
        if (f == "ClansheadValleyHex") return { x: 1.5 * w, y: 2 * k };
        if (f == "MorgensCrossingHex") return { x: 2.25 * w, y: 1.5 * k };
        if (f == "TheFingersHex") return { x: 2.25 * w, y: -1.5 * k };
        if (f == "TerminusHex") return { x: 1.5 * w, y: -2 * k };
        if (f == "KalokaiHex") return { x: 0, y: -3 * k };
        if (f == "AshFieldsHex") return { x: -1.5 * w, y: -2 * k };
        if (f == "OriginHex") return { x: -2.25 * w, y: -1.5 * k };

        return { x: 0, y: 0 };
    },

    ownership: function (x, y, region) {
        if (!(region in exports.API.mapControl))
            return "OFFLINE";

            x -= 128;
            y += 128;

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
        return kriging.predict(x - 128, y + 128, exports.API.variogram)
    },

    townHallIcons : [35, 5, 6, 7, 8, 9, 10, 45, 46, 47, 29, 17, 34, 51, 39, 52, 33, 18, 19, 56, 57, 58],

    krigingControlPointIcons: [35, 5, 6, 7, 8, 9, 10, 45, 46, 47, 29, 56, 57, 58],

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

                        var yf = 256 / 7;
                        var xf = yf * 2 / Math.sqrt(3);

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
                                            if (exports.API.townHallIcons.includes(icon)) {
                                                var x = mapData.mapItems[j].x;
                                                var y = mapData.mapItems[j].y;
                                                x = (((x * xf) + offset.x) - xf * .5);
                                                y = ((((1 - y) * yf) + offset.y) - yf * .5);
                                                var key = x.toFixed(3).toString().concat('|').concat(y.toFixed(3).toString());
                                                var control = mapData.mapItems[j].teamId;
                                                exports.API.mapControl[mapName][key] = { x: x, y: y, control: control, mapIcon: icon, nuked: (mapData.mapItems[j].flags & 0x10) != 0, town:                                                 exports.API.krigingControlPointIcons.includes(icon)                                                                                                };
                                                if ((mapData.mapItems[j].flags & 0x10) == 0 && control != "OFFLINE" && exports.API.krigingControlPointIcons.includes(icon)) {
                                                    p_x.push(x);
                                                    p_y.push(y);
                                                    p_t.push(control == "WARDENS" ? -1 : (control == "COLONIALS" ? 1 : 0));
                                                }
                                            }
                                            else {
                                                var x = mapData.mapItems[j].x;
                                                var y = mapData.mapItems[j].y;
                                                x = (((x * xf) + offset.x) - xf * .5);
                                                y = ((((1 - y) * yf) + offset.y) - yf * .5);
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

