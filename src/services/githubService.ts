import { Cache, CacheType } from '../interfaces';
import { CacheFactory, CacheFactoryOpts } from '../factories';
import { getRequest } from '../utils/helpers';

// import axios from 'axios';

export interface OrgInfo {
    name: string;
    numberOfRepos: number;
}

export interface GitHubCachePayload {
    etag: string;
    // eslint-disable-next-line
    data: any;
}

export interface GitHubServiceOps {
    cacheType: CacheType;
}

export class GitHubService {
    static readonly apiHost = 'https://api.github.com';
    static readonly cacheName = 'github';
    static readonly defaultHeaders = {
        Accept: 'application/vnd.github.v3+json',
    };
    static readonly orgRoute = '/orgs';

    private cache: Cache;

    constructor(opts: GitHubServiceOps) {
        const cacheFactoryOpts: CacheFactoryOpts = {
            type: opts.cacheType,
            name: GitHubService.cacheName,
        };
        this.cache = CacheFactory.getInstance(cacheFactoryOpts);
    }

    private getOrgPath(org: string): string {
        return `${GitHubService.apiHost}${GitHubService.orgRoute}/${org}`;
    }

    async getOrgInfo(org: string): Promise<OrgInfo> {
        const orgPath = this.getOrgPath(org);
        // add etag here for caching
        const cachedOrg = (await this.cache.get(orgPath)) as GitHubCachePayload;

        const cachedHeaders = cachedOrg
            ? { 'If-None-Match': cachedOrg.etag }
            : {};

        const orgData = await getRequest(orgPath, {
            ...cachedHeaders,
            ...GitHubService.defaultHeaders,
        });

        // If undefined, then 304 indicates no update
        if (!orgData) {
            console.log('used cache');
            return cachedOrg.data;
        }
        console.log('did NOT used cache');

        const orgInfo: OrgInfo = {
            name: org,
            numberOfRepos: orgData.data.public_repos,
        };

        // don't await cache set
        this.cache.set(orgPath, { etag: orgData.headers.etag, data: orgInfo });

        return orgInfo;
    }
}
