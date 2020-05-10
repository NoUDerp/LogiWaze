define(['jquery'], function ($) {
    return {
	API: function() {
		var API = {
			update: function()
			{
				$.ajax({
		                        url : "https://war-service-live.foxholeservices.com/api/worldconquest/maps",
		                        type : 'GET',
		                        crossDomain: true,
		                        data : "json",
		                        dataType : "json",
		                        success : function(maps) {
	        	                        // iterate here on the maps and collect status
		                                var mapControl = {};
		                                var complete = 0;
		                                for(var i=0;i<maps.length;i++)
		                                {
		                                        var mapName = maps[i];
		                                        $.ajax({url:"https://war-service-live.foxholeservices.com/api/worldconquest/maps/".concat(mapName).concat("/dynamic/public"),
		                                                type: 'GET',
		                                                crossDomain: true,
		                                                data : "json",
		                                                dataType : "json",
		                                                success: function(mapData) {
		                                                        mapControl[mapName] = [];
		                                                        for(var j=0;j<mapData;j++)
		                                                                mapControl[mapName][mapControl.length] = {x:mapData.x, y:mapData.y, control: mapData.teamId };
		                                                        complete++;
		                                                },
		                                                error: function(failure) { alert(JSON.stringify(failure)); }
		                                        });
		                                }
		                        },
		                        error: function(e) { alert(JSON.stringify(e)); }
			        });
			}
		};
		return API;
	}
    }
});

