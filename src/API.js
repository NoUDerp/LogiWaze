define(['jquery', 'point-in-polygon'], function ($, pip) {
	return {
		API: function () {
			var width = 256 / 5.5;
			var height = width * Math.sqrt(3) / 2;
			var halfwidth = width * .5;
			var halfheight = height * .5;

			var regionPolygon = [[halfwidth * .5, halfheight], [halfwidth, 0], [halfwidth * .5, -halfheight], [-halfwidth * .5, -halfheight], [-halfwidth, 0], [-halfwidth * .5, halfheight]];
			var ox = 128;
			var oy = -127;
			var regions = [
				{ name: "GodcroftsHex", y: .5 * height + oy, x: 2.25 * width + ox },
				{ name: "DeadLandsHex", y: oy, x: ox },
				{ name: "ReachingTrailHex", y: oy + 2 * height, x: ox },
				{ name: "CallahansPassageHex", y: oy + height, x: ox },
				{ name: "MarbanHollow", y: oy + .5 * height, x: ox + .75 * width },
				{ name: "UmbralWildwoodHex", y: oy - height, x: ox },
				{ name: "HeartlandsHex", y: oy - 1.5 * height, x: ox - .75 * width },
				{ name: "LochMorHex", y: oy - .5 * height, x: ox - .75 * width },
				{ name: "LinnMercyHex", y: oy + .5 * height, x: ox - .75 * width },
				{ name: "StonecradleHex", y: oy + height, x: ox - 1.5 * width },
				{ name: "FarranacCoastHex", y: oy, x: ox - 1.5 * width },
				{ name: "WestgateHex", y: oy - height, x: ox - 1.5 * width },
				{ name: "FishermansRowHex", y: oy - .5 * height, x: ox - 2.25 * width },
				{ name: "OarbreakerHex", y: oy + .5 * height, x: ox - 2.25 * width },
				{ name: "GreatMarchHex", y: oy - 2 * height, x: ox },
				{ name: "TempestIslandHex", y: oy - .5 * height, x: ox + 2.25 * width },
				{ name: "EndlessShoreHex", y: oy, x: ox + 1.5 * width },
				{ name: "AllodsBightHex", y: oy - height, x: ox + 1.5 * width },
				{ name: "WeatheredExpanseHex", y: oy + height, x: ox + 1.5 * width },
				{ name: "DrownedValeHex", y: oy - .5 * height, x: ox + .75 * width },
				{ name: "ShackledChasmHex", y: oy - 1.5 * height, x: ox + .75 * width },
				{ name: "ViperPitHex", y: oy + 1.5 * height, x: ox + .75 * width },
				{ name: "MooringCountyHex", y: oy + 1.5 * height, x: ox - .75 * width }
			];

			var API = {
				calculateRegion: function (x, y) {
					for (var i = 0; i < regions.length; i++) {
						var region = regions[i];


						if (pip([x - region.x, - region.y + y], regionPolygon))
							return region.name;
					}
				},
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

					//return "WARDENS";
					var distanceSquared = -1;
					var control = "";
					var icon = -1;
					var keys = Object.keys(u);
					for (var i = 0; i < keys.length; i++) {
						var j = u[keys[i]];
						var px = j.x;
						var py = j.y;
						var distanceCalculation = (x - px) * (x - px) + (y - py) * (y - py);
						if (distanceSquared < 0 || distanceCalculation < distanceSquared) {
							control = j.control;
							icon = j.mapIcon;
							distanceSquared = distanceCalculation;
						}
					}
					return { ownership: control, icon: icon };
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
													var key = x.toFixed(3).toString().concat('|').concat(y.toFixed(3).toString());
													API.mapControl[mapName][key] = { x: x, y: y, control: mapData.mapItems[j].teamId, mapIcon: icon };
												}
											}

											if (--complete == 0)
												completionCallback();

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

