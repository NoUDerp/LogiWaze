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
    'bug.svg',
];

// Directories copied wholesale into dist/. Tiles/ is the static map tile
// pyramid; MapIcons/ holds runtime-fetched icons used by HTML <img> tags
// (popup buttons, layer-toggle thumbnails) — runtime canvas rendering uses
// the data-url'd copies bundled via src/MapIcons.ts, but the HTML refs go
// through plain file URLs and need the folder present.
const dirs = ['Tiles', 'MapIcons'];

for (const name of files) {
    const src = resolve(root, name);
    if (!existsSync(src)) {
        console.warn(`skip (missing): ${name}`);
        continue;
    }
    cpSync(src, resolve(dist, name));
}

for (const dir of dirs) {
    const src = resolve(root, dir);
    const dst = resolve(dist, dir);
    if (existsSync(src)) {
        cpSync(src, dst, { recursive: true });
        console.log(`copied ${dir}/`);
    } else if (dir === 'Tiles') {
        console.warn('skip: Tiles/ not found — run "npm run map" first');
    } else {
        console.warn(`skip: ${dir}/ not found`);
    }
}

console.log('assets copied to dist/');
