import * as ogr2ogr from 'ogr2ogr';
import * as spl from 'spl';
import * as fs from 'fs';

console.log('deleting temp.sqlite');
fs.rm('temp.sqlite', {}, null);

console.log('converting road_source.geojson to spatialite (for manipulation)');
new ogr2ogr('../road_source.geojson').format('SQLite').pipe('temp.sqlite');

console.log('opening temp.sqlite');
const db = await spl.open('temp.sqlite'); // Open or create a SpatiaLite database

// async function main() {
//     await db.exec('SELECT InitSpatialMetadata()'); // Initialize SpatiaLite
//
//     // Execute spatial queries
//     const result = await db.exec('SELECT AsText(MakePoint(1, 2))');
//     console.log(result[0].values[0][0]); // Output: POINT(1 2)
//
//     await db.close();
// }

// #echo "Starting build:"
//
// ## Set our build revision for the cache
// #sed -i "s/var build.*/var build=\"$(git rev-parse HEAD)\";/" index.html;
// #
// #echo "Generating road data:"
// #
// ## Run road generation
// #roads="$(mktemp).sqlite";
// #ogr2ogr "$roads" ./road_source.geojson -f SQLite -dsco SPATIALITE=YES -nln roads
// #
// #echo "delete from [roads] where [geometry] is null; update [roads] set geometry = ATM_Transform(ATM_Transform(geometry, ATM_CreateScale(128.0 / 20037500, 128.0 / 20037500)), ATM_CreateTranslate(128.0, -128.0)); update roads set tier=3 where tier=4; update roads set tier=1 where tier=0; update roads set tier=(3-tier)+1;" \
// #        | spatialite "$roads"
// #
// #rm -rf Roads.geojson
// #ogr2ogr Roads.geojson "$roads" -f GeoJSON -nlt LINESTRING -explodecollections -lco COORDINATE_PRECISION=3 roads
// #rm "$roads"
// #
// #node export_roads_svg.js > Roads.svg
// #
// #echo "Packing web assets:"
// #
// ## Pack our js
// #webpack --config webpack.config.js --mode production -o ./ .
// #
// ## Notate scripts with build revision for cache purposes
// #sed -i "s/src=\"FoxholeRouter.js[^\"]*\"/src=\"FoxholeRouter.js?$(md5sum FoxholeRouter.js | cut -d " " -f1)\"/g" index.html
// #sed -i "s/\"ServiceWorker.js[^\"]*\"/\"ServiceWorker.js?$(md5sum ServiceWorker.js | cut -d " " -f1)\"/g" index.html
// #
// #echo "Finished!"
//
//
// npx dotnet run --project MapStitcher MapStitcher/map.xml map.png && npx rimraf Tiles && npx mkdirp Tiles && npx dotnet run --project Tiler -input map.png -zoom 7 -filename "Tiles/{z}_{x}_{y}.webp"
//
// parcel build