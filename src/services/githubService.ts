import { Cache, CacheType } from '../interfaces';
import { CacheFactory, CacheFactoryOpts } from '../factories';
import { getRequest } from '../utils/helpers';

import { AxiosResponse } from 'axios';

export interface OrgInfo {
    name: string;
    numberOfRepos: number;
}

export interface OrgRepo {
    name: string;
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
    static readonly maxRepoPerPage = 100;

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

        // If undefined, then 304 indicates no update at service (use cached)
        if (!response) {
            console.log('used cache');
            return cachedData.data;
        }
        console.log('did NOT use cache');

        const mappedData = dataMap(response);

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

    private getOrgRepoPaths(org: string, orgInfo: OrgInfo): string[] {
        const numPages = Math.ceil(
            orgInfo.numberOfRepos / GitHubService.maxRepoPerPage,
        );

        const orgRepoPaths = [];

        for (let i = 1; i <= numPages; i++) {
            const prefix = `${GitHubService.apiHost}${GitHubService.orgRoute}/${org}`;
            const qs = `per_page=${GitHubService.maxRepoPerPage}&page=${i}`;
            orgRepoPaths.push(`${prefix}/repos?${qs}`);
        }
        console.log(orgRepoPaths);

        return orgRepoPaths;
    }

    async getOrgRepos(org: string): Promise<OrgRepo[]> {
        const orgInfo = await this.getOrgInfo(org);
        const repoPaths = this.getOrgRepoPaths(org, orgInfo);
        const mapRepoData = (resp: AxiosResponse): OrgRepo => {
            return resp.data.map((x: any) => {
                return { name: x.name };
            });
        };

        const processPath = async (path: string) => {
            return this.getPathWithCache(path, mapRepoData);
        };

        const orgRepos = Promise.all(repoPaths.map(processPath));
        return (await orgRepos).reduce(
            (accumulator, value) => accumulator.concat(value),
            [],
        );
    }
}
