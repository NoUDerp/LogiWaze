#!/usr/bin/env bash
echo "Starting build:"

# Set our build revision for the cache
sed -i "s/var build.*/var build=\"$(git rev-parse HEAD)\";/" index.html;

echo "Generating road data:"

# Run road generation
roads="$(mktemp).sqlite";
ogr2ogr "$roads" ./Mapped/Unified.geojson -f SQLite -dsco SPATIALITE=YES -nln roads
ogr2ogr "$roads" ./hexes.geojson -f SQLite -dsco SPATIALITE=YES -nln hexes -append

echo "alter table roads add column region text; create table temp as select intersection(a.geometry, b.geometry) [geometry], a.rowid [rowid], null region, a.[tier] [tier] from [roads] a join [hexes] b on st_intersects(a.geometry, b.geometry) where not intersection(a.geometry, b.geometry) is null; drop table roads; create table roads as select [geometry], [region], [tier] from temp where not [geometry] is null and st_npoints(geometry)>0; create table region_temp as select a.rowid rowid, length(intersection(a.geometry, b.geometry)) length, b.[region] [region], a.[tier] [tier] from [roads] a inner join [hexes] b on intersects(a.geometry, b.geometry); update [roads] set [region]=(select [region] from [region_temp] where [region_temp].rowid=[roads].rowid order by [region_temp].length desc limit 1); update [roads] set geometry = ATM_Transform(ATM_Transform(geometry, ATM_CreateScale(128.0 / 20037508.3427892439067364, 128.0 / 20037508.3427892439067364)), ATM_CreateTranslate(128.0, -128.0)); update [roads] set [tier] = 2-((cast([tier] as integer)-1)%3)+1;" \
    | spatialite "$roads"

rm -rf Roads.geojson
ogr2ogr Roads.geojson "$roads" -f GeoJSON -nlt LINESTRING -explodecollections -lco COORDINATE_PRECISION=3 roads
rm "$roads"

node export_roads_svg.js > Roads.svg

echo "Packing web assets:"

# Pack our js
webpack --config webpack.config.js --mode development -o ./ .

# Notate scripts with build revision for cache purposes
sed -i "s/src=\"FoxholeRouter.js[^\"]*\"/src=\"FoxholeRouter.js?$(md5sum FoxholeRouter.js | cut -d " " -f1)\"/g" index.html
sed -i "s/\"ServiceWorker.js[^\"]*\"/\"ServiceWorker.js?$(md5sum ServiceWorker.js | cut -d " " -f1)\"/g" index.html

echo "Finished!"
