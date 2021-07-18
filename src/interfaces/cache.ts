export enum CacheType {
    FILE = 'FILE',
    REDIS = 'REDIS',
}

export interface Cache {
    get(key: string): any | undefined;
    set(key: string, data: any): void;
}
