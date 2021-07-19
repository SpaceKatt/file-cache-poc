import { CacheFactory, CacheFactoryOpts } from './factories';
import { CacheType } from './interfaces';

async function main() {
    const cacheFactoryOpts: CacheFactoryOpts = {
        type: CacheType.FILE,
        name: 'github',
    };
    const cache = CacheFactory.getInstance(cacheFactoryOpts);

    const sample_key = 'reeee';
    const sample = { ree: 'cola' };

    await cache.set(sample_key, sample);

    const ree = await cache.get(sample_key);
    console.log(ree);
}

main();
