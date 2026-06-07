const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const cachePath = path.resolve(__dirname, '../data/cache.json');

// Simple in-process mutex queue to serialize cache access and avoid concurrent writes
let writeLock = Promise.resolve();

const beforeCacheAccess = async (cacheContext) => {
    // read file if exists, else create
    try {
        if (fs.existsSync(cachePath)) {
            const data = await readFile(cachePath, 'utf-8');
            cacheContext.tokenCache.deserialize(data);
        } else {
            // initialize file with empty cache
            const serialized = cacheContext.tokenCache.serialize();
            await writeFile(cachePath, serialized, 'utf-8');
        }
    } catch (err) {
        console.log('beforeCacheAccess error', err);
        // allow application to continue; token cache will be empty
    }
};

const afterCacheAccess = async (cacheContext) => {
    if (cacheContext.cacheHasChanged) {
        // serialize writes using the writeLock promise chain
        const serialized = cacheContext.tokenCache.serialize();
        writeLock = writeLock.then(() => writeFile(cachePath, serialized, 'utf-8').catch(err => console.log('cache write error', err)));
        await writeLock;
    }
};

module.exports = {
    beforeCacheAccess,
    afterCacheAccess,
};