import { Cache, CacheType } from '../interfaces';
import { CacheFactory, CacheFactoryOpts } from '../factories';
import { getRequest } from '../utils/helpers';

import { AxiosResponse } from 'axios';

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

    private async getPathWithCache(
        path: string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        dataMap: (r: AxiosResponse) => any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ): Promise<any> {
        const cachedData = (await this.cache.get(path)) as GitHubCachePayload;

        const cachedHeaders = cachedData
            ? { 'If-None-Match': cachedData.etag }
            : {};

        const response = await getRequest(path, {
            ...cachedHeaders,
            ...GitHubService.defaultHeaders,
        });

        // If undefined, then 304 indicates no update
        if (!response) {
            console.log('used cache');
            return cachedData.data;
        }
        console.log('did NOT used cache');

        const mappedData = dataMap(response);
        console.log(mappedData);

        // don't await cache set
        this.cache.set(path, {
            etag: response.headers.etag,
            data: mappedData,
        });

        return mappedData;
    }

    private getOrgPath(org: string): string {
        return `${GitHubService.apiHost}${GitHubService.orgRoute}/${org}`;
    }

    async getOrgInfo(org: string): Promise<OrgInfo> {
        const orgPath = this.getOrgPath(org);
        const mapOrgInfo = (resp: AxiosResponse): OrgInfo => {
            return {
                name: resp.data.name,
                numberOfRepos: resp.data.public_repos,
            };
        };

        const orgInfo = await this.getPathWithCache(orgPath, mapOrgInfo);
        return orgInfo;
    }
}
