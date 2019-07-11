# foxhole-router

View Demo of one map here: https://foxholestats.com/router/


To view or help map all the roads in game foxhole:

Install QGIS from here: https://qgis.org/en/site/forusers/download.html (standalone)

Create new project, set CRS to Project CRS EPSG 3857 WGS 84 and save it.

Add the world map background tiles layer: 
  Browser->XYZ Tiles (rightclick)->New Connection
  Give it a name like "Foxhole World Map" and specify the url as 
  https://raw.githubusercontent.com/Kastow/Foxhole-Map-Tiles/master/Tiles/{z}/{z}_{x}_{y}.png
  Set min zoom to 0 and max to 5, Choose OK
  Double click newly added connection to add it your project/map. You should now see the foxhole world map.

Add hex grid for reference:
  Layer->Add Layer->Vector Layer
  Source Type = Protocol HTTP
  Type = GEOJSON
  URI = https://raw.githubusercontent.com/hayden-t/foxhole-router/master/grid.geojson
 If this fails with error, save the file locally and add it from there.
  
  [section to come - add existing region jsons]
  
  To start mapping a new region: (Please contact us to select a map, eg discord, or issues, so we dount double up)
  
  Turn on Snapping:
    View->Toolbars->Snapping, Then click Magnet Icon to enable.  
  Create a new layer:
    Click Layer->Create Layer->New Shapefile
    
   Filename = Choose file save location, naming it the map you are working on.
   Geometry Type = Line
   Additional = Project CRS EPSG 3857 WGS 84
   OK
   
 Hide form by default: Right click Layer->Properties->Form->"Hide Form on add feature" (top right)
 (optionally also change line style to something easy to see, like "topo road"}

  Start mapping:
    With new layer selected, click "Toggle Editing" buttom, click "Add Line Feature",
    Start clicking along the roads making sure to make a click/vertex point at each intersection, right click to end line.
    Keep adding lines until taking a break or done, "Toggle Editing" off, and click save
    You can also use the "Vertex Tool" to adjust or remove points.
    Please continue your lines just past the border line if road crosses map.
   
   To share work export layer as geojson. 
   
   These following steps dont have to be done right away, but they are needed for final product (dev note)
   
   QGIS default line type in MultiLineString but the routing library needs LineString, so this can be converted when needed: Vector->Geometry Tools->Multi Parts to Single Parts
   Also when exporting json for web use, change precision to 0 to save filesize, we dont need that accuracy.
    
Map Assignment List
 * AllodsBightHex
 * CallahansPassageHex
 * DeadLandsHex
 * DrownedValeHex
 * EndlessShoreHex
 * FarranacCoastHex
 * FishermansRowHex
 * GodcroftsHex		
 * GreatMarchHex
 * HeartlandsHex
 * LinnMercyHex
 * LochMorHex
 * MarbanHollow -> HAYDEN
 * MooringCountyHex
 * OarbreakerHex
 * ReachingTrailHex
 * ShackledChasmHex
 * StonecradleHex
 * TempestIslandHex
 * UmbralWildwoodHex
 * ViperPitHex
 * WeatheredExpanseHex -> DERP
 * WestgateHex
