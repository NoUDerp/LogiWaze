import { cpSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(root, 'dist');

mkdirSync(dist, { recursive: true });

const files = [
    'Italic.woff2',
    'Roman.woff2',
    'Celtic.woff2',
    'Renner.ttf',
    'Truck.webp',
    'Flatbed.webp',
    'HTD.webp',
    'WardenRoute.webp',
    'ColonialRoute.webp',
    'copy.svg',
    'Background.webp',
    'marker-icon-2x.png',
    'marker-icon.png',
    'marker-shadow.png',
    'ShortestRoute.webp',
    'download-file.svg',
    'ray-start-arrow.svg',
    'ray-end.svg',
    'font.svg',
];

for (const name of files) {
    const src = resolve(root, name);
    if (!existsSync(src)) {
        console.warn(`skip (missing): ${name}`);
        continue;
    }
    cpSync(src, resolve(dist, name));
}

const tilesSrc = resolve(root, 'Tiles');
const tilesDst = resolve(dist, 'Tiles');
if (existsSync(tilesSrc)) {
    cpSync(tilesSrc, tilesDst, { recursive: true });
    console.log(`copied Tiles/`);
} else {
    console.warn('skip: Tiles/ not found — run "npm run map" first');
}

console.log('assets copied to dist/');
