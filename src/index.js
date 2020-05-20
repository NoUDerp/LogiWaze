'use strict';

global.FoxholeRouter = {
    Create: function (mymap, API) {
        var R = require('./IRouter.js');
        return new R.FoxholeRouter(mymap, API);
    }
};

global.API = {
    Create: function () {
        return require('./API.js').API();
    }
};

global.FoxholeGeocoder = {
    Create: function (API) {
        var G = require('./IGeocoder.js');
        return G.FoxholeGeocoder(API);
    }
};

