import * as fs from 'fs';

const geojson = JSON.parse(fs.readFileSync('road_source.geojson', 'utf-8'));

console.log('Deleting empty geometry');
// #echo "delete from [roads] where [geometry] is null;

const features = geojson.features;
for (let i = features.length - 1; i >= 0; i--)
    if (features[i].geometry === undefined || features[i].geometry === "" || features[i].geometry.coordinates === undefined || features[i].geometry.coordinates.length === 0)
        features.splice(i, 1);

console.log("Updating road scaling");

// road_source.geojson was traced when the world was 7 hexes wide. The map is
// now 10 hexes wide (post-1.63), so all roads compress by 7/10 around the
// world center (128, -128) in svg-world coords.
const OLD_HEX_COUNT = 7;
const NEW_HEX_COUNT = 10;
const HALF_WORLD = 128;
const SCALE = HALF_WORLD * OLD_HEX_COUNT / NEW_HEX_COUNT / 20037500;

// Per-hex translation for hexes whose centers moved in 1.63 (beyond the
// uniform grid scale). Values are in svg-world units (post-scale).
// width_new = 256/10, height_new = width_new * sqrt(3)/2
const w = 256 / NEW_HEX_COUNT;
const h = w * Math.sqrt(3) / 2;
const regionShift = {
    // (3, -1) → (3.75, -0.5): Δcoef = (+0.75 width, +0.5 height)
    TheFingersHex: { dx: 0.75 * w, dy: 0.5 * h },
    // (-3, +1) → (-3.75, -0.5): Δcoef = (-0.75 width, -1.5 height)
    OarbreakerHex: { dx: -0.75 * w, dy: -1.5 * h },
};

const newFeatures = [];

for (const j of features) {
    // update roads set tier=3 where tier=4;
    // update roads set tier=1 where tier=0;
    // update roads set tier=(3-tier)+1;" \
    if (j.properties.tier === 4) j.properties.tier = 3;
    if (j.properties.tier === 0) j.properties.tier = 1;
    j.properties.tier = (3 - j.properties.tier) + 1;

    // convert to line string
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
    const shift = regionShift[j.properties.region];
    const dx = shift ? shift.dx : 0;
    const dy = shift ? shift.dy : 0;

    for (let i = 0; i < j.geometry.coordinates.length; i++) {
        const v = j.geometry.coordinates[i];
        v[0] = Math.round((parseFloat(v[0]) * SCALE + HALF_WORLD + dx) * 1000) / 1000;
        v[1] = Math.round((parseFloat(v[1]) * SCALE - HALF_WORLD + dy) * 1000) / 1000;
    }
}

geojson.features = newFeatures;

fs.writeFileSync('Roads.json', JSON.stringify(geojson, null, 0));
