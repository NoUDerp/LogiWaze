const pip = require('point-in-polygon');
const kriging = require('@sakitam-gis/kriging');
const superagent = require('superagent');

var width = 256 / 7;
var height = width * Math.sqrt(3) / 2;
var halfwidth = width * .5;
var halfheight = height * .5;

let regionPolygon = [[halfwidth * .5, halfheight], [halfwidth, 0], [halfwidth * .5, -halfheight], [-halfwidth * .5, -halfheight], [-halfwidth, 0], [-halfwidth * .5, halfheight]];
let ox = 0;
let oy = 0;
let regions = [

    { name: "KingsCageHex", realName: "King's Cage", x: ox - 1.5 * width, y: oy },
    { name: "WestgateHex", realName: "Westgate", x: ox + -2.25 * width, y: oy + -.5 * height },
    { name: "FarranacCoastHex", realName: "Farranac Coast", x: ox + -2.25 * width, y: oy + .5 * height },
    { name: "EndlessShoreHex", realName: "Endless Shore", x: ox + 2.25 * width, y: oy + -.5 * height },
    { name: "StlicanShelfHex", realName: "Stlican Shelf", x: ox + 2.25 * width, y: oy + .5 * height },
    { name: "OarbreakerHex", realName: "Oarbreaker", x: ox + -3 * width, y: oy + 1 * height },
    { name: "FishermansRowHex", realName: "Fisherman's Row", x: ox + -3 * width, y: oy + 0 * height },
    { name: "StemaLandingHex", realName: "Stema Landing", x: ox + -3 * width, y: oy + -1 * height },
    { name: "GodcroftsHex", realName: "Godcrofts", x: ox + 3 * width, y: oy + 1 * height },
    { name: "SableportHex", realName: "Sableport", x: ox + -1.5 * width, y: oy + -1 * height },
    { name: "TempestIslandHex", realName: "Tempest Island", x: ox + 3 * width, y: oy + 0 * height },
    { name: "ReaversPassHex", realName: "Reaver's Pass", x: ox + 2.25 * width, y: oy + -1.5 * height },
    { name: "TheFingersHex", realName: "TheFingersHex", x: ox + 3 * width, y: oy + -1 * height },
    { name: "ClahstraHex", realName: "The Clahstra", x: ox + 1.5 * width, y: oy + 0 * height },
    { name: "DeadLandsHex", realName: "Deadlands", x: ox + 0 * width, y: oy + 0 * height },
    { name: "CallahansPassageHex", realName: "Callahan's Passage", x: ox + 0 * width, y: oy + 1 * height },
    { name: "MarbanHollow", realName: "Marban Hollow", x: ox + .75 * width, y: oy + .5 * height },
    { name: "UmbralWildwoodHex", realName: "Umbral Wildwood", x: ox + 0 * width, y: oy + -1 * height },
    { name: "MooringCountyHex", realName: "The Moors", x: ox + -.75 * width, y: oy + 1.5 * height },
    { name: "HeartlandsHex", realName: "Heartlands", x: ox + -.75 * width, y: oy + -1.5 * height },
    { name: "LochMorHex", realName: "Loch Mór", x: ox + -.75 * width, y: oy + -.5 * height },
    { name: "LinnMercyHex", realName: "Linn of Mercy", x: ox + -.75 * width, y: oy + .5 * height },
    { name: "ReachingTrailHex", realName: "Reaching Trail", x: ox + 0 * width, y: oy + 2 * height },
    { name: "StonecradleHex", realName: "Stonecradle", x: ox + -1.5 * width, y: oy + 1 * height },
    { name: "GreatMarchHex", realName: "Great March", x: ox + 0 * width, y: oy + -2 * height },
    { name: "AllodsBightHex", realName: "Allod's Bight", x: ox + 1.5 * width, y: oy + -1.0 * height },
    { name: "WeatheredExpanseHex", realName: "Weathered Expanse", x: ox + 1.5 * width, y: oy + 1.0 * height },
    { name: "DrownedValeHex", realName: "Drowned Vale", x: ox + .75 * width, y: oy + -.5 * height },
    { name: "ShackledChasmHex", realName: "Shackled Chasm", x: ox + .75 * width, y: oy + -1.5 * height },
    { name: "ViperPitHex", realName: "Viper Pit", x: ox + .75 * width, y: oy + 1.5 * height },
    { name: "NevishLineHex", realName: "Nevish Line", x: ox + -2.25 * width, y: oy + 1.5 * height },
    { name: "AcrithiaHex", realName: "Acrithia", x: ox + .75 * width, y: oy + -2.5 * height },
    { name: "RedRiverHex", realName: "Red River", x: ox + -.75 * width, y: oy + -2.5 * height },
    { name: "CallumsCapeHex", realName: "Callum's Cape", x: ox + -1.5 * width, y: oy + 2 * height },
    { name: "SpeakingWoodsHex", realName: "Speaking Woods", x: ox + -.75 * width, y: oy + 2.5 * height },
    { name: "BasinSionnachHex", realName: "Basin Sionnach", x: ox + 0 * width, y: oy + 3 * height },
    { name: "HowlCountyHex", realName: "Howl County", x: ox + .75 * width, y: oy + 2.5 * height },
    { name: "ClansheadValleyHex", realName: "Clanshead Valley", x: ox + 1.5 * width, y: oy + 2 * height },
    { name: "MorgensCrossingHex", realName: "Morgen's Crossing", x: ox + 2.25 * width, y: oy + 1.5 * height },
    { name: "TerminusHex", realName: "Terminus", x: ox + 1.5 * width, y: oy + -2 * height },
    { name: "KalokaiHex", realName: "Kalokai", x: ox + 0 * width, y: oy + -3 * height },
    { name: "AshFieldsHex", realName: "Ash Fields", x: ox + -1.5 * width, y: oy + -2 * height },
    { name: "OriginHex", realName: "Origin", x: ox + -2.25 * width, y: oy + -1.5 * height }
];

let regionNameMap = [];
for (var i = 0; i < regions.length; i++)
    regionNameMap[regions[i].name] = regions[i].realName;

function APIQuery(URL, success, retryer) {

    superagent.get(URL).then(res => {
        success(res.body);
    }).catch(error => { if (retryer != null) retryer(error); });// { console.log(error); alert("War API cannot be contacted right now: ".concat(error)); });
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

        var w = 256 / 7;
        var k = w * Math.sqrt(3) / 2;

        if (f == "KingsCageHex") return { x: -1.5 * w, y: 0 };
        if (f == "WestgateHex") return { x: -2.25 * w, y: -.5 * k };
        if (f == "FarranacCoastHex") return { x: -2.25 * w, y: .5 * k };
        if (f == "EndlessShoreHex") return { x: 2.25 * w, y: -.5 * k };
        if (f == "StlicanShelfHex") return { x: 2.25 * w, y: .5 * k };
        if (f == "OarbreakerHex") return { x: -3 * w, y: 1 * k };
        if (f == "FishermansRowHex") return { x: -3 * w, y: 0 };
        if (f == "StemaLandingHex") return { x: -3 * w, y: -1 * k };
        if (f == "GodcroftsHex") return { x: 3 * w, y: 1 * k };
        if (f == "SableportHex") return { x: -1.5 * w, y: -1 * k };
        if (f == "TempestIslandHex") return { x: 3 * w, y: 0 };
        if (f == "ReaversPassHex") return { x: 2.25 * w, y: -1.5 * k };
        if (f == "TheFingersHex") return { x: 3 * w, y: -1 * k };
        if (f == "ClahstraHex") return { x: 1.5 * w, y: 0 };
        if (f == "DeadLandsHex") return { x: 0, y: 0 };
        if (f == "CallahansPassageHex") return { x: 0, y: 1 * k };
        if (f == "MarbanHollow") return { x: .75 * w, y: .5 * k };
        if (f == "UmbralWildwoodHex") return { x: 0, y: -1 * k };
        if (f == "MooringCountyHex") return { x: -.75 * w, y: 1.5 * k };
        if (f == "HeartlandsHex") return { x: -.75 * w, y: -1.5 * k };
        if (f == "LochMorHex") return { x: -.75 * w, y: -.5 * k };
        if (f == "LinnMercyHex") return { x: -.75 * w, y: .5 * k };
        if (f == "ReachingTrailHex") return { x: 0, y: 2 * k };
        if (f == "StonecradleHex") return { x: -1.5 * w, y: 1 * k };
        if (f == "GreatMarchHex") return { x: 0, y: -2 * k };
        if (f == "AllodsBightHex") return { x: 1.5 * w, y: -1.0 * k };
        if (f == "WeatheredExpanseHex") return { x: 1.5 * w, y: 1.0 * k };
        if (f == "DrownedValeHex") return { x: .75 * w, y: -.5 * k };
        if (f == "ShackledChasmHex") return { x: .75 * w, y: -1.5 * k };
        if (f == "ViperPitHex") return { x: .75 * w, y: 1.5 * k };
        if (f == "NevishLineHex") return { x: -2.25 * w, y: 1.5 * k };
        if (f == "AcrithiaHex") return { x: .75 * w, y: -2.5 * k };
        if (f == "RedRiverHex") return { x: -.75 * w, y: -2.5 * k };
        if (f == "CallumsCapeHex") return { x: -1.5 * w, y: 2 * k };
        if (f == "SpeakingWoodsHex") return { x: -.75 * w, y: 2.5 * k };
        if (f == "BasinSionnachHex") return { x: 0, y: 3 * k };
        if (f == "HowlCountyHex") return { x: .75 * w, y: 2.5 * k };
        if (f == "ClansheadValleyHex") return { x: 1.5 * w, y: 2 * k };
        if (f == "MorgensCrossingHex") return { x: 2.25 * w, y: 1.5 * k };
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

    townHallIcons: [35, 5, 6, 7, 8, 9, 10, 45, 46, 47, 29, 17, 34, 51, 39, 12, 52, 33, 18, 19, 56, 57, 58, 59, 60],

    krigingControlPointIcons: [/* safe house 35, */5, 6, 7, 8, 9, 10, 45, 46, 47, 29, 56, 57, 58, 59, 60],

    update: function (completionCallback, shard, retryer) {

        if (shard == null)
            shard = 'war-service-live';

        APIQuery("https://".concat(shard).concat(".foxholeservices.com/api/worldconquest/war"),
            function (war) {
                exports.API.war = war;
                //alert(war);
                APIQuery("https://".concat(shard).concat(".foxholeservices.com/api/worldconquest/maps"),
                    function (maps) {
                        // iterate here on the maps and collect status
                        var complete = maps.length;
                        var p_x = [], p_y = [], p_t = [];

                        var xf = 256 / 7;
                        var yf = xf * Math.sqrt(3) / 2;

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
                                                exports.API.mapControl[mapName][key] = { x: x, y: y, control: control, mapIcon: icon, nuked: (mapData.mapItems[j].flags & 0x10) != 0, town: exports.API.krigingControlPointIcons.includes(icon) };
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
                    },
                    retryer);
            },
            retryer);
    }
};

