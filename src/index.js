'use strict';

global.FoxholeRouter = {
    Create: function (mymap, API) {
        var R = require('./IRouter.js');
        return new R.FoxholeRouter(mymap, API);
    }
};

global.FoxholeGeocoder = {
    Create: function () {
        var G = require('./IGeocoder.js');
        return G.FoxholeGeocoder();
    }
};

global.API = {
    Create: function () {
        return require('./API.js').API();
    }
};
