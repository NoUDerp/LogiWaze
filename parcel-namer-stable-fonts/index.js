// Parcel namer that gives font bundles (woff2/ttf) the same filename as
// their source asset, with no content-hash. Everything else falls through
// to the next namer in .parcelrc (typically @parcel/namer-default).
//
// Reason: fonts rarely change and we mirror dist/ → project root for the
// "download zip and open index.html" UX. Hashed font names accumulate as
// orphans at the root and add noise to git diffs.

const { Namer } = require('@parcel/plugin');
const path = require('path');

module.exports = new Namer({
    name({ bundle }) {
        if (bundle.type !== 'woff2' && bundle.type !== 'ttf') return null;
        const main = bundle.getMainEntry();
        if (!main) return null;
        return path.basename(main.filePath);
    },
});
