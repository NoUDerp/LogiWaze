// Parcel namer that gives bundles of static-asset types (images, fonts)
// the same filename as their source — no content-hash. Other bundles
// (JS, HTML, etc.) fall through to the next namer in .parcelrc.
//
// Reason: we mirror dist/ → project root for the "download zip and open
// index.html" UX and for GitHub Pages serving from master root. Stable
// asset filenames let every build overwrite in place — no orphan
// accumulation, no version-specific URLs.
//
// JS continues to be hashed because workers split into multiple bundles
// (entry + chunks) and a stable name would collide between them. HTML
// continues to be hashed for the same reason on multi-page builds.

const { Namer } = require('@parcel/plugin');
const path = require('path');

const STABLE_TYPES = new Set([
    'woff2', 'woff', 'ttf', 'otf', 'eot',
    'png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'ico',
]);

module.exports = new Namer({
    name({ bundle }) {
        if (!STABLE_TYPES.has(bundle.type)) return null;
        const main = bundle.getMainEntry();
        if (!main) return null;
        return path.basename(main.filePath);
    },
});
