// Mirror dist/ files (top level only) into the project root so a fresh
// `git clone` / GitHub source ZIP can open ./index.html directly with no
// build step. The non-programmer UX: download the repo, open index.html.
//
// Subdirectories under dist/ (Tiles/, MapIcons/) are skipped — they're
// already mirrors of the same-named directories at the project root that
// the assets script populated, so re-copying would just duplicate work.
//
// Old hashed assets at the root (e.g. Italic.OLD.woff2 from a previous
// build) are left in place. They're harmless but accumulate; clean them
// manually with `git clean -i` when desired.

import { cpSync, readdirSync, statSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(root, 'dist');

let copied = 0, skipped = 0;
for (const name of readdirSync(dist)) {
    const src = resolve(dist, name);
    if (statSync(src).isDirectory()) { skipped++; continue; }
    cpSync(src, resolve(root, name), { force: true });
    copied++;
}

console.log(`deploy-to-root: ${copied} files copied, ${skipped} dirs skipped (already mirrored)`);
