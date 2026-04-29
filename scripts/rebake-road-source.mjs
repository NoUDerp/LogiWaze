import * as fs from 'node:fs';
import * as path from 'node:path';

// One-time migration: bake the post-1.63 corrections (7/10 world compression
// and the TheFingersHex / OarbreakerHex per-region shifts) into road_source.geojson
// so the QGIS-edited source file is the source of truth, and roads.js can
// be reduced to a plain mercator → game-world transform.
//
// Run once: `node scripts/rebake-road-source.mjs`
// Writes a backup at road_source.geojson.bak-pre-1.63

const SRC = 'road_source.geojson';
const BAK = 'road_source.geojson.bak-pre-1.63';

if (!fs.existsSync(BAK)) {
    fs.copyFileSync(SRC, BAK);
    console.log(`backup → ${BAK}`);
}

const geojson = JSON.parse(fs.readFileSync(SRC, 'utf-8'));

// Same constants as scripts/roads.js
const OLD_HEX_COUNT = 7;
const NEW_HEX_COUNT = 10;
const HALF_WORLD = 128;
const MERC_HALF = 20037500;
const MERC_PER_WORLD = MERC_HALF / HALF_WORLD; // ≈ 156542.97

const w = 256 / NEW_HEX_COUNT;
const h = w * Math.sqrt(3) / 2;

// Per-region world-coord deltas (same as roads.js)
const regionShift = {
    TheFingersHex: { dx: 0.75 * w, dy: 0.5 * h },     // (3,-1) → (3.75,-0.5)
    OarbreakerHex: { dx: -0.75 * w, dy: -1.5 * h },   // (-3,+1) → (-3.75,-0.5)
};

const SCALE = OLD_HEX_COUNT / NEW_HEX_COUNT; // 0.7

function transformCoord(coord, region) {
    const shift = regionShift[region];
    const dx_merc = shift ? shift.dx * MERC_PER_WORLD : 0;
    const dy_merc = shift ? shift.dy * MERC_PER_WORLD : 0;
    return [
        coord[0] * SCALE + dx_merc,
        coord[1] * SCALE + dy_merc,
    ];
}

function walk(geom, region) {
    if (!geom) return;
    if (geom.type === 'LineString' || geom.type === 'MultiPoint') {
        geom.coordinates = geom.coordinates.map(c => transformCoord(c, region));
    } else if (geom.type === 'MultiLineString' || geom.type === 'Polygon') {
        geom.coordinates = geom.coordinates.map(line =>
            line.map(c => transformCoord(c, region)));
    } else if (geom.type === 'MultiPolygon') {
        geom.coordinates = geom.coordinates.map(poly =>
            poly.map(line => line.map(c => transformCoord(c, region))));
    } else if (geom.type === 'Point') {
        geom.coordinates = transformCoord(geom.coordinates, region);
    } else if (geom.type === 'GeometryCollection') {
        geom.geometries.forEach(g => walk(g, region));
    }
}

let count = 0, fingersCount = 0, oarbreakerCount = 0;
for (const feature of geojson.features) {
    const region = feature.properties && feature.properties.region;
    if (region === 'TheFingersHex') fingersCount++;
    else if (region === 'OarbreakerHex') oarbreakerCount++;
    walk(feature.geometry, region);
    count++;
}

fs.writeFileSync(SRC, JSON.stringify(geojson, null, 0));
console.log(`rebaked ${count} features in ${SRC}`);
console.log(`  TheFingersHex: ${fingersCount}, OarbreakerHex: ${oarbreakerCount}`);
console.log(`  scale ×${SCALE}, mercator delta TheFingers: (${(regionShift.TheFingersHex.dx * MERC_PER_WORLD).toFixed(0)}, ${(regionShift.TheFingersHex.dy * MERC_PER_WORLD).toFixed(0)})`);
console.log(`  scale ×${SCALE}, mercator delta Oarbreaker: (${(regionShift.OarbreakerHex.dx * MERC_PER_WORLD).toFixed(0)}, ${(regionShift.OarbreakerHex.dy * MERC_PER_WORLD).toFixed(0)})`);
