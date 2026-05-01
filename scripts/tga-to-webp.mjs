// Convert uncompressed 32bpp TGA (image type 2, top-left origin) → lossless webp.
// Sharp/libvips doesn't include TGA support, so this parses the header by hand.
// Used to pull warapi map icons (TGA format) into the project's webp pipeline.
//
// Usage:
//   node scripts/tga-to-webp.mjs <input.tga> <output.webp>

import sharp from 'sharp';
import * as fs from 'node:fs';

async function tgaToWebp(input, output) {
    const buf = fs.readFileSync(input);

    // TGA header (18 bytes)
    const idLen        = buf[0];
    const colorMapType = buf[1];
    const imageType    = buf[2];
    const width        = buf.readUInt16LE(12);
    const height       = buf.readUInt16LE(14);
    const bpp          = buf[16];
    const descriptor   = buf[17];
    const topLeftOrigin = (descriptor & 0x20) !== 0;

    if (imageType !== 2) throw new Error(`unsupported TGA image type ${imageType} (only uncompressed truecolor type 2 supported)`);
    if (colorMapType !== 0) throw new Error(`unsupported TGA color map type ${colorMapType}`);
    if (bpp !== 32) throw new Error(`unsupported TGA bpp ${bpp} (only 32-bit BGRA supported)`);

    const pixelOffset = 18 + idLen;
    const pixelCount = width * height;
    const expectedSize = pixelCount * 4;
    const pixels = buf.subarray(pixelOffset, pixelOffset + expectedSize);
    if (pixels.length !== expectedSize) throw new Error(`pixel data size mismatch: ${pixels.length} vs ${expectedSize}`);

    // Swap B↔R: TGA stores BGRA, sharp wants RGBA.
    const rgba = Buffer.alloc(expectedSize);
    for (let i = 0; i < expectedSize; i += 4) {
        rgba[i]     = pixels[i + 2]; // R ← B
        rgba[i + 1] = pixels[i + 1]; // G
        rgba[i + 2] = pixels[i];     // B ← R
        rgba[i + 3] = pixels[i + 3]; // A
    }

    // Y-flip if origin is bottom-left (TGA default).
    let final = rgba;
    if (!topLeftOrigin) {
        final = Buffer.alloc(expectedSize);
        const rowBytes = width * 4;
        for (let y = 0; y < height; y++) {
            rgba.copy(final, y * rowBytes, (height - 1 - y) * rowBytes, (height - y) * rowBytes);
        }
    }

    const info = await sharp(final, { raw: { width, height, channels: 4 } })
        .webp({ lossless: true })
        .toFile(output);
    console.log(`  ${input} → ${output} (${info.width}x${info.height}, ${info.size}B)`);
}

const [, , input, output] = process.argv;
if (!input || !output) {
    console.error('usage: node scripts/tga-to-webp.mjs <input.tga> <output.webp>');
    process.exit(1);
}
tgaToWebp(input, output).catch(e => { console.error(e); process.exit(1); });
