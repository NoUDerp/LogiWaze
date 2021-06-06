'use strict';

global.L = require('leaflet');
global.$ = require('jquery');
//require('jquery-ui');



global.VectorControlGrid = {
    Create: (MaxZoom, Offset, API, RoadWidth, ControlWidth, GridDepth) => require('./IVectorControlGrid.js').Create(MaxZoom, Offset, API, RoadWidth, ControlWidth, GridDepth)
};

global.VectorTextGrid = {
    Create: (MaxZoom, Offset) => require('./IVectorTextGrid.js').Create(MaxZoom, Offset)
};

global.FoxholeRouter = {
    Create: (mymap, API, Narrator) => new require('./IRouter.js').FoxholeRouter(mymap, API, Narrator)
};

global.API = {
    Create: () => require('./API.js').API
};

global.FoxholeGeocoder = {
    Create: (API) => require('./IGeocoder.js').FoxholeGeocoder(API)
};

global.Narrator = {
    Create: () => require('./INarrator.js').Narrator()
};

global.YouTube = {
    Create: () => require('./IYouTube.js').YouTube()
};

global.Panel = {
    Create: (APIManager, Router, Geocoder) => require('./Panel.js').Panel(APIManager, Router, Geocoder)
}
