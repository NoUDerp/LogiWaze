'use strict';

global.FoxholeRouter = {
    Create: function (mymap, API, Narrator) {
        var R = require('./IRouter.js');
        return new R.FoxholeRouter(mymap, API, Narrator);
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

global.Narrator = {
    Create: function () {
        return require('./INarrator.js').Narrator();
    }
};

global.YouTube = {
	Create: function() {
		return require('./IYouTube.js').YouTube();
	}
};
