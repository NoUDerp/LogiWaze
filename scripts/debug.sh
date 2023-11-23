#!/usr/bin/env bash
echo "Starting build:"

# Set our build revision for the cache
sed -i "s/var build.*/var build=\"$(git rev-parse HEAD)\";/" index.html;

echo "Generating road data:"

# Run road generation
roads="$(mktemp).sqlite";
ogr2ogr "$roads" ./road_source.geojson -f SQLite -dsco SPATIALITE=YES -nln roads

# original scale = 20037508.3427892439067364
echo "delete from [roads] where [geometry] is null; update [roads] set geometry = ATM_Transform(ATM_Transform(geometry, ATM_CreateScale(128.0 / 20037500, 128.0 / 20037500)), ATM_CreateTranslate(128.0, -128.0)); update roads set tier=3 where tier=4; update roads set tier=1 where tier=0; update roads set tier=(3-tier)+1;" \
	| spatialite "$roads"

rm -rf Roads.geojson
ogr2ogr Roads.geojson "$roads" -f GeoJSON -nlt LINESTRING -explodecollections -lco COORDINATE_PRECISION=3 roads
rm "$roads"

# removed from debug
# node export_roads_svg.js > Roads.svg

echo "Packing web assets:"

# Pack our js
webpack --config webpack.config.js --mode development -o ./ .

# Notate scripts with build revision for cache purposes
sed -i "s/src=\"FoxholeRouter.js[^\"]*\"/src=\"FoxholeRouter.js?$(md5sum FoxholeRouter.js | cut -d " " -f1)\"/g" index.html
sed -i "s/\"ServiceWorker.js[^\"]*\"/\"ServiceWorker.js?$(md5sum ServiceWorker.js | cut -d " " -f1)\"/g" index.html

echo "Finished!"
