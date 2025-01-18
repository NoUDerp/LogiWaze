# LogiWaze
by Derp

## Demonstrations
LogiWaze is a leaflet-based [Foxhole](https://www.foxholegame.com/) logistics router, available at [https://www.logiwaze.com/]

![](https://github.com/NoUDerp/logiwaze/blob/master/readme/Screenshot.webp)

Alternatively you can experience LogiWaze by opening the index.html from a downloaded/cloned repository

The original prototyping for this idea was done by Hayden of: [https://foxholestats.com/](https://foxholestats.com/)

## Building

Pre-requisites: *nodejs, npm*

* download or clone the repository
```
git clone https://github.com/NoUDerp/LogiWaze
```

```
cd LogiWaze
```

* install the required packages
```
npm install
```

* build the project
```
# full map build only needs to be run when the map image has changed
npm run map

# bundle the project into a portable index.html using Parcel 2 
npm run build
```
### Updating towns

Execute the town halls script when all regions are available (if regions are offline their towns will not be provided in the API and not added), which requires pre-requisite *jq*
```
./export_major_locations > towns.json
```

### Building the map
The map can be updated by placing the new map hex images into the MapHexes/ directory and running the map build. These images are taken directly from the game assets or directly from a map mod assets (as .tga) and converted to .png
```
npm run map
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

- There are 3 road tiers. After adding each road segment you will be prompted for it's road tier by QGIS. Colors are used to represent road quality. There are 3 tiers of road. When creating paths, fill in the Region value matching the hex ID/name, and fill in a road tier between 1 and 3. There is a fourth tier *0* used for off-road bridges (intended to mark the bridge but indicate it was not a normal speed). This fourth tier is corrected into one of the regular 3 during building.