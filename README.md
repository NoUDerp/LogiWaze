# foxhole-router

## Demonstrations
LogiWaze is a leaflet-based [Foxhole](https://www.foxholegame.com/) logistics router, available at [https://www.logiwaze.com/]

![](https://github.com/NoUDerp/logiwaze/blob/master/readme/Screenshot.webp)

Alternatively you can experience LogiWaze by opening the index.html from a downloaded/cloned repository

The original prototyping for this idea was done by Hayden of: [https://foxholestats.com/](https://foxholestats.com/)

## Discussion (via FoxholeStats.com discord)
[https://discord.gg/dnegnws](https://discord.gg/dnegnws)

## Building

Pre-requisites: *nodejs, webpack, spatialite, gdal-bin (gdal tools, specifically ogr2ogr)*

* install the required packages
```
npm install
```

* build the project
```
npm run build
```
### Updating towns

Execute the town halls script when all regions are available (if regions are offline their towns will not be provided in the API and not added), which requires pre-requisite *jq*
```
./export_major_locations > towns.json
```

Rebuild the project
```
npm run build
```

### Editing roads

Roads can be edited by opening the qgis project file included in the repository. Edit the *Unified* layer, assigning a road tier for each added road and save the *Unified* layer and optionally the project. Rebuild the project.

* Open "Open with QGIS to edit.qgz" using [https://download.qgis.org/](QGIS)

* Select the layer *Unified Roads* and make it editable

![](https://github.com/NoUDerp/logiwaze/blob/master/readme/Editing1.webp)

* The two important tools for this process are *Add Line Feature* and *Vertex Tool*

![](https://github.com/NoUDerp/logiwaze/blob/master/readme/Editing2.webp)

*Add Line Feature* can be used to extend a road (from a node). This is used for creating new roads.

*Vertex Tool* can be used to reposition the nodes of a road, or create a new node in the middle of a road (to add road detail or create a node that *Add Line Feature* can be extended from. This can also be used to delete nodes

* Save the layer upon completion of your changes, and rebuild the project; your new changes should immediately be availabe after building. Be aware of these helpful hints:

- Use vertex snapping. It ensures points that are supposed to be equal (a fork in the road) are connected. When roads are unconnected in any way, proper routing will not work

- Do not create a closed loop road in a single path. It is ok to make a loop if it is broken into multiple paths, but a single path closed road will not be able to be processed in the routing (it creates an endless loop)

- There are 3 road tiers. After adding each road segment you will be prompted for it's road tier by QGIS. Colors are used to represent road quality. Green (or cyan) represents the highest tier road, this includes gravel roads, concrete, and paved roads, and stone/paved bridges. Yellow (blue) represents dirt roads, and Orange/Red (purple) represents mud roads, and is also used for wooden bridges. Cyan/blue/purple were used as analog colors in the snow regions, but using Green/Yellow/Red is preferrable. 

### Updating the map

The map tiles can be replaced by running the docker container (on x64 architecture) to download the latest maps, stitch them, and tile them (in both png and webp format). This docker command can be executed as:

```
sudo docker run --rm nouderp/foxhole-leaflet-maker > map.zip
```

Extract the tiles folder from the archive and replace the contents in the *Tiles* directory and rebuild the project
