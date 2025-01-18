//@ts-nocheck
'use strict';

module.exports.L = require('leaflet');

module.exports.$ = require('jquery');

module.exports.VectorControlGrid = {
    Create: (MaxNativeZoom, MaxZoom, Offset, API, RoadWidth, ControlWidth, GridDepth) => require('./IVectorControlGrid.js').Create(MaxNativeZoom, MaxZoom, Offset, API, RoadWidth, ControlWidth, GridDepth)
};

module.exports.VectorTextGrid = {
    Create: (MaxZoom, Offset) => require('./IVectorTextGrid.ts').Create(MaxZoom, Offset)
};

module.exports.FoxholeRouter = {
    Create: (mymap, API) => require('./IRouter.ts').Create(mymap, API)
};

module.exports.API = {
    Create: () => require('./API.ts').API
};

module.exports.FoxholeGeocoder = {
    Create: (API) => require('./IGeocoder.ts').FoxholeGeocoder(API)
};

module.exports.Panel = {
    Create: (APIManager, Router, Geocoder) => require('./Panel.ts').Create(APIManager, Router, Geocoder)
}

module.exports.Shards = require('../Shards.json');
