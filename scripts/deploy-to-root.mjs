// Mirror dist/ files into the project root so a fresh `git clone` /
// GitHub source ZIP can open ./index.html directly with no build step,
// and so GitHub Pages serving from master root sees the bundled output.
//
// Subdirectories named in SKIP_DIRS are NOT copied — Tiles/ and MapIcons/
// already live at the project root and are mirrored into dist/ by the
// assets script, so copying them back would just duplicate work. Other
// subdirs (e.g. Parcel's `up_/manifest.webmanifest` PWA output) DO need
// to be copied — they're new content that doesn't exist at root yet.
//
// Old hashed assets at the root (e.g. Italic.OLD.woff2 from a previous
// build) are left in place. They're harmless but accumulate; clean them
// manually with `git clean -i` when desired.

import { cpSync, readdirSync, statSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(root, 'dist');

const SKIP_DIRS = new Set(['Tiles', 'MapIcons']);

let files = 0, dirs = 0, skipped = 0;
for (const name of readdirSync(dist)) {
    const src = resolve(dist, name);
    const isDir = statSync(src).isDirectory();
    if (isDir && SKIP_DIRS.has(name)) { skipped++; continue; }
    cpSync(src, resolve(root, name), { force: true, recursive: isDir });
    if (isDir) dirs++; else files++;
}

console.log(`deploy-to-root: ${files} files + ${dirs} dirs copied, ${skipped} dirs skipped (already mirrored)`);
