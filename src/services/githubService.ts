import axios from 'axios';
import { CacheFactory, CacheFactoryOpts } from '../factories';
import { Cache, CacheType } from '../interfaces';

export interface OrgInfo {
    etag: string;
    data: any;
}

export interface GitHubServiceOps {
    cacheType: CacheType;
}

export class GitHubService {
    static cacheName = 'github';

    private cache: Cache;

    constructor(opts: GitHubServiceOps) {
        const cacheFactoryOpts: CacheFactoryOpts = {
            type: opts.cacheType,
            name: GitHubService.cacheName,
        };
        this.cache = CacheFactory.getInstance(cacheFactoryOpts);
    }

    // getOrgInfo(): OrgInfo { }
}
