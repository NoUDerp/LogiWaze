import * as fs from 'fs';

const geojson = JSON.parse(fs.readFileSync('road_source.geojson', 'utf-8'));

console.log('Deleting empty geometry');
// #echo "delete from [roads] where [geometry] is null; 

const features = geojson.features;
for (let i = features.length - 1; i >= 0; i--)
    if (features[i].geometry === undefined || features[i].geometry === "" || features[i].geometry.coordinates === undefined || features[i].geometry.coordinates.length === 0)
        features.splice(i, 1);

console.log("Updating road scaling");

for (const j of features) {
    // update roads set tier=3 where tier=4; 
    // update roads set tier=1 where tier=0; 
    // update roads set tier=(3-tier)+1;" \
    if (j.properties.tier === 4) j.properties.tier = 3;
    if (j.properties.tier === 0) j.properties.tier = 1;
    j.properties.tier = (3 - j.properties.tier) + 1;

    // update [roads] set geometry = ATM_Transform(ATM_Transform(geometry, ATM_CreateScale(128.0 / 20037500, 128.0 / 20037500)), ATM_CreateTranslate(128.0, -128.0)); 
    // #ogr2ogr Roads.geojson "$roads" -f GeoJSON -nlt LINESTRING -explodecollections -lco COORDINATE_PRECISION=3 roads
    for (let i = 0; i < j.geometry.coordinates.length; i++)
        for (let k = 0; k < j.geometry.coordinates[i].length; k++) {
            const v = j.geometry.coordinates[i][k];
            v[0] = Math.round((parseFloat(v[0]) * 128 / 20037500 + 128) * 1000) / 1000;
            v[1] = Math.round((parseFloat(v[1]) * 128 / 20037500 - 128) * 1000) / 1000;
        }
}

fs.writeFileSync('Roads.json', JSON.stringify(geojson, null, 0));