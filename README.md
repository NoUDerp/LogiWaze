# foxhole-router

## Demonstrations
A demonstration of all maps with the currently compiled routes is available here: [https://nouderp.github.io/foxhole-router](https://nouderp.github.io/foxhole-router)

It is also available inside this repository in the *Demo/* directory as *Demo/Demonstration Map.html*

View Demo of a single map is here: [https://foxholestats.com/router/](https://foxholestats.com/router/)

## Visualizations
![https://github.com/hayden-t/foxhole-router/blob/master/All.JPG](https://github.com/hayden-t/foxhole-router/blob/master/All.JPG "All roads mapped")


## Discussion
[https://discord.gg/dnegnws](https://discord.gg/dnegnws)

## Usage

* Include the leaflet (and leaflet-routing-machine) style sheets in your html <head>
	```
	<head>
	    <title>Demonstration foxhole router</title>
	    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.5.1/dist/leaflet.css" integrity="sha512-xwE/Az9zrjBIphAcBb3F6JVqxf46+CDLwfLMHloNu6KEQCAWi6HcDUbeOfBIptF7tcCzusKFjFw2yuvEpDL9wQ==" crossorigin="" />
	    <link rel="stylesheet" href="https://unpkg.com/leaflet-routing-machine@latest/dist/leaflet-routing-machine.css" crossorigin="" />
	</head>
	```
* Include leaflet normally in your project
	```
	<script src="https://unpkg.com/leaflet@1.5.1/dist/leaflet.js" integrity="sha512-GffPMF3RvMeYyc1LWMHtK8EbPv0iNZ8/oTtHPx9/cc2ILxQ+u905qIwdpULaqDkyBKgOaB57QTMg7ztg8Jm2Og==" crossorigin="">
	</script>
	```

* Add the leaflet map
	```
	<script type="text/javascript">
	
	        var mymap = L.map('mapid',
	            {
	                crs: L.CRS.Simple,
	                maxBounds: L.latLngBounds(L.latLng(-256, 0), L.latLng(0, 256)),
	                noWrap: true,
	                continuousWorld: true,
	                bounds: L.latLngBounds(L.latLng(-256, 0), L.latLng(0, 256))
	            }).setView([0, 0], 2);
	
	        L.tileLayer('https://github.com/Kastow/Foxhole-Map-Tiles/raw/master/Tiles/{z}/{z}_{x}_{y}.png',
	            {
	                crs: L.CRS.Simple,
	                maxZoom: 5,
	                minZoom: 1,
	                noWrap: true,
	                continuousWorld: true,
	                bounds: L.latLngBounds(L.latLng(-256, 0), L.latLng(0, 256)),
	                id: 'Demonstration Map'
	            }).addTo(mymap);
	
	    </script>
	```

* Include the compiled *FoxholeRouter.js* 
	```
	<script src="FoxholeRouter.js">
	</script>
	```

* Create the router and geocoder as custom options to a new routing control (this utilizes the included leaflet-routing-machine and foxhole data including routes and locations)
	```
	<script type="text/javascript">
	        var Router = FoxholeRouter.Create(mymap);
	        var Geocoder = FoxholeGeocoder.Create();
	        L.control.layers(null, {
	            'Roads': Router.Roads,
	            'Route': Router.NetworkLayer
	        }, { position: 'bottomright' }).addTo(mymap);
	
	        var startingWaypoints = [
	            L.latLng(-148.2358, 192.46460000000002),
	            L.latLng(-151.9339, 191.6564)
	        ];
	
	        L.Routing.control(
	            {
	                showAlternatives: false,
	                reverseWaypoints: true,
	                maxGeocoderTolerance: 1000000,
	                routeWhileDragging: false,
	                router: Router,
	                geocoder: Geocoder,
	                waypoints: startingWaypoints
	            }
	        ).addTo(mymap);
	
	    </script>
	```

## Building

Pre-requisites: nodejs, webpack

* install the required packages
```
npm install
```

* build the project
```
npm run build
```

* compiling the maps
    * Town information is collected and compiled from the [Foxhole WarAPI](https://github.com/clapfoot/warapi) static requests using the included *static.sh* script `./static.sh > towns.json`


## References  

The following libraries are used to implement the routing system:

* [http://www.liedman.net/geojson-path-finder/](http://www.liedman.net/geojson-path-finder/)
* [http://www.liedman.net/leaflet-routing-machine/](http://www.liedman.net/leaflet-routing-machine/)
   
