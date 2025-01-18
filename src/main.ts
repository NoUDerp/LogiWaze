//@ts-nocheck

import {Create as FoxholeRouterCreate} from './IRouter';
import FoxholeGeocoder from "./IGeocoder";
import API from './API';
import L from 'leaflet';
import Shards from '../config/shards.json';
import MapIcons from './MapIcons';
import Panel from './Panel';
import BackgroundImage from 'data-url:../Background.webp';
import ServiceWorkerContent from 'data-url:../workers/ServiceWorker.js';


let decodedContent;
if (ServiceWorkerContent.includes('base64')) {
    // Handle base64 encoded content
    const base64Content = ServiceWorkerContent.split(',')[1];
    decodedContent = atob(base64Content);
} else {
    // Handle URL-encoded content
    const encodedContent = ServiceWorkerContent.split(',')[1];
    decodedContent = decodeURIComponent(encodedContent);
}
// const swBlob = new Blob([decodedContent], {type: 'application/javascript'});
// const swBlobUrl = URL.createObjectURL(swBlob);
// window.addEventListener('load', () => {
//     navigator.serviceWorker.register(swBlobUrl)
//         .then(registration => {
//             console.log('ServiceWorker registration successful with scope:', registration.scope);
//             // Clean up the Blob URL after registration
//             URL.revokeObjectURL(swBlobUrl);
//         })
//         .catch(error => {
//             console.error('ServiceWorker registration failed:', error);
//             URL.revokeObjectURL(swBlobUrl);
//         });
// });
navigator.serviceWorker.register(new URL('./ServiceWorker.ts', import.meta.url), {type: 'module'});

//document.fonts.add(new FontFace('Renner', `url(${MapIcons.data_url('Renner.ttf')})`, {weight: 400}));
const styleEl = document.createElement('style');
styleEl.innerHTML = ".leaflet-control-layers-toggle { background-image: url(" + MapIcons.data_url('layers.png') + "); width: 36px; height: 36px; }\n" +
    ".leaflet-retina .leaflet-control-layers-toggle { background-image: url(" + MapIcons.data_url('layers-2x.png') + "); background-size: 26px 26px; }\n" +
    ".leaflet-default-icon-path { background-image: url(" + MapIcons.data_url('marker-icon.png') + ") }\n" +
    "  .leaflet-default-icon-path { background-image: url(" + MapIcons.data_url('marker-icon.png') + "); }\n";
document.head.appendChild(styleEl);

const startingWaypoints = [];

// load initial waypoints
let points = startingWaypoints;
let layers = 0b111111111111101111;

let shard = 0;
const tryshards = {};

const keys = Object.keys(Shards);
for (let i = 1; i < keys.length + 1; i++)
    tryshards[Shards[keys[i]]] = i;

let shard_url;

let j = [];
let h;

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
        zoomSnap: 1,//.25,
        zoomDelta: 1,//.5,
        crs: L.CRS.Simple,
        noWrap: true,
        continuousWorld: true,
        bounds: L.latLngBounds(L.latLng(-256, 0), L.latLng(0, 256)),
        autoPan: false,
        maxBounds: L.latLngBounds(L.latLng(-384, -256), L.latLng(128, 512)),
//zoomAnimation: false,
//fadeAnimation: false
    });

const width = 900;
const height = width * 9 / 16;

const scale = [1.12, 1.12];
const offset = [-6, 0];

const range = [[height * .5 * scale[1] - 128, -width * .5 * scale[0] + 128], [-height * .5 * scale[1] - 128, width * .5 * scale[0] + 128]];

range[0][0] += offset[1];
range[0][1] += offset[0];
range[1][0] += offset[1];
range[1][1] += offset[0];

L.imageOverlay(BackgroundImage/*"Background.webp"*/, range, {pane: 'imagebg'}).addTo(mymap);


var pane = mymap.createPane('imagebg');
//mymap.getPane('imagebg')
pane.style.zIndex = 50;

var APIManager = new API();

var CurrentRoute = null;
var AutoZoom = false;
var IsUserZoom = true;
var IsUserZoomState;

var update_state = null;

mymap.on('moveend', function (e) {
    AutoZoom = false;
    if (update_state != null) update_state();
});

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

    return element.offsetHeight;
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

    return element.offsetWidth;
}

global.getPanelVisibleWidth = getPanelVisibleWidth;
global.getPanelVisibleHeight = getPanelVisibleHeight;


update_error_loop: {
    APIManager.update(async function () {

        let i;
        const Geocoder = new FoxholeGeocoder(APIManager);

        const Router = await FoxholeRouterCreate(mymap, APIManager);

        const Options = {};
        Options[`<img src="${MapIcons.data_url('MapIconStaticBase3.webp')}" class="layer-icon">Town Halls`] = Router.TownHalls;
        Options[`<img src="${MapIcons.data_url('fencing.webp')}" class="layer-icon">Borders`] = Router.Borders;
        Options[`<img src="${MapIcons.data_url('road-route.webp')}" class="layer-icon">Road Control`] = Router.Roads;
        Options[`<img src="${MapIcons.data_url('MapIconManufacturing.webp')}" class="layer-icon">Refineries`] = Router.Refineries;
        Options[`<img src="${MapIcons.data_url('MapIconFactory.webp')}" class="layer-icon">Factories`] = Router.Factories;
        Options[`<img src="${MapIcons.data_url('MapIconStorageFacility.webp')}" class="layer-icon">Storage`] = Router.Storage;
        Options[`<img src="${MapIcons.data_url('MapIconSalvage.webp')}" class="layer-icon">Salvage`] = Router.Salvage;
        Options[`<img src="${MapIcons.data_url('MapIconComponents.webp')}" class="layer-icon">Components`] = Router.Components;
        Options[`<img src="${MapIcons.data_url('MapIconFuel.webp')}" class="layer-icon">Fuel`] = Router.Fuel;
        Options[`<img src="${MapIcons.data_url('MapIconSulfur.webp')}" class="layer-icon">Sulfur`] = Router.Sulfur;
        Options[`<img src="${MapIcons.data_url('MapIconCoal.webp')}" class="layer-icon">Coal`] = Router.Coal;
        Options[`<img src="${MapIcons.data_url('Control.webp')}" class="layer-icon">Control`] = Router.MapControl;
        Options[`<img src="${MapIcons.data_url('Labels.webp')}" class="layer-icon">Labels`] = Router.Labels;
        Options['<img src="' + MapIcons.data_url('font.svg') + '" class="layer-icon">Basic Font'] = Router.BoringFont;

        const shard_layers = {};
        let keys = Object.keys(Shards);
        for (i = 0; i < keys.length; i++)
            shard_layers[keys[i]] = L.layerGroup();

        shard_layers[Object.keys(shard_layers)[shard]].addTo(mymap);

        L.control.layers(
            shard_layers,
            Options,
            {
                position: 'topleft',
                autoZIndex: false,
                zoomSnap: 1,
                zoomDelta: .5
            }
        ).addTo(mymap);

        L.Control.Credits = L.Control.extend({
            options: {
                collapsed: true,
                position: 'topleft',
                autoZIndex: true,
                hideSingleBase: false,
                sortLayers: false,
                sortFunction(layerA, layerB, nameA, nameB) {
                    return nameA < nameB ? -1 : (nameB < nameA ? 1 : 0);
                }
            },

            initialize(baseLayers, overlays, options) {
                L.Util.setOptions(this, options);
                this._handlingClick = false;
                this._preventClick = false;
            },

            onAdd(map) {
                this._initLayout();
                this._map = map;
                if (!this.options.collapsed)
                    map.on('resize', this._expandIfNotCollapsed, this);
                return this._container;
            },

            addTo(map) {
                L.Control.prototype.addTo.call(this, map);
                return this._expandIfNotCollapsed();
            },

            onRemove() {
                this._map.off('resize', this._expandIfNotCollapsed, this);
            },

            expand() {
                this._container.classList.add('leaflet-control-layers-expanded');
                this._section.style.height = null;
                const acceptableHeight = this._map.getSize().y - (this._container.offsetTop + 50);
                if (acceptableHeight < this._section.clientHeight) {
                    this._section.classList.add('leaflet-control-layers-scrollbar');
                    this._section.style.height = `${acceptableHeight}px`;
                } else {
                    this._section.classList.remove('leaflet-control-layers-scrollbar');
                }
                return this;
            },

            collapse(ev) {
                if (!ev || !(ev.type === 'pointerleave' && ev.pointerType === 'touch'))
                    this._container.classList.remove('leaflet-control-layers-expanded');
                return this;
            },

            _initLayout() {

                const container = this._container = L.DomUtil.create('div', 'logiwaze-credits leaflet-control-layers');
                const collapsed = this.options.collapsed;

                this._section = L.DomUtil.create('div', 'credits', container);
                this._section.innerHTML =
                    '<h2 style="text-align: center">LogiWaze</h2>' +
                    '<h3><p>All media resources from the game "Foxhole" are owned by Siege Camp</p><p><a target="_blank" href="https://www.foxholegame.com">www.foxholegame.com</a></p><p>This content is unofficial</p></h3>' +
                    '<p>Map image thanks to Rust<br /><a target="_blank" href="https://rustard.itch.io/improved-map-mod">https://rustard.itch.io/improved-map-mod</a></p><hr>' +
                    '<p>Source code:<br /><a target="_blank" href="https://github.com/NoUDerp/LogiWaze">https://github.com/NoUDerp/LogiWaze</a></p><hr>' +
                    "<p><i>Special thanks to</i>:" +
                    "<div>Afrowner</div>" +
                    "<div>Antraxen</div>" +
                    "<div>Bazlow</div>" +
                    "<div>Cainsiderate</div>" +
                    "<div>DragonZephyr</div>" +
                    "<div>Fireblade</div>" +
                    "<div>Hayden</div>" +
                    "<div>Icanari</div>" +
                    "<div>Inquisitor Silenus</div>" +
                    "<div>Kastow</div>" +
                    "<div>Malarthyn</div>" +
                    "<div>Maybar</div>" +
                    "<div>Rick</div>" +
                    "<div>Rust</div>" +
                    "<div>Seabass</div>" +
                    "<div>Sentsu</div>" +
                    "<div>Skaj</div>" +
                    "<div>Steely Phil</div>" +
                    "</p>";

                const link = L.DomUtil.create('a', `logiwaze-logo credits-icon`, this._container);
                link.href = '#';
                link.title = "About";
                link.role = "button";
                link.innerHTML = "LW";
                link.setAttribute('role', 'button');

                // makes this work on IE touch devices by stopping it from firing a mouseout event when the touch is released
                container.setAttribute('aria-haspopup', true);

                L.DomEvent.disableClickPropagation(container);
                L.DomEvent.disableScrollPropagation(container);

                if (collapsed) {
                    this._map.on('click', this.collapse, this);
                    L.DomEvent.on(container, {pointerenter: this._expandSafely, pointerleave: this.collapse}, this);
                }

                L.DomEvent.on(link, {
                    keydown(e) {
                        if (e.code === 'Enter')
                            this._expandSafely();
                    },
                    click(e) {
                        L.DomEvent.preventDefault(e);
                        this._expandSafely();
                    }
                }, this);

                if (!collapsed)
                    this.expand();
            },

            _onInputClick() {
                if (this._preventClick) return;

                this._handlingClick = true;

                // click logic here

                this._handlingClick = false;
                this._refocusOnMap();
            },

            _expandIfNotCollapsed() {
                if (this._map && !this.options.collapsed)
                    this.expand();
                return this;
            },

            _expandSafely() {
                const section = this._section;
                this._preventClick = true;
                L.DomEvent.on(section, 'click', L.DomEvent.preventDefault);
                this.expand();
                setTimeout(() => {
                    L.DomEvent.off(section, 'click', L.DomEvent.preventDefault);
                    this._preventClick = false;
                });
            }

        });

        new L.Control.Credits().addTo(mymap);

        window.playing = false;


        let panel = Panel.Create(APIManager, Router, Geocoder);
        Router.Control = panel.addTo(mymap);

        // add another button
        for (let x of document.getElementsByClassName("leaflet-routing-reverse-waypoints")) {

            x.title = "Reverse Waypoints";
            var b = document.createElement("button");
            b.className = "copy-paste-url-button";
            b.alt = "Copy URL";
            b.title = "Copy URL";
            b.appendChild(document.createElement("div"));
            x.after(b);
            b.onclick = async function () {
                await navigator.clipboard.writeText(location.href);
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
            download_icon.src = MapIcons.data_url("download-file.svg");
            download_icon.style.width = "20px";
            download_icon.style.height = "20px";
            ss.appendChild(download_icon);
            ss.alt = "Screenshot";
            ss.title = "Save Screenshot";
            b.after(ss);


            let tt = document.createElement("button");
            tt.className = "copy-button";
            download_icon = document.createElement("img");
            download_icon.src = MapIcons.data_url("copy.svg");
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
                download_icon.src = MapIcons.data_url("bug.svg");
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
        mymap.fitBounds([[-256, 0], [0, 256]], {paddingBottomRight: [getPanelVisibleWidth(), getPanelVisibleHeight()]});
        ResumeAutoZoom();

        function createButton(label, container, image) {
            var btn = L.DomUtil.create('img', '', container);
            btn.setAttribute('src', image);
            btn.setAttribute('style', 'width: 28px; height: 28px; margin: 4px;');
            btn.innerHTML = label;
            return btn;
        }

        var mm = {prevent_double_click: false};

        mymap.on('click', function (e) {
            mm.timer = setTimeout(function () {
                if (!mm.prevent_double_click) {

                    let u = document.getElementsByClassName('leaflet-control-layers')[0];
                    if (u.classList.contains('leaflet-control-layers-expanded'))
                        u.classList.remove('leaflet-control-layers-expanded');
                    else {
                        var container = L.DomUtil.create('div'),
                            startBtn = createButton('Start here', container, MapIcons.data_url('ray-start.svg')),
                            destBtn = createButton('End here', container, MapIcons.data_url('ray-end.svg')),
                            cgarageBtn = createButton('Find garage', container, MapIcons.data_url('MapIconVehicleColonial.webp')),
                            wgarageBtn = createButton('Find garage', container, MapIcons.data_url('MapIconVehicleWarden.webp')),
                            refineryBtn = createButton('Find refinery', container, MapIcons.data_url('MapIconManufacturing.webp')),
                            factoryBtn = createButton('Find factory', container, MapIcons.data_url('MapIconFactory.webp'));

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
            minX = null;
            minY = null;
            maxX = null;
            maxY = null;
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
                mymap.fitBounds([[minY - rangeY * buffer, minX - rangeX * buffer], [minY + (1.0 + buffer * 2.0) * rangeY, minX + (1.0 + buffer * 2.0) * rangeX]], {paddingBottomRight: [getPanelVisibleWidth(), getPanelVisibleHeight()]});
                ResumeAutoZoom();
                AutoZoom = true;
            }
        }


        window.onresize = function () {
            if (AutoZoom)
                SmartAutoZoom();
        };

        var collapse_button = document.getElementsByClassName("leaflet-routing-collapse-btn")[0];

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
                    mymap.panBy([-getPanelWidth() * .5, -getPanelHeight() * .5], {
                        duration: .5,
                        animate: true,
                        noMoveStart: true
                    });
                    ResumeAutoZoom();
                } else { //close panel
                    PauseAutoZoom();
                    mymap.panBy([getPanelWidth() * .5, getPanelHeight() * .5], {
                        duration: .5,
                        animate: true,
                        noMoveStart: true
                    });
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
                            counter |= 1 << 1;
                            break;
                        case "Borders":
                            counter |= 1 << 2;
                            break;
                        case "Road Control":
                            counter |= 1 << 4;
                            break;
                        case "Refineries":
                            counter |= 1 << 7;
                            break;
                        case "Factories":
                            counter |= 1 << 8;
                            break;
                        case "Storage":
                            counter |= 1 << 9;
                            break;
                        case "Salvage":
                            counter |= 1 << 10;
                            break;
                        case "Components":
                            counter |= 1 << 11;
                            break;
                        case "Fuel":
                            counter |= 1 << 12;
                            break;
                        case "Sulfur":
                            counter |= 1 << 13;
                            break;
                        case "Coal":
                            counter |= 1 << 14;
                            break;
                        case "Control":
                            counter |= 1 << 15;
                            break;
                        case "Labels":
                            counter |= 1 << 16;
                            break;
                        case "Basic Font":
                            counter |= 1 << 17;
                            break;
                    }

            l = l.concat(':').concat(counter.toString(16).toUpperCase());

            var bounds = mymap.getBounds();
            var zoom = mymap.getZoom();
            var W = bounds.getWest(), E = bounds.getEast(), N = bounds.getNorth(), S = bounds.getSouth();
            var s = {lng: 0, lat: 0};// mymap.unproject([getPanelWidth(), getPanelHeight()], zoom);
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
                case "Coal":
                    Router.showCoal();
                    break;
                case "Salvage":
                    Router.showSalvage();
                    break;
                case "Road Control":
                    Router.showRoads();
                    break;
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
                case "Coal":
                    Router.hideCoal();
                    break;
                case "Salvage":
                    Router.hideSalvage();
                    break;
                case "Road Control":
                    Router.hideRoads();
                    break;
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
            for (i = 0; i < l.length; i++) {
                // if this is a town name locate it

                var a = l[i].split(",");
                if (a.length < 2) {
                    if (a[0] != '') {
                        var u = Geocoder.lookup(a[0]);
                        points.push([u.y, u.x]);
                    } else {
                        points.push([]);
                    }
                } else
                    points.push([parseFloat(a[0]), parseFloat(a[1])]);
            }
        }
        active_layers["Town Halls"] = (layers & (1 << 1)) != 0;
        active_layers["Borders"] = (layers & (1 << 2)) != 0;
        active_layers["Road Control"] = (layers & (1 << 4)) != 0;
        active_layers["Refineries"] = (layers & (1 << 7)) != 0;
        active_layers["Factories"] = (layers & (1 << 8)) != 0;
        active_layers["Storage"] = (layers & (1 << 9)) != 0;
        active_layers["Salvage"] = (layers & (1 << 10)) != 0;
        active_layers["Components"] = (layers & (1 << 11)) != 0;
        active_layers["Fuel"] = (layers & (1 << 12)) != 0;
        active_layers["Sulfur"] = (layers & (1 << 13)) != 0;
        active_layers["Coal"] = (layers & (1 << 14)) != 0;
        active_layers["Control"] = (layers & (1 << 15)) != 0;
        active_layers["Labels"] = (layers & (1 << 16)) != 0;
        active_layers["Basic Font"] = (layers & (1 << 17)) != 0;

        keys = Object.keys(active_layers);
        for (i = 0; i < keys.length; i++)
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
                    case "Road Control":
                        Router.Roads.remove();
                        Router.hideRoads();
                        break;
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
                    case "Coal":
                        Router.Coal.remove();
                        Router.hideCoal();
                        break;
                    case "Road Control":
                        Router.Roads.remove();
                        Router.hideRoads();
                        break;
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
        for (i = 0; i < points.length; i++)
            waypoints.push({latLng: {lat: points[i][0], lng: points[i][1]}});
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
        setTimeout(function () {
            document.getElementById("loader-holder").style.display = 'none';
        }, 1000);

    }, shard_url, function (error) {
        console.log(error);
        alert("War API cannot be contacted right now, it may be offline or there may be a network problem");
    });
}
