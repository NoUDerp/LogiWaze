# foxhole-router

View Demo of one map here: https://foxholestats.com/router/ , but we want it over the whole world !



All roads mapped https://github.com/hayden-t/foxhole-router/blob/master/All.JPG



Now we just need NodeJs/JS coder/s    

Discuss:  https://discord.gg/dnegnws

   
   These following are dev notes:
   
   QGIS's default line type is MultiLineString but the routing library needs LineString, so this can be converted when needed at the end: Vector->Geometry Tools->Multi Parts to Single Parts
   Also when exporting json for web use, change precision to 0 to save filesize, we dont need that accuracy, likely in post we can write a script to even further shorten the cord data length.
   Also i used in my demo the vector geometry "densify" tool to add more points along lines.
   If you want demo source let me know, im looking for help with it.
   Libs:

   http://www.liedman.net/geojson-path-finder/
   http://www.liedman.net/leaflet-routing-machine/
   
