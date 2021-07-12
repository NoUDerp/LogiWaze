# foxhole-router

## Demonstrations
LogiWaze is a leaflet-based [Foxhole](https://www.foxholegame.com/) logistics router, available at [https://www.logiwaze.com/]

![](https://github.com/NoUDerp/logiwaze/blob/master/Screenshot.webp)

Alternatively you can experience LogiWaze by opening the index.html from a downloaded/cloned repository

The original prototyping for this idea was done by Hayden of: [https://foxholestats.com/](https://foxholestats.com/)

## Discussion (via FoxholeStats.com discord)
[https://discord.gg/dnegnws](https://discord.gg/dnegnws)

## Building

Pre-requisites: nodejs, webpack, spatialite, gdal-bin (gdal tools, specifically ogr2ogr)

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

### Updating the map

The map tiles can be replaced by running the docker container (on x64 architecture) to download the latest maps, stitch them, and tile them (in both png and webp format). This docker command can be executed as:

```
sudo docker run --rm nouderp/foxhole-leaflet-maker > map.zip
```

Extract the tiles folder from the archive and replace the contents in the *Tiles* directory and rebuild the project
