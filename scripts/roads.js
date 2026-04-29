import * as fs from 'fs';

const geojson = JSON.parse(fs.readFileSync('road_source.geojson', 'utf-8'));

console.log('Deleting empty geometry');
// #echo "delete from [roads] where [geometry] is null;

const features = geojson.features;
for (let i = features.length - 1; i >= 0; i--)
    if (features[i].geometry === undefined || features[i].geometry === "" || features[i].geometry.coordinates === undefined || features[i].geometry.coordinates.length === 0)
        features.splice(i, 1);

console.log("Updating road scaling");

// Mercator → game-world transform. road_source.geojson is in EPSG:3857
// (Web Mercator), already baked with the post-1.63 layout so this is a
// straight uniform scale + offset. Map width is 10 hex columns, so 256
// world units span 10 × (256/10) = 256 around the origin.
const HALF_WORLD = 128;
const MERC_HALF = 20037500;
const SCALE = HALF_WORLD / MERC_HALF;

const newFeatures = [];

for (const j of features) {
    // update roads set tier=3 where tier=4;
    // update roads set tier=1 where tier=0;
    // update roads set tier=(3-tier)+1;
    if (j.properties.tier === 4) j.properties.tier = 3;
    if (j.properties.tier === 0) j.properties.tier = 1;
    j.properties.tier = (3 - j.properties.tier) + 1;

    if (j.geometry.type === "MultiLineString")
        for (let i = 0; i < j.geometry.coordinates.length; i++)
            newFeatures.push({
                properties: j.properties,
                type: "Feature",
                geometry: {type: "LineString", coordinates: j.geometry.coordinates[i]}
            });
    else
        newFeatures.push(j);
}

for (const j of newFeatures) {
    for (let i = 0; i < j.geometry.coordinates.length; i++) {
        const v = j.geometry.coordinates[i];
        v[0] = Math.round((parseFloat(v[0]) * SCALE + HALF_WORLD) * 1000) / 1000;
        v[1] = Math.round((parseFloat(v[1]) * SCALE - HALF_WORLD) * 1000) / 1000;
    }
}

geojson.features = newFeatures;

fs.writeFileSync('Roads.json', JSON.stringify(geojson, null, 0));
