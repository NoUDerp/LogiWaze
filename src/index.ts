//@ts-nocheck
'use strict';

module.exports.L = require('leaflet');

module.exports.$ = require('jquery');

module.exports.VectorControlGrid = {
    Create: (MaxNativeZoom, MaxZoom, Offset, API, RoadWidth, ControlWidth, GridDepth) => require('./IVectorControlGrid.js').Create(MaxNativeZoom, MaxZoom, Offset, API, RoadWidth, ControlWidth, GridDepth)
};

module.exports.VectorTextGrid = {
    Create: (MaxZoom, Offset) => require('./IVectorTextGrid.js').Create(MaxZoom, Offset)
};

module.exports.FoxholeRouter = {
    Create: (mymap, API, Narrator) => new require('./IRouter.js').FoxholeRouter(mymap, API, Narrator)
};

module.exports.API = {
    Create: () => require('./API.js').API
};

module.exports.FoxholeGeocoder = {
    Create: (API) => require('./IGeocoder.js').FoxholeGeocoder(API)
};

module.exports.Narrator = {
    Create: () => require('./INarrator.js').Narrator()
};

module.exports.Panel = {
    Create: (APIManager, Router, Geocoder) => require('./Panel.js').Panel(APIManager, Router, Geocoder)
}

module.exports.Shards = require('../Shards.json');
