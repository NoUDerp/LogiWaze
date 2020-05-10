define(['jquery'], function ($) {
	return {
		API: function () {
			var API = {

				mapControl: {},
				remapXY: function (f) {
					if (f === "GodcroftsHex") return { x: 148.15477, y: -23.27272 };
					if (f === "DeadLandsHex") return { x: 128, y: -128 };
					if (f === "ReachingTrailHex") return { x: 208.6191, y: -128 };
					if (f === "CallahansPassageHex") return { x: 168.30954, y: -128 };
					if (f === "MarbanHollowHex") return { x: 148.15477, y: -93.09091 };
					if (f === "MarbanHollow") return { x: 148.15477, y: -93.09091 };
					if (f === "UmbralWildwoodHex") return { x: 87.69045, y: -128 };
					if (f === "MoorsHex") return { x: 188.46432, y: -162.90909 };
					if (f === "MooringCountyHex") return { x: 188.46432, y: -162.90909 };
					if (f === "HeartlandsHex") return { x: 67.535675, y: -162.90909 };
					if (f === "LochMorHex") return { x: 107.84523, y: -162.90909 };
					if (f === "LinnOfMercyHex") return { x: 148.15477, y: -162.90909 };
					if (f === "LinnMercyHex") return { x: 148.15477, y: -162.90909 };
					if (f === "StonecradleHex") return { x: 168.30954, y: -197.81818 };
					if (f === "FarranacCoastHex") return { x: 128, y: -197.81818 };
					if (f === "WestgateHex") return { x: 87.69045, y: -197.81818 };
					if (f === "FishermansRowHex") return { x: 107.84523, y: -232.72728 };
					if (f === "OarbreakerHex") return { x: 148.15477, y: -232.72728 };
					if (f === "GreatMarchHex") return { x: 47.380905, y: -128 };
					if (f === "TempestIslandHex") return { x: 107.84523, y: -23.27272 };
					if (f === "EndlessShoreHex") return { x: 128, y: -58.181816 };
					if (f === "AllodsBightHex") return { x: 87.69045, y: -58.181816 };
					if (f === "WeatheredExpanseHex") return { x: 168.30954, y: -58.181816 };
					if (f === "DrownedValeHex") return { x: 107.84523, y: -93.09091 };
					if (f === "ShackledChasmHex") return { x: 67.535675, y: -93.09091 };
					if (f === "ViperPitHex") return { x: 188.46432, y: -93.09091 };
					return { x: 0, y: 0 };
				},

				ownership: function (x, y, region) {
					var u = API.mapControl[region];
					if (u === null || typeof u === 'undefined')
						return "OFFLINE";
					var distanceSquared = 99999999999;
					var control = "";
					for (var i = 0; i < u.length; i++) {
						var px = u[i].x;
						var py = u[i].y;
						var distanceCalculation = (x - px) * (x - px) + (y - py) * (y - py);
						if (distanceCalculation < distanceSquared) {
							control = u[i].control;
							distanceSquared = distanceCalculation;
						}
					}
					return control;
				},

				update: function (completionCallback) {
					$.ajax({
						url: "https://war-service-live.foxholeservices.com/api/worldconquest/maps",
						type: 'GET',
						crossDomain: true,
						data: "json",
						dataType: "json",
						success: function (maps) {
							// iterate here on the maps and collect status
							var complete = maps.length;
							for (var i = 0; i < maps.length; i++) {
								const mapName = maps[i];
								$.ajax(
									{
										url: "https://war-service-live.foxholeservices.com/api/worldconquest/maps/".concat(maps[i]).concat("/dynamic/public"),
										type: 'GET',
										crossDomain: true,
										data: "json",
										dataType: "json",
										success: function (mapData) {
											API.mapControl[mapName] = [];
											var offset = API.remapXY(mapName);
											for (var j = 0; j < mapData.mapItems.length; j++) {
												var icon = mapData.mapItems[j].iconType;
												if ((icon >= 5 && icon <= 10) || (icon >= 45 && icon <= 47) || icon == 29) {
													var x = mapData.mapItems[j].x;
													var y = mapData.mapItems[j].y;
													x = 256 + (((x * 46.54545454545455) + offset.y) - 23.27272727272727);
													y = -256 + ((((1 - y) * 40.30954606705751) + offset.x) - 20.15477303352875);
													API.mapControl[mapName].push({ x: x, y: y, control: mapData.mapItems[j].teamId });
												}
											}

											if (--complete == 0) {

												completionCallback();
											}
										},
										error: function (failure) { --complete; alert(JSON.stringify(failure)); }
									}
								);
							}
						},
						error: function (e) { alert(JSON.stringify(e)); }
					});
				}
			};
			return API;
		}
	}
});

