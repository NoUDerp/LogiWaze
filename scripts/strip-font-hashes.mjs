// Parcel content-hashes every output filename for cache-busting. Fonts
// rarely change and the hashed names just clutter the project root after
// `deploy-to-root.mjs` mirrors dist/. Strip the hash from font outputs
// (.woff2, .ttf) and rewrite the references in dist/index.html so the
// stable name flows through to deployment.
//
// Runs before deploy-to-root so the root only ever receives unhashed
// font files.

import { readdirSync, renameSync, readFileSync, writeFileSync, existsSync, statSync, unlinkSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(root, 'dist');
const indexHtml = resolve(dist, 'index.html');

const FONT_HASH_RE = /^([A-Za-z][\w-]+)\.([a-f0-9]{8})\.(woff2|ttf)$/;

let html = readFileSync(indexHtml, 'utf8');
const renames = [];

for (const name of readdirSync(dist)) {
    const m = name.match(FONT_HASH_RE);
    if (!m) continue;
    const [, base, hash, ext] = m;
    const stable = `${base}.${ext}`;
    const stablePath = resolve(dist, stable);
    const hashedPath = resolve(dist, name);
    // copy-assets.mjs may have already placed the source-named font here;
    // the Parcel-built one wins.
    if (existsSync(stablePath)) unlinkSync(stablePath);
    renameSync(hashedPath, stablePath);
    html = html.split(name).join(stable);
    renames.push(`${name} → ${stable}`);
}

writeFileSync(indexHtml, html);
console.log(`strip-font-hashes: ${renames.length} font(s) renamed`);
for (const r of renames) console.log(`  ${r}`);
