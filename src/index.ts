//@ts-nocheck
'use strict';

export {default as L} from 'leaflet';
export {default as $} from 'jquery';

import * as IVectorControlGrid from './IVectorControlGrid';
import * as IVectorTextGrid from './IVectorTextGrid';
import * as IRouter from './IRouter';
import { SAPI } from './API';
import * as Geocoder from './IGeocoder';
import * as IPanel from './Panel';

export class VectorControlGrid {
    Create(MaxNativeZoom, MaxZoom, Offset, API, RoadWidth, ControlWidth, GridDepth) {
        return IVectorControlGrid.Create(MaxNativeZoom, MaxZoom, Offset, API, RoadWidth, ControlWidth, GridDepth);
    }
}

export class VectorTextGrid {
    Create(MaxZoom, Offset) {
        return IVectorTextGrid.Create(MaxZoom, Offset);
    }
}

export class FoxholeRouter {
    Create(mymap, API) {
        return IRouter.Create(mymap, API);
    }
}

export class API {
    Create() {
        return SAPI.Create();
    }
}

export class FoxholeGeocoder {
    Create(API){ return Geocoder.FoxholeGeocoder(API); }
}

export class Panel {
    Create(APIManager, Router, Geocoder) { return IPanel.Create(APIManager, Router, Geocoder); }
}

module.exports.Shards = require('../Shards.json');
