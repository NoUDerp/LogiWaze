
function openSidebar() {
    var sidebar = document.getElementById("collapsible-panel");
    sidebar.style.display = sidebar.style.display != "none" ? "none" : "block";
    mymap.invalidateSize();
}

//window.indexedDB.open("logiwaze").onsuccess = function (e) {
//    //var db = e.target.result;
//    if (!e.target.result.objectStoreNames.contains("version")) {
//        e.target.result.createObjectStore("version", { keyPath: "id" });
//        e.target.result.createIndex("build", "build", { unique: true });
//    }
//    const query = e.target.result.transaction(['version'], 'readwrite');
//    const store = query.objectStore('version');
//    const cursor = store.openCursor();
//    cursor.onsuccess = (f) => {
//        const c = f.target.result;
//        if (c) {
//            var old_build = c.value;
//            if (old_build != build) {
//                alert('An update is available');
//                window.serviceWorker.update();
//            }
//        }
//        else
//            alert('need to store build here');
//    };
//};



//db.createObjectStore("version", { version: })
//objectStore.createIndex("name", "name", { unique: false });

var startingWaypoints = [];


// load initial waypoints
var points = startingWaypoints;
var layers = 16384 * 2 - 1;

var shard = 0;
var tryshards = {};

var keys = Object.keys(Shards);
for (let i = 1; i < keys.length + 1; i++)
    tryshards[Shards[keys[i]]] = i;

var shard_url;

var j = [];
var h;

if (typeof (location.hash) != 'undefined' && location.hash != "" && location.hash != "#") {
    h = decodeURI(location.hash.substr(1));
    j = h.split(':');
}

if (j.length > 3)
    shard = parseInt(j[3]);

shard_url = Shards[Object.keys(Shards)[shard]];


var urlParams = new URLSearchParams(window.location.search);
var myParam = urlParams.get('beta');
window.beta = false;//myParam != null;


var mymap = L.map('mapid',
    {
        zoomSnap: .25,
        zoomDelta: .5,
        crs: L.CRS.Simple,
        noWrap: true,
        continuousWorld: true,
        bounds: L.latLngBounds(L.latLng(-256, 0), L.latLng(0, 256)),
        autoPan: false,
        maxBounds: L.latLngBounds(L.latLng(-384, -256), L.latLng(128, 512)),

    });
L.imageOverlay("Background.webp", [[-170 - 128, -230 + 128], [170 - 128, 230 + 128]], { pane: 'imagebg', opacity: 0.4 }).addTo(mymap);


var pane = mymap.createPane('imagebg');
mymap.getPane('imagebg').style.zIndex = 50;

/*L.control.youtube = function (options) {
    return new L.Control.YouTube(options);
};
L.control.youtube().addTo(mymap);*/

//function SetYouTubePlaylist() {
//    var list = document.getElementById("youtube-selector").value;
//    document.getElementById("youtube-player").src = "https://www.youtube.com/embed/videoseries?list=".concat(list);
//}

//function showJukebox() {
//    document.getElementsByClassName('youtube-player-contents')[0].style.display = "block";
//    document.getElementsByClassName('leaflet-control-youtube-toggle')[0].style.display = "none";
//}
//function hideJukebox() {
//    document.getElementsByClassName('youtube-player-contents')[0].style.display = "none";
//    document.getElementsByClassName('leaflet-control-youtube-toggle')[0].style.display = "block";
//}



var APIManager = API.Create();

var CurrentRoute = null;
var AutoZoom = false;
var IsUserZoom = true;
var IsUserZoomState;

var update_state = null;

mymap.on('moveend', function (e) { AutoZoom = false; if (update_state != null) update_state(); });

mymap.on('zoomend', function (e) {
    if (IsUserZoomState)
        AutoZoom = false;
    IsUserZoom = true;
    IsUserZoomState = true;
    if (update_state != null)
        update_state();
});

function PauseAutoZoom() {
    IsUserZoom = false;
    IsUserZoomState = IsUserZoom;
}

function ResumeAutoZoom() {
    IsUserZoom = true;
}

function portraitPanel(element) {
    return (window.innerWidth / window.innerHeight <= 3 / 4) || window.innerWidth < 700;
}

function getPanelWidth(element) {
    if (element == null)
        element = document.getElementsByClassName("leaflet-routing-container")[0];

    if (portraitPanel(element))
        return 0;

    return element.offsetWidth;
}

function getPanelHeight(element) {
    if (element == null)
        element = document.getElementsByClassName("leaflet-routing-container")[0];

    if (!portraitPanel(element))
        return 0;

    return element.offsetHeight;//.clientHeight;//.offsetHeight;
}

function getPanelVisibleWidth(element) {
    if (element == null)
        element = document.getElementsByClassName("leaflet-routing-container")[0];

    if (portraitPanel(element))
        return 0;

    if (element.classList.contains("leaflet-routing-container-hide"))
        return 0;

    return element.offsetWidth;
}

function getPanelVisibleHeight(element) {
    if (element == null)
        element = document.getElementsByClassName("leaflet-routing-container")[0];

    if (!portraitPanel(element))
        return 0;

    if (element.classList.contains("leaflet-routing-container-hide"))
        return 0;

    return element.offsetWidth;//.clientHeight;//.offsetHeight;
}

update_error_loop: {
    APIManager.update(function () {

        var VoiceNarrator = Narrator.Create();


        var Router = FoxholeRouter.Create(mymap, APIManager, VoiceNarrator);

        var Geocoder = FoxholeGeocoder.Create(APIManager);

        Router.VectorControlGrid.build = "?".concat(build);

        var Options = {
            '<img src="MapIcons/MapIconStaticBase3.webp" class="layer-icon">Town Halls': Router.TownHalls,
            '<img src="MapIcons/fencing.webp" class="layer-icon">Borders': Router.Borders,
            /*'<img src="MapIcons/road-route.webp" class="layer-icon">Road Quality': Router.RoadsCanvas,*/
            '<img src="MapIcons/road-route.webp" class="layer-icon">Road Control': Router.ColonialRoads,
            /*'<img src="Warden Route.webp" class="layer-icon">Warden Roads': Router.WardenRoads,
            '<img src="Shortest Route.webp" class="layer-icon">Uncontrolled Roads': Router.NeutralRoads,*/
            '<img src="MapIcons/MapIconManufacturing.webp" class="layer-icon">Refineries': Router.Refineries,
            '<img src="MapIcons/MapIconFactory.webp" class="layer-icon">Factories': Router.Factories,
            '<img src="MapIcons/MapIconStorageFacility.webp" class="layer-icon">Storage': Router.Storage,
            '<img src="MapIcons/MapIconSalvage.webp" class="layer-icon">Salvage': Router.Salvage,
            '<img src="MapIcons/MapIconComponents.webp" class="layer-icon">Components': Router.Components,
            '<img src="MapIcons/MapIconFuel.webp" class="layer-icon">Fuel': Router.Fuel,
            '<img src="MapIcons/MapIconSulfur.webp" class="layer-icon">Sulfur': Router.Sulfur,
            '<img src="MapIcons/Control.webp" class="layer-icon">Control': Router.MapControl,
            '<img src="MapIcons/Labels.webp" class="layer-icon">Labels': Router.Labels,
            '<img src="font.svg" class="layer-icon">Basic Font': Router.BoringFont
        };

        var shard_layers = {};
        let keys = Object.keys(Shards);
        for (var i = 0; i < keys.length; i++)
            shard_layers[keys[i]] = L.layerGroup();

        shard_layers[Object.keys(shard_layers)[shard]].addTo(mymap);

        L.control.layers(
            shard_layers,
            Options,
            {
                position: 'topleft',
                autoZIndex: false
                //, opacity: .75
            }
        ).addTo(mymap);


        // seam fix
        /*let originalInitTile = L.GridLayer.prototype._initTile;
        if (!originalInitTile.isPatched) {
            L.GridLayer.include({
                _initTile: function (tile) {
                    originalInitTile.call(this, tile);
                    var tileSize = this.getTileSize();
                    tile.style.width = tileSize.x + 1 + 'px';
                    tile.style.height = tileSize.y + 1 + 'px';
                }
            });
        }*/

        /*L.Control.YouTube = L.Control.extend({
            options: {
                position: 'topleft',
            },

            onAdd: function (map) {
                var controlDiv = L.DomUtil.create('div', 'leaflet-control-youtube');
                L.DomEvent
                    .addListener(controlDiv, 'click', L.DomEvent.stopPropagation)
                    .addListener(controlDiv, 'click', L.DomEvent.preventDefault)
                    .addListener(controlDiv, 'click', function () {
                    });

                var controlUI = L.DomUtil.create('div', 'leaflet-control-youtube-interior leaflet-bar', controlDiv);
                controlUI.setAttribute("onmouseleave", "hideJukebox()");
                controlUI.title = 'Music';

                var playlists = {
                    "Xanxth's \"Colonial National Guard\"": "PLP_k06DgiSSLDyzQZWAoHHW8bAXGO21AG",
                    "Derp's \"Out Of Logi Babylon\"": "PLkQvYA5-_pJ1sRms9hkr1q3DHUQvaK7iF",
                    "DragonZephyr's \"Caovia's Rolling Hills\"": "PLv1A0_5bkdtBP9rIciaA1tH1LxVcC3Y5_",
                    "Skaj's \"Electro-Dungeon\"": "PLoxO-JyRQapNGIQg6c1ZeVbggI_DiJ0I2",
                    "Foxhole A.M.": "PLkQvYA5-_pJ3Jq4YR2KmzhPEgTwuD8PkL"
                };

                var options = "";
                var keys = Object.keys(playlists);
                var selected = parseInt((Math.random() * 1000).toFixed().toString()) % keys.length;
                for (var i = 0; i < keys.length; i++) {
                    var option = document.createElement("option");
                    option.setAttribute("value", playlists[keys[i]]);
                    option.innerText = keys[i];
                    if (i === selected)
                        option.setAttribute("selected", "selected");
                    options = options.concat(option.outerHTML);
                }
                var toggle = "<a class='leaflet-control-youtube-toggle' href='#' title='Jukebox' onmouseover='showJukebox()' onclick='showJukebox()''></a>";
                var selector = toggle.concat("<div class='youtube-player-contents' style='padding: 2px'><select id=\"youtube-selector\" onchange=\"SetYouTubePlaylist()\">").concat(options).concat("</select>");

                var frame = document.createElement("iframe");
                frame.setAttribute("id", "youtube-player");
                frame.style.width = "450px";
                frame.style.height = "300px";
                frame.setAttribute("src", "https://www.youtube.com/embed/videoseries?list=".concat(playlists[keys[selected]]));
                frame.setAttribute("frameborder", "0");
                frame.setAttribute("allow", "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture");
                frame.setAttribute("allowfullscreen", "true");
                controlUI.innerHTML = selector.concat(frame.outerHTML).concat("</div>");
                return controlDiv;
            }
        });

        L.control.youtube = function (options) {
            return new L.Control.YouTube(options);
        };

        L.control.youtube().addTo(mymap);*/

        //class custom_formatter extends L.Routing.ItineraryBuilder {
        //    constructor(API) {
        //        super();
        //        this.index = 0;
        //        this.counter = 1;
        //        this.first = true;
        //        this.API = API;
        //    }

        //    createStep(text, distance, steps) {

        //        var region;
        //        var border = 0;
        //        var newRegion = false;
        //        var turnicon = "";
        //        if (text.indexOf("|") >= 0) {
        //            var u = text.split("\|");
        //            region = u[0];
        //            text = u[1];
        //            border = parseInt(u[2]);
        //            newRegion = parseInt(u[3]) === 1;
        //            turnicon = u[4];
        //        }
        //        else
        //            region = "";


        //        if (newRegion || this.first) {
        //            var container2 = document.createElement("TR");
        //            container2.style.padding = ".1em 2px";
        //            var divider2 = document.createElement("TD");
        //            divider2.setAttribute("colspan", "2");
        //            divider2.innerText = this.API.mapRegionName(region);
        //            divider2.style["font-size"] = "normal";
        //            divider2.style.width = "100%";
        //            divider2.style["pointer-events"] = "none";
        //            container2.appendChild(divider2);
        //            this.block.appendChild(container2);
        //            this.first = false;
        //        }

        //        if (border === 1) {
        //            var container3 = document.createElement("TR");
        //            container3.style.padding = ".1em 2px";
        //            var divider3 = document.createElement("TD");
        //            divider3.setAttribute("colspan", "2");
        //            divider3.innerText = "You are approaching a border crossing, check your radio";
        //            divider3.style = "font-size: x-small; width: 100%";
        //            divider3.style["padding-left"] = "2em";
        //            container3.appendChild(divider3);
        //            this.block.appendChild(container3);
        //        }


        //        var container = document.createElement("TR");
        //        container.classList.add("narrator-step-".concat((this.counter++).toString()));
        //        container.classList.add("narrator-steps");
        //        container.style.padding = ".1em 2px";
        //        var divider2 = document.createElement("TD");

        //        if (turnicon != "" && turnicon != null && window.beta)
        //            divider2.innerHTML = "<div class=\"".concat(turnicon.replace(' ', '-').toLowerCase()).concat('"></div>');

        //        var divider1 = document.createElement("TD");

        //        if (border === 1)
        //            divider1.innerText = text.concat(" and cross the border");
        //        else
        //            divider1.innerText = text;
        //        divider1.style = "font-size: x-small; width: 100%";
        //        divider1.style["padding-left"] = "2em";
        //        container.appendChild(divider2);
        //        container.appendChild(divider1);
        //        container.index = this.index++;
        //        this.block.appendChild(container);

        //        return container;
        //    }

        //    createContainer(className) {

        //        var table = document.createElement("TABLE");
        //        table.setAttribute("style", "width: 100%");
        //        if (className != null)
        //            table.setAttribute("class", className.concat(" ").concat("detailed-routeinfo"));
        //        else
        //            table.setAttribute("class", "detailed-routeinfo");
        //        this.container = table;
        //        return table;
        //    }

        //    createStepsContainer(container) {

        //        this.block = L.Routing.ItineraryBuilder.prototype.createStepsContainer(container);
        //        this.container.appendChild(this.block);
        //        return this.block;
        //    }
        //}


        //var form = Panel.Create(APIManager);
        window.playing = false;
        window.narrateDirections = function () {
            if (!window.playing) {
                window.playing = true;
                x = document.getElementsByClassName("play-button");
                if (x != null)
                    for (var i = 0; i < x.length; i++);
                //x[i].innerText = "❙❙";
                Router.narrate();
            }
            else {
                window.playing = false;
                x = document.getElementsByClassName("play-button");
                if (x != null)
                    for (var i = 0; i < x.length; i++);
                //x[i].innerText = "▶";
                Router.pauseNarrate();
            }
        };

        Router.Control = Panel.Create(APIManager, Router, Geocoder).addTo(mymap);

        // add another button
        for (let x of document.getElementsByClassName("leaflet-routing-reverse-waypoints")) {

            x.title = "Reverse Waypoints";
            var b = document.createElement("button");
            b.className = "copy-paste-url-button";
            b.alt = "Copy URL";
            b.title = "Copy URL";
            b.appendChild(document.createElement("div"));
            x.after(b);
            b.onclick = function () {
                navigator.clipboard.writeText(location.href).then(function () { });
                b.classList.remove("dirty");
            };

            var r = document.createElement("button");
            r.className = "refresh-button";
            r.appendChild(document.createElement("div"));
            r.alt = "Refresh";
            r.title = "Refresh";
            b.after(r);

            r.onclick = function () {
                location.reload();
            };

            let ss = document.createElement("button");
            ss.className = "screenshot-button";
            let download_icon = document.createElement("img");
            download_icon.src = "download-file.svg";
            download_icon.style.width = "20px";
            download_icon.style.height = "20px";
            ss.appendChild(download_icon);
            ss.alt = "Screenshot";
            ss.title = "Save Screenshot";
            b.after(ss);


            let tt = document.createElement("button");
            tt.className = "copy-button";
            download_icon = document.createElement("img");
            download_icon.src = "copy.svg";
            download_icon.style.width = "20px";
            download_icon.style.height = "20px";
            tt.appendChild(download_icon);
            tt.alt = "Copy Image";
            tt.title = "Copy Image";
            b.after(tt);

            ss.onclick = () => Router.screenshot();
            tt.onclick = () => Router.copy();


            if (window.location.hostname.toUpperCase() == "WWW.LOGIWAZE.COM") {
                let ttt = document.createElement("button");
                ttt.className = "report-button";
                download_icon = document.createElement("img");
                download_icon.src = "bug.svg";
                download_icon.style.width = "20px";
                download_icon.style.height = "20px";
                ttt.appendChild(download_icon);
                ttt.alt = "Report Error";
                ttt.title = "Report Error";
                tt.after(ttt);
            }
        }

        for (let y of document.getElementsByClassName("leaflet-routing-add-waypoint")) {
            y.title = "Add Waypoint";
        }

        PauseAutoZoom();
        mymap.fitBounds([[-256, 0], [0, 256]], { paddingBottomRight: [getPanelVisibleWidth(), getPanelVisibleHeight()] });
        ResumeAutoZoom();

        /*L.Routing.control(
            {
                showAlternatives: false,
                routeWhileDragging: false,
                router: Router,
                autoRoute: true,
                geocoder: Geocoder,
                plan: new L.Routing.Plan([], {
                    maxGeocoderTolerance: 100000000,
                    geocoder: Geocoder,
                    reverseWaypoints: true
                }),
                routeLine: function (route, options) {
                    if (route.name == "Shortest Route")
                        return L.Routing.line(route, {
                            addWaypoints: options.addWaypoints, styles: [
                                { color: 'black', opacity: 0.15, weight: 7 }, { color: 'white', opacity: 0.8, weight: 6 }, { color: '#9E3031', opacity: 1, weight: 2, dashArray: '10,10' }
                            ]
                        });
                    return L.Routing.line(route, {
                        addWaypoints: options.addWaypoints, styles: [
                            { color: 'black', opacity: 0.15, weight: 7 }, { color: 'white', opacity: 0.8, weight: 6 }, { color: '#5E9339', opacity: 1, weight: 2, dashArray: '10,10' }
                        ]
                    });
                },
                fitSelectedRoutes: false,
                itineraryBuilder: form,
                summaryTemplate: Router.summaryTemplate,
                collapsible: true,
                formatter: new custom_time_formatter(Router)
            }
        ).addTo(mymap);*/

        function createButton(label, container, image) {
            var btn = L.DomUtil.create('img', '', container);
            btn.setAttribute('src', image);
            btn.setAttribute('style', 'width: 28px; height: 28px; margin: 4px;');
            btn.innerHTML = label;
            return btn;
        }

        var mm = { prevent_double_click: false };

        mymap.on('click', function (e) {
            mm.timer = setTimeout(function () {
                if (!mm.prevent_double_click) {

                    let u = document.getElementsByClassName('leaflet-control-layers')[0];
                    if (u.classList.contains('leaflet-control-layers-expanded'))
                        u.classList.remove('leaflet-control-layers-expanded');
                    else {
                        var container = L.DomUtil.create('div'),
                            startBtn = createButton('Start here', container, 'ray-start-arrow.svg'),
                            destBtn = createButton('End here', container, 'ray-end.svg'),
                            cgarageBtn = createButton('Find garage', container, 'MapIcons/MapIconVehicleColonial.webp'),
                            wgarageBtn = createButton('Find garage', container, 'MapIcons/MapIconVehicleWarden.webp'),
                            refineryBtn = createButton('Find refinery', container, 'MapIcons/MapIconManufacturing.webp');
                            factoryBtn = createButton('Find factory', container, 'MapIcons/MapIconFactory.webp');

                        L.DomEvent.on(startBtn, 'click', function () {
                            Router.Control.spliceWaypoints(0, 1, e.latlng);
                            mymap.closePopup();
                        });

                        L.DomEvent.on(destBtn, 'click', function () {
                            Router.Control.spliceWaypoints(Router.Control.getWaypoints().length - 1, 1, e.latlng);
                            mymap.closePopup();
                        });

                        L.DomEvent.on(cgarageBtn, 'click', function () {
                            var bestGarage = Router.findStructure(e.latlng, "COLONIALS");
                            if (bestGarage != null) {
                                Router.Control.spliceWaypoints(0, 1, e.latlng);
                                Router.Control.spliceWaypoints(1, Router.Control.getWaypoints().length - 1, bestGarage);
                            }
                            mymap.closePopup();
                        });

                        L.DomEvent.on(wgarageBtn, 'click', function () {
                            var bestGarage = Router.findStructure(e.latlng, "WARDENS");
                            if (bestGarage != null) {
                                Router.Control.spliceWaypoints(0, 1, e.latlng);
                                Router.Control.spliceWaypoints(1, Router.Control.getWaypoints().length - 1, bestGarage);
                            }
                            mymap.closePopup();
                        });

                        L.DomEvent.on(refineryBtn, 'click', function () {
                            var bestRefinery = Router.findStructure(e.latlng, null, Router.RefineriesList);
                            if (bestRefinery != null) {
                                Router.Control.spliceWaypoints(0, 1, e.latlng);
                                Router.Control.spliceWaypoints(1, Router.Control.getWaypoints().length - 1, bestRefinery);
                            }
                            mymap.closePopup();
                        });

                        L.DomEvent.on(factoryBtn, 'click', function () {
                            var bestFactory = Router.findStructure(e.latlng, null, Router.FactoriesList);
                            if (bestFactory != null) {
                                Router.Control.spliceWaypoints(0, 1, e.latlng);
                                Router.Control.spliceWaypoints(1, Router.Control.getWaypoints().length - 1, bestFactory);
                            }
                            mymap.closePopup();
                        });

                        container.setAttribute('style', 'width: 72px; padding: 0; text-align: center; margin: auto');

                        if (APIManager.calculateRegion(e.latlng.lng, e.latlng.lat) != null) {
                            L.popup()
                                .setContent(container)
                                .setLatLng(e.latlng)
                                .openOn(mymap);
                        }
                    }
                }
                mm.prevent_double_click = false;
            }, 400);
        });

        mymap.on("dblclick", function () {
            clearTimeout(mm.timer);
            mm.prevent_double_click = true;
        });


        var waypoints = [];
        var active_layers = {};
        var no_update = false;

        function SmartAutoZoom() {
            minX = null; minY = null; maxX = null; maxY = null;
            var count = 0;
            for (var i = 0; i < waypoints.length; i++) {
                var u = waypoints[i].latLng;
                if (u != null) {
                    count++;
                    if (minX == null || u.lng < minX)
                        minX = u.lng;
                    if (minY == null || u.lat < minY)
                        minY = u.lat;
                    if (maxX == null || u.lng > maxX)
                        maxX = u.lng;
                    if (maxY == null || u.lat > maxY)
                        maxY = u.lat;
                }
            }

            if (CurrentRoute != null)
                for (var i = 0; i < CurrentRoute.coordinates.length; i++) {
                    var u = CurrentRoute.coordinates[i];
                    if (u != null) {
                        count++;
                        if (minX == null || u.lng < minX)
                            minX = u.lng;
                        if (minY == null || u.lat < minY)
                            minY = u.lat;
                        if (maxX == null || u.lng > maxX)
                            maxX = u.lng;
                        if (maxY == null || u.lat > maxY)
                            maxY = u.lat;
                    }
                }

            if (count > 1) {
                var rangeX = maxX - minX;
                var rangeY = maxY - minY;
                var buffer = .05;
                PauseAutoZoom();
                mymap.fitBounds([[minY - rangeY * buffer, minX - rangeX * buffer], [minY + (1.0 + buffer * 2.0) * rangeY, minX + (1.0 + buffer * 2.0) * rangeX]], { paddingBottomRight: [getPanelVisibleWidth(), getPanelVisibleHeight()] });
                ResumeAutoZoom();
                AutoZoom = true;
            }
        }



        window.onresize = function () {
            if (AutoZoom)
                SmartAutoZoom();
        };

        var collapse_button = document.getElementsByClassName("leaflet-routing-collapse-btn")[0];

        //document.getElementsByClassName("leaflet-routing-container")[0].classList.add("leaflet-routing-container-hide");

        collapse_button.addEventListener("click", function () {
            if (AutoZoom)
                setTimeout(function () {
                    SmartAutoZoom();
                }, 100);
            else {
                var element = document.getElementsByClassName("leaflet-routing-container")[0];
                var has_hide = element.classList.contains("leaflet-routing-container-hide");
                if (has_hide) { //open panel
                    PauseAutoZoom();
                    mymap.panBy([-getPanelWidth() * .5, -getPanelHeight() * .5], { duration: .5, animate: true, noMoveStart: true });
                    ResumeAutoZoom();
                }
                else { //close panel
                    PauseAutoZoom();
                    mymap.panBy([getPanelWidth() * .5, getPanelHeight() * .5], { duration: .5, animate: true, noMoveStart: true });
                    ResumeAutoZoom();
                }
            }
        });

        update_state = function () {
            var l = "";
            for (var i = 0; i < waypoints.length; i++)
                if (waypoints[i] != null && waypoints[i].latLng != null && waypoints[i].latLng.lng != null && waypoints[i].latLng.lat != null) {
                    if (i > 0)
                        l = l.concat("|");
                    var s = Geocoder.reverseExact(waypoints[i].latLng);
                    if (s == null)
                        l = l.concat(waypoints[i].latLng.lat.toFixed(3)).concat(",").concat(waypoints[i].latLng.lng.toFixed(3));
                    else
                        l = l.concat(s);
                }

            var counter = 0;
            keys = Object.keys(active_layers);
            for (var i = 0; i < keys.length; i++)
                if (active_layers[keys[i]] === true)
                    switch (keys[i].replace(/<.*> */, '')) {
                        case "Town Halls":
                            counter |= 1;
                            break;
                        case "Borders":
                            counter |= 2;
                            break;
                        //case "Warden Roads":
                        //    counter |= 4;
                        //    break;
                        case "Road Control":
                            counter |= 8;
                            break;
                        //case "Road Quality":
                        //    counter |= 16;
                        //    break;
                        //case "Uncontrolled Roads":
                        //    counter |= 32;
                        //    break;
                        case "Refineries":
                            counter |= 64;
                            break;
                        case "Factories":
                            counter |= 128;
                            break;
                        case "Storage":
                            counter |= 256;
                            break;
                        case "Salvage":
                            counter |= 512;
                            break;
                        case "Components":
                            counter |= 1024;
                            break;
                        case "Fuel":
                            counter |= 2048;
                            break;
                        case "Sulfur":
                            counter |= 4096;
                            break;
                        case "Control":
                            counter |= 8192;
                            break;
                        case "Labels":
                            counter |= 16384;
                            break;
                        case "Basic Font":
                            counter |= 32768;
                            break;
                    }

            l = l.concat(':').concat(counter.toString(16).toUpperCase());

            var bounds = mymap.getBounds();
            var zoom = mymap.getZoom();
            var W = bounds.getWest(), E = bounds.getEast(), N = bounds.getNorth(), S = bounds.getSouth();
            var s = { lng: 0, lat: 0 };// mymap.unproject([getPanelWidth(), getPanelHeight()], zoom);
            var xoffset = isNaN(s.lng) ? 0 : s.lng;
            var yoffset = isNaN(s.lat) ? 0 : s.lat;

            var center = [(E + W) * .5 - .5 * xoffset, (N + S) * .5 - .5 * yoffset];


            l = l.concat(':').concat(Math.round(center[0] * 1000) / 1000).concat(',').concat(Math.round(center[1] * 1000) / 1000).concat(',').concat(zoom);

            // add shard
            l = l.concat(':').concat(shard.toFixed().toString());

            if (location.hash != l) {
                for (let b of document.getElementsByClassName("copy-paste-url-button"))
                    b.classList.add("dirty");
                location.hash = l;
            }

            // update the report button (if the url is logiwaze.com) to link properly
            if (window.location.host.toUpperCase() == "WWW.LOGIWAZE.COM") {
                var report_buttons = document.getElementsByClassName("report-button");
                if (report_buttons != null)
                    for (var i = 0; i < report_buttons.length; i++) {
                        report_buttons[i].onclick = function () {
                            // open url in new tab
                            var URL = "https://docs.google.com/forms/d/e/1FAIpQLSe2TdapwEIY6IlAHpzb9ZX7rPmx9N3BkyqFKoIsko-WCMehlg/viewform?usp=pp_url&entry.1290713637=".concat(encodeURIComponent(window.location));
                            window.open(URL, '_blank');
                        };
                    }
            }

        }

        mymap.on('baselayerchange', function (e) {
            // change shard here
            let keys = Object.keys(Shards);
            for (shard = 0; shard < keys.length; shard++)
                if (keys[shard] == e.name)
                    break;

            if (update_state != null)
                update_state();

            location.reload();
        });

        mymap.on('overlayadd', function (event) {
            if (no_update) return;
            switch (event.name.replace(/<.*> */, '')) {
                case "Control":
                    Router.showControl();
                    break;
                case "Town Halls":
                    Router.showTownHalls();
                    break;
                case "Refineries":
                    Router.showRefineries();
                    break;
                case "Factories":
                    Router.showFactories();
                    break;
                case "Fuel":
                    Router.showFuel();
                    break;
                case "Components":
                    Router.showComponents();
                    break;
                case "Storage":
                    Router.showStorage();
                    break;
                case "Sulfur":
                    Router.showSulfur();
                    break;
                case "Salvage":
                    Router.showSalvage();
                    break;
                //case "Warden Roads":
                //    Router.showWarden();
                //    break;
                case "Road Control":
                    Router.showColonial();
                    break;
                //case "Uncontrolled Roads":
                //    Router.showNeutral();
                //    break;
                //case "Road Quality":
                //    Router.showQuality();
                //    break;
                case "Borders":
                    Router.showBorders();
                    break;
                case "Labels":
                    Router.showLabels();
                    break;
                case "Basic Font":
                    Router.showBoringFont();
                    break;
            }
            active_layers[event.name.replace(/<.*> */, '')] = true;
            update_state();
        });

        mymap.on('overlayremove', function (event) {
            if (no_update) return;
            switch (event.name.replace(/<.*> */, '')) {
                case "Control":
                    Router.hideControl();
                    break;
                case "Town Halls":
                    Router.hideTownHalls();
                    break;
                case "Refineries":
                    Router.hideRefineries();
                    break;
                case "Factories":
                    Router.hideFactories();
                    break;
                case "Fuel":
                    Router.hideFuel();
                    break;
                case "Components":
                    Router.hideComponents();
                    break;
                case "Storage":
                    Router.hideStorage();
                    break;
                case "Sulfur":
                    Router.hideSulfur();
                    break;
                case "Salvage":
                    Router.hideSalvage();
                    break;
                //case "Warden Roads":
                //    Router.hideWarden();
                //    break;
                case "Road Control":
                    Router.hideColonial();
                    break;
                //case "Uncontrolled Roads":
                //    Router.hideNeutral();
                //    break;
                //case "Road Quality":
                //    Router.hideQuality();
                //    break;
                case "Borders":
                    Router.hideBorders();
                    break;
                case "Labels":
                    Router.hideLabels();
                    break;
                case "Basic Font":
                    Router.hideBoringFont();
                    break;
            }
            active_layers[event.name.replace(/<.*> */, '')] = false;
            update_state();
        });



        // filter layers
        if (j.length > 1)
            layers = parseInt(j[1], 16);

        if (j.length > 2) {
            // set camera
            var coords = j[2].split(/,/);
            var z = parseFloat(coords[2]);
            PauseAutoZoom();

            var zoom = mymap.getZoom();
            var s = mymap.unproject([getPanelVisibleWidth(), getPanelVisibleHeight()], zoom);
            var xoffset = isNaN(s.lng) ? 0 : s.lng;
            var yoffset = isNaN(s.lat) ? 0 : s.lat;

            mymap.setView([parseFloat(coords[1]) + .5 * yoffset, parseFloat(coords[0]) + .5 * xoffset], z);
            ResumeAutoZoom();
        }


        Router.Control.on('routeselected', function (event) {
            Router.setRoute(event.route);
            CurrentRoute = event.route;
            AutoZoom = true;
            SmartAutoZoom();
        });

        if (j.length > 0) {
            h = j[0];

            var l = h.split("|");
            points = [];
            for (var i = 0; i < l.length; i++) {
                // if this is a town name locate it

                var a = l[i].split(",");
                if (a.length < 2) {
                    if (a[0] != '') {
                        var u = Geocoder.lookup(a[0]);
                        points.push([u.y, u.x]);
                    }
                    else {
                        points.push([]);
                    }
                }
                else
                    points.push([parseFloat(a[0]), parseFloat(a[1])]);
            }
        }

        //active_layers["Road Quality"] = (layers & 16) != 0;
        active_layers["Borders"] = (layers & 2) != 0;
        //active_layers["Warden Roads"] = (layers & 4) != 0;
        active_layers["Road Control"] = (layers & 8) != 0;
        //active_layers["Uncontrolled Roads"] = (layers & 32) != 0;
        active_layers["Refineries"] = (layers & 64) != 0;
        active_layers["Factories"] = (layers & 128) != 0;
        active_layers["Storage"] = (layers & 256) != 0;
        active_layers["Salvage"] = (layers & 512) != 0;
        active_layers["Components"] = (layers & 1024) != 0;
        active_layers["Fuel"] = (layers & 2048) != 0;
        active_layers["Sulfur"] = (layers & 4096) != 0;
        active_layers["Town Halls"] = (layers & 1) != 0;
        active_layers["Control"] = (layers & 8192) != 0;
        active_layers["Labels"] = (layers & 16384) != 0;
        active_layers["Basic Font"] = (layers & 32768) != 0;



        keys = Object.keys(active_layers);
        for (var i = 0; i < keys.length; i++)
            if (false == active_layers[keys[i]])
                switch (keys[i].replace(/<.*> */, '')) {
                    case "Control":
                        Router.hideControl();
                        Router.MapControl.remove();
                        break;
                    case "Town Halls":
                        Router.hideTownHalls();
                        Router.TownHalls.remove();
                        break;
                    case "Borders":
                        Router.Borders.remove();
                        Router.hideBorders();
                        break;
                    //case "Warden Roads":
                    //    Router.WardenRoads.remove();
                    //    Router.hideWarden();
                    //    break;
                    case "Road Control":
                        Router.ColonialRoads.remove();
                        Router.hideColonial();
                        break;
                    //case "Uncontrolled Roads":
                    //    Router.NeutralRoads.remove();
                    //    Router.hideNeutral();
                    //    break;
                    case "Refineries":
                        Router.hideRefineries();
                        Router.Refineries.remove();
                        break;
                    case "Factories":
                        Router.hideFactories();
                        Router.Factories.remove();
                        break;
                    case "Storage":
                        Router.Storage.remove();
                        Router.hideStorage();
                        break;
                    case "Salvage":
                        Router.Salvage.remove();
                        Router.hideSalvage();
                        break;
                    case "Components":
                        Router.Components.remove();
                        Router.hideComponents();
                        break;
                    case "Fuel":
                        Router.Fuel.remove();
                        Router.hideFuel();
                        break;
                    case "Sulfur":
                        Router.Sulfur.remove();
                        Router.hideSulfur();
                        break;
                    //case "Warden Roads":
                    //    Router.WardenRoads.remove();
                    //    Router.hideWarden();
                    //    break;
                    case "Road Control":
                        Router.ColonialRoads.remove();
                        Router.hideColonial();
                        break;
                    //case "Uncontrolled Roads":
                    //    Router.NeutralRoads.remove();
                    //    Router.hideNeutral();
                    //    break;
                    //case "Road Quality":
                    //    Router.RoadsCanvas.remove();
                    //    Router.hideQuality();
                    //    break;
                    case "Labels":
                        Router.Labels.remove();
                        Router.hideLabels();
                        break;
                    case "Basic Font":
                        Router.BoringFont.remove();
                        Router.hideBoringFont();
                        break;
                }

        Router.Control.setWaypoints(points);
        waypoints = [];
        for (var i = 0; i < points.length; i++)
            waypoints.push({ latLng: { lat: points[i][0], lng: points[i][1] } });
        update_state();

        Router.Control.on('waypointschanged', function (event) {
            waypoints = event.waypoints;
            update_state();
            mymap.closePopup();
            AutoZoom = true;
            SmartAutoZoom();
        });

        document.getElementById("map-frame").style.opacity = '1';
        document.getElementById("loader-holder").style.opacity = '0';
        setTimeout(function () { document.getElementById("loader-holder").style.display = 'none'; }, 1000);


        //function makeResizeable(p) {
        //var p = document.getElementsByClassName('leaflet-router-container')[0];
        //    p.addEventListener('click', function init() {
        //        p.removeEventListener('click', init, false);
        //        p.className = p.className + ' resizable';
        //        var resizer = document.createElement('div');
        //        resizer.className = 'resizer';
        //        p.appendChild(resizer);
        //        resizer.addEventListener('mousedown', initDrag, false);
        //    }, false);

        //    var startX, startY, startWidth, startHeight;

        //    function initDrag(e) {
        //        startX = e.clientX;
        //        startY = e.clientY;
        //        startWidth = parseInt(document.defaultView.getComputedStyle(p).width, 10);
        //        startHeight = parseInt(document.defaultView.getComputedStyle(p).height, 10);
        //        document.documentElement.addEventListener('mousemove', doDrag, false);
        //        document.documentElement.addEventListener('mouseup', stopDrag, false);
        //    }

        //    function doDrag(e) {
        //        p.style.width = (startWidth + e.clientX - startX) + 'px';
        //        p.style.height = (startHeight + e.clientY - startY) + 'px';
        //    }

        //    function stopDrag(e) {
        //        document.documentElement.removeEventListener('mousemove', doDrag, false);
        //        document.documentElement.removeEventListener('mouseup', stopDrag, false);
        //    }
        //}

        //for (var e of document.getElementsByClassName('leaflet-routing-container'))
        //    makeResizeable(e);

    }, shard_url, function (error) { console.log(error); alert("War API cannot be contacted right now, it may be offline or there may be a network problem"); });
}
    //catch (error) {
    //    if (first_error == null)
    //        first_error = error;
    //    if (shard_url in tryshards)
    //        delete tryshards[shard_url];
    //    if (Object.keys(tryshards).length == 0) {
    //        alert("War API cannot be contacted right now: ".concat(first_error));
    //    }
    //    else {
    //        shard_url = Object.keys(tryshards)[0];
    //        shard = tryshards[Object.keys(tryshards)[0]];
    //        break update_error_loop;

    //    }
    //}

