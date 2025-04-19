//@ts-nocheck
'use strict';

import API from "./API";
import FoxholeGeocoder from "./IGeocoder";

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
    Create: () => new API()
};

module.exports.FoxholeGeocoder = {
    Create: (API) => new FoxholeGeocoder(API) // (require('./IGeocoder.ts')).
};

module.exports.Panel = {
    Create: (APIManager, Router, Geocoder) => require('./Panel.ts').Create(APIManager, Router, Geocoder)
}

module.exports.Shards = require('../Shards.json');

//
// export {default as L} from 'leaflet';
// export {default as $} from 'jquery';
//
// import * as IVectorControlGrid from './IVectorControlGrid';
// import * as IVectorTextGrid from './IVectorTextGrid';
// import * as IRouter from './IRouter';
// import { SAPI } from './API';
// import * as Geocoder from './IGeocoder';
// import * as IPanel from './Panel';
//
// export class VectorControlGrid {
//     Create(MaxNativeZoom, MaxZoom, Offset, API, RoadWidth, ControlWidth, GridDepth) {
//         return IVectorControlGrid.Create(MaxNativeZoom, MaxZoom, Offset, API, RoadWidth, ControlWidth, GridDepth);
//     }
// }
//
// export class VectorTextGrid {
//     Create(MaxZoom, Offset) {
//         return IVectorTextGrid.Create(MaxZoom, Offset);
//     }
// }
//
// export class FoxholeRouter {
//     Create(mymap, API) {
//         return IRouter.Create(mymap, API);
//     }
// }
//
// export class API {
//     Create() {
//         return SAPI.Create();
//     }
// }
//
// export class FoxholeGeocoder {
//     Create(API){ return Geocoder.FoxholeGeocoder(API); }
// }
//
// export class Panel {
//     Create(APIManager, Router, Geocoder) { return IPanel.Create(APIManager, Router, Geocoder); }
// }
//
// module.exports.Shards = require('../Shards.json');
