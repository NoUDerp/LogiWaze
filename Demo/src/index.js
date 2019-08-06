'use strict';

global.FoxholeRouter = {
    Create: function (mymap) {
        var R = require('./IRouter.js');
        return new R.FoxholeRouter(mymap);
    }
};
global.FoxholeGeocoder = {
    Create: function () {
        var G = require('./IGeocoder.js');
        return G.FoxholeGeocoder();
    }
};
