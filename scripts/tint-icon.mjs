// Generate Colonial/Warden tinted variants of a base map icon.
//
// Tint method: per-channel multiply by the team color (sRGB).
//   r' = r * (tint.r / 255)
// Verified against existing MapIconStorageFacility{,Colonial,Warden}.webp
// tints. Pure white pixels become exactly the tint color; black stays black.
//
// Tint values from clapfoot/warapi README "Map Icon Colours":
//   Colonial sRGB #516C4BFF
//   Warden   sRGB #245682FF
//
// Usage:
//   node scripts/tint-icon.mjs MapIcons/MapIconAircraftDepot.webp
// Writes MapIconAircraftDepotColonial.webp and MapIconAircraftDepotWarden.webp
// next to the input.

import sharp from 'sharp';
import * as path from 'node:path';

const TINTS = {
    Colonial: [0x51, 0x6C, 0x4B],
    Warden:   [0x24, 0x56, 0x82],
};

async function tintOne(input, suffix, [tr, tg, tb]) {
    const img = sharp(input).ensureAlpha();
    const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
    const out = Buffer.alloc(data.length);
    for (let i = 0; i < data.length; i += 4) {
        out[i]     = Math.round(data[i]     * tr / 255);
        out[i + 1] = Math.round(data[i + 1] * tg / 255);
        out[i + 2] = Math.round(data[i + 2] * tb / 255);
        out[i + 3] = data[i + 3];
    }
    const ext = path.extname(input);
    const base = input.slice(0, -ext.length);
    const dest = `${base}${suffix}${ext}`;
    await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
        .webp({ lossless: true })
        .toFile(dest);
    console.log(`  ${suffix.padEnd(8)} → ${dest}`);
}

async function main() {
    const inputs = process.argv.slice(2);
    if (!inputs.length) {
        console.error('usage: node scripts/tint-icon.mjs <base.webp> [<base2.webp> ...]');
        process.exit(1);
    }
    for (const input of inputs) {
        console.log(`tinting ${input}:`);
        for (const [name, rgb] of Object.entries(TINTS)) {
            await tintOne(input, name, rgb);
        }
    }
}

main().catch(e => { console.error(e); process.exit(1); });
