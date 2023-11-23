define(['leaflet', './Itinerary.js', 'jquery'], function (L, Itinerary, $) {

    class custom_time_formatter extends L.Routing.Formatter {
        constructor(FHR) {
            super();
            this.FoxholeRouter = FHR;
        }

        formatTime(distance) {
            var time = distance * this.FoxholeRouter.truckSpeed;
            var t1 = L.Routing.Formatter.prototype.formatTime.call(this, time);
            var t2 = L.Routing.Formatter.prototype.formatTime.call(this, time);
            var jeep_time = distance * this.FoxholeRouter.jeepSpeed;
            var t3 = L.Routing.Formatter.prototype.formatTime.call(this, jeep_time);
            var t4 = L.Routing.Formatter.prototype.formatTime.call(this, jeep_time);
            var flatbed_time = distance * this.FoxholeRouter.flatbedSpeed;
            var t5 = L.Routing.Formatter.prototype.formatTime.call(this, flatbed_time);
            var t6 = L.Routing.Formatter.prototype.formatTime.call(this, flatbed_time);
            var htd_time = distance * this.FoxholeRouter.htdSpeed;
            var t7 = L.Routing.Formatter.prototype.formatTime.call(this, htd_time);
            var a = "<div class=\'detailed-routeinfo\'><table class=\"vehicle-speed-panel\">";
            a = a.concat("<tr>");
            a = a.concat("<td style=\"text-align: right\"><img src=\'Truck.webp\' class='fast-truck' /></td>");
            a = a.concat("<td style=\"text-align: left\">").concat(t2).concat("</td>");
            a = a.concat("<td style=\"text-align: right\"><img src=\'Flatbed.webp\' class='fast-truck' /></td>");
            a = a.concat("<td style=\"text-align: left\">").concat(t6).concat("</td>");
            a = a.concat("<td style=\"text-align: right\"><img src=\'HTD.webp\' class='slowest-truck' /></td>");
            a = a.concat("<td style=\"text-align: left\">").concat(t7).concat("</td>");
            a = a.concat("</tr>");
            a = a.concat("</table></div>");
            return a;
        }

        formatDistance(d, precision) {
            if (typeof d === 'object') {
                let a = L.Routing.Formatter.prototype.formatDistance.call(this, d.distance, precision).replace(' ', '');
                if (d.breakdown[2] > 0)
                    a = a.concat('<div class="roadtier" style="width: 100%"><div style="background-color: #957458; width: ').concat(d.breakdown[2] * 100.0).concat('%"><span>Gravel/Paved&nbsp;(').concat(Math.round(d.breakdown[2] * 100.0)).concat('%)</span></div></div>');
                if (d.breakdown[1] > 0)
                    a = a.concat('<div class="roadtier" style="width: 100%"><div style="background-color: #94954e; width: ').concat(d.breakdown[1] * 100.0).concat('%"><span>Dirt&nbsp;(').concat(Math.round(d.breakdown[1] * 100.0)).concat('%)</span></div></div>');
                if (d.breakdown[0] > 0)
                    a = a.concat('<div class="roadtier" style="width: 100%"><div style="background-color: #eee;  width: ').concat(d.breakdown[0] * 100.0).concat('%"><span>Mud&nbsp;(').concat(Math.round(d.breakdown[0] * 100.0)).concat('%)</span></div></div>');
                return a;
            }
            else
                return L.Routing.Formatter.prototype.formatDistance.call(this, d, precision).replace(' ', '')

        }

    }

    var prototype = Itinerary.extend({
        options: {
            fitSelectedRoutes: 'smart',
            routeLine: function (route, options) { return new Line(route, options); },
            autoRoute: true,
            routeWhileDragging: false,
            routeDragInterval: 500,
            waypointMode: 'connect',
            showAlternatives: false,
            defaultErrorHandler: function (e) {
                console.error('Routing error:', e.error);
            }
        },

        initialize: function (options) {
            L.Util.setOptions(this, options);

            this._router = this.options.router || new OSRMv1(options);
            this._plan = this.options.plan || new Plan(this.options.waypoints, options);
            this._requestCount = 0;

            Itinerary.prototype.initialize.call(this, options);

            this.on('routeselected', this._routeSelected, this);
            if (this.options.defaultErrorHandler) {
                this.on('routingerror', this.options.defaultErrorHandler);
            }
            this._plan.on('waypointschanged', this._onWaypointsChanged, this);
            if (options.routeWhileDragging) {
                this._setupRouteDragging();
            }
        },

        _onZoomEnd: function () {
            if (!this._selectedRoute ||
                !this._router.requiresMoreDetail) {
                return;
            }

            var map = this._map;
            if (this._router.requiresMoreDetail(this._selectedRoute,
                map.getZoom(), map.getBounds())) {
                this.route({
                    callback: L.bind(function (err, routes) {
                        var i;
                        if (!err) {
                            for (i = 0; i < routes.length; i++) {
                                this._routes[i].properties = routes[i].properties;
                            }
                            this._updateLineCallback(err, routes);
                        }

                    }, this),
                    simplifyGeometry: false,
                    geometryOnly: true
                });
            }
        },

        onAdd: function (map) {
            if (this.options.autoRoute) {
                this.route();
            }

            var container = L.Routing.Itinerary.prototype.onAdd.call(this, map);

            this._map = map;
            this._map.addLayer(this._plan);

            this._map.on('zoomend', this._onZoomEnd, this);

            if (this._plan.options.geocoder) {
                container.insertBefore(this._plan.createGeocoders(), container.firstChild);
            }

            return container;
        },

        onRemove: function (map) {
            map.off('zoomend', this._onZoomEnd, this);
            if (this._line) {
                map.removeLayer(this._line);
            }
            map.removeLayer(this._plan);
            if (this._alternatives && this._alternatives.length > 0) {
                for (var i = 0, len = this._alternatives.length; i < len; i++) {
                    map.removeLayer(this._alternatives[i]);
                }
            }
            return Itinerary.prototype.onRemove.call(this, map);
        },

        selectedRoute: null,

        getWaypoints: function () {
            return this._plan.getWaypoints();
        },

        setWaypoints: function (waypoints) {
            this._plan.setWaypoints(waypoints);
            return this;
        },

        spliceWaypoints: function () {
            var removed = this._plan.spliceWaypoints.apply(this._plan, arguments);
            return removed;
        },

        getPlan: function () {
            return this._plan;
        },

        getRouter: function () {
            return this._router;
        },

        _routeSelected: function (e) {
            var route = this._selectedRoute = e.route,
                alternatives = this.options.showAlternatives && e.alternatives,
                fitMode = this.options.fitSelectedRoutes,
                fitBounds =
                    (fitMode === 'smart' && !this._waypointsVisible()) ||
                    (fitMode !== 'smart' && fitMode);

            this._updateLines({ route: route, alternatives: alternatives });

            if (fitBounds) {
                this._map.fitBounds(this._line.getBounds());
            }

            if (this.options.waypointMode === 'snap') {
                this._plan.off('waypointschanged', this._onWaypointsChanged, this);
                this.setWaypoints(route.waypoints);
                this._plan.on('waypointschanged', this._onWaypointsChanged, this);
            }
        },

        _waypointsVisible: function () {
            var wps = this.getWaypoints(),
                mapSize,
                bounds,
                boundsSize,
                i,
                p;

            try {
                mapSize = this._map.getSize();

                for (i = 0; i < wps.length; i++) {
                    p = this._map.latLngToLayerPoint(wps[i].latLng);

                    if (bounds) {
                        bounds.extend(p);
                    } else {
                        bounds = L.bounds([p]);
                    }
                }

                boundsSize = bounds.getSize();
                return (boundsSize.x > mapSize.x / 5 ||
                    boundsSize.y > mapSize.y / 5) && this._waypointsInViewport();

            } catch (e) {
                return false;
            }
        },

        _waypointsInViewport: function () {
            var wps = this.getWaypoints(),
                mapBounds,
                i;

            try {
                mapBounds = this._map.getBounds();
            } catch (e) {
                return false;
            }

            for (i = 0; i < wps.length; i++) {
                if (mapBounds.contains(wps[i].latLng)) {
                    return true;
                }
            }

            return false;
        },

        _updateLines: function (routes) {
            var addWaypoints = this.options.addWaypoints !== undefined ?
                this.options.addWaypoints : true;
            this._clearLines();

            // add alternatives first so they lie below the main route
            this._alternatives = [];
            if (routes.alternatives) routes.alternatives.forEach(function (alt, i) {
                this._alternatives[i] = this.options.routeLine(alt,
                    L.extend({
                        isAlternative: true
                    }, this.options.altLineOptions || this.options.lineOptions));
                this._alternatives[i].addTo(this._map);
                this._hookAltEvents(this._alternatives[i]);
            }, this);

            this._line = this.options.routeLine(routes.route,
                L.extend({
                    addWaypoints: addWaypoints,
                    extendToWaypoints: this.options.waypointMode === 'connect'
                }, this.options.lineOptions));
            this._line.addTo(this._map);
            this._hookEvents(this._line);
        },

        _hookEvents: function (l) {
            l.on('linetouched', function (e) {
                if (e.afterIndex < this.getWaypoints().length - 1) {
                    this._plan.dragNewWaypoint(e);
                }
            }, this);
        },

        _hookAltEvents: function (l) {
            l.on('linetouched', function (e) {
                var alts = this._routes.slice();
                var selected = alts.splice(e.target._route.routesIndex, 1)[0];
                this.fire('routeselected', { route: selected, alternatives: alts });
            }, this);
        },

        _onWaypointsChanged: function (e) {
            if (this.options.autoRoute) {
                this.route({});
            }
            if (!this._plan.isReady()) {
                this._clearLines();
                this._clearAlts();
            }
            this.fire('waypointschanged', { waypoints: e.waypoints });
        },

        _setupRouteDragging: function () {
            var timer = 0,
                waypoints;

            this._plan.on('waypointdrag', L.bind(function (e) {
                waypoints = e.waypoints;

                if (!timer) {
                    timer = setTimeout(L.bind(function () {
                        this.route({
                            waypoints: waypoints,
                            geometryOnly: true,
                            callback: L.bind(this._updateLineCallback, this)
                        });
                        timer = undefined;
                    }, this), this.options.routeDragInterval);
                }
            }, this));
            this._plan.on('waypointdragend', function () {
                if (timer) {
                    clearTimeout(timer);
                    timer = undefined;
                }
                this.route();
            }, this);
        },

        _updateLineCallback: function (err, routes) {
            if (!err) {
                routes = routes.slice();
                var selected = routes.splice(this._selectedRoute.routesIndex, 1)[0];
                this._updateLines({
                    route: selected,
                    alternatives: this.options.showAlternatives ? routes : []
                });
            } else if (err.type !== 'abort') {
                this._clearLines();
            }
        },

        route: function (options) {
            var ts = ++this._requestCount,
                wps;

            if (this._pendingRequest && this._pendingRequest.abort) {
                this._pendingRequest.abort();
                this._pendingRequest = null;
            }

            options = options || {};

            if (this._plan.isReady()) {
                if (this.options.useZoomParameter) {
                    options.z = this._map && this._map.getZoom();
                }

                wps = options && options.waypoints || this._plan.getWaypoints();
                this.fire('routingstart', { waypoints: wps });
                this._pendingRequest = this._router.route(wps, function (err, routes) {
                    this._pendingRequest = null;

                    if (options.callback) {
                        return options.callback.call(this, err, routes);
                    }

                    // Prevent race among multiple requests,
                    // by checking the current request's count
                    // against the last request's; ignore result if
                    // this isn't the last request.
                    if (ts === this._requestCount) {
                        this._clearLines();
                        this._clearAlts();
                        if (err && err.type !== 'abort') {
                            this.fire('routingerror', { error: err });
                            return;
                        }

                        routes.forEach(function (route, i) { route.routesIndex = i; });

                        if (!options.geometryOnly) {
                            this.fire('routesfound', { waypoints: wps, routes: routes });
                            this.setAlternatives(routes);
                        } else {
                            var selectedRoute = routes.splice(0, 1)[0];
                            this._routeSelected({ route: selectedRoute, alternatives: routes });
                        }
                    }
                }, this, options);
            }
        },

        _clearLines: function () {
            if (this._line) {
                this._map.removeLayer(this._line);
                delete this._line;
            }
            if (this._alternatives && this._alternatives.length) {
                for (var i in this._alternatives) {
                    this._map.removeLayer(this._alternatives[i]);
                }
                this._alternatives = [];
            }
        }
    });

    class PanelFormatter extends L.Routing.ItineraryBuilder {
        constructor(API) {
            super();
            this.index = 0;
            this.counter = 1;
            this.first = true;
            this.API = API;
        }

        createStep(text, distance, steps) {

            var region;
            var border = 0;
            var newRegion = false;
            var turnicon = "";
            if (text.indexOf("|") >= 0) {
                var u = text.split("\|");
                region = u[0];
                text = u[1];
                border = parseInt(u[2]);
                newRegion = parseInt(u[3]) === 1;
                turnicon = u[4];
            }
            else
                region = "";


            if (newRegion || this.first) {
                var container2 = document.createElement("TR");
                container2.style.padding = ".1em 2px";
                var divider2 = document.createElement("TD");
                divider2.setAttribute("colspan", "2");
                divider2.innerText = this.API.mapRegionName(region);
                divider2.style["font-size"] = "normal";
                divider2.style.width = "100%";
                divider2.style["pointer-events"] = "none";
                container2.appendChild(divider2);
                this.block.appendChild(container2);
                this.first = false;
            }

            if (border === 1) {
                var container3 = document.createElement("TR");
                container3.style.padding = ".1em 2px";
                var divider3 = document.createElement("TD");
                divider3.setAttribute("colspan", "2");
                divider3.innerText = "You are approaching a border crossing, check your radio";
                divider3.style = "font-size: x-small; width: 100%";
                divider3.style["padding-left"] = "2em";
                container3.appendChild(divider3);
                this.block.appendChild(container3);
            }


            var container = document.createElement("TR");
            container.classList.add("narrator-step-".concat((this.counter++).toString()));
            container.classList.add("narrator-steps");
            container.style.padding = ".1em 2px";
            var divider2 = document.createElement("TD");

            if (turnicon != "" && turnicon != null && window.beta)
                divider2.innerHTML = "<div class=\"".concat(turnicon.replace(' ', '-').toLowerCase()).concat('"></div>');

            var divider1 = document.createElement("TD");

            if (border === 1)
                divider1.innerText = text.concat(" and cross the border");
            else
                divider1.innerText = text;
            divider1.style = "font-size: x-small; width: 100%";
            divider1.style["padding-left"] = "2em";
            container.appendChild(divider2);
            container.appendChild(divider1);
            container.index = this.index++;
            this.block.appendChild(container);

            return container;
        }

        createContainer(className) {

            var table = document.createElement("TABLE");
            table.setAttribute("style", "width: 100%");
            if (className != null)
                table.setAttribute("class", className.concat(" ").concat("detailed-routeinfo"));
            else
                table.setAttribute("class", "detailed-routeinfo");
            this.container = table;
            return this.container;
        }

        createStepsContainer(container) {

            this.block = L.Routing.ItineraryBuilder.prototype.createStepsContainer(container);
            this.container.appendChild(this.block);
            return this.block;
        }
    }


    return {
        Panel: (API, Router, Geocoder) => {
            let pp = new prototype({
                showAlternatives: false,
                show: false,
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
                itineraryBuilder: new PanelFormatter(API),
                summaryTemplate: Router.summaryTemplate,
                collapsible: true,
                formatter: new custom_time_formatter(Router)
            });
            pp.on('routeselected', (e) => pp.routeSelected = e.route);

            return pp;
        }
    };
});

