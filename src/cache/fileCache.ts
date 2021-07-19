import * as fs from 'fs';
import * as pfs from 'fs/promises';
import * as path from 'path';

import { Cache } from '../interfaces';
import {
    readCompressedFile,
    utfToHex,
    writeCompressedFile,
} from '../utils/helpers';

export class FileCache implements Cache {
    static cachePathPrefix: string = 'node_modules/.cache';

    private cachePath: string;

    constructor(name: string) {
        this.cachePath = path.join(FileCache.cachePathPrefix, name);

        if (!fs.existsSync(FileCache.cachePathPrefix)) {
            fs.mkdirSync(FileCache.cachePathPrefix);
        }
        if (!fs.existsSync(this.cachePath)) {
            fs.mkdirSync(this.cachePath);
        }
    }

    private getCachePath(key: string): string {
        const encodedKey = `${utfToHex(key)}.json.gz`;
        return path.join(this.cachePath, encodedKey);
    }

    async get(key: string): Promise<any | undefined> {
        const keyPath = this.getCachePath(key);
        try {
            const buff = await readCompressedFile(keyPath);
            return JSON.parse(buff.toString());
        } catch {
            return undefined;
        }
    }

    async set(key: string, data: any): Promise<void> {
        const keyPath = this.getCachePath(key);
        await writeCompressedFile(data, keyPath);
    }

    flush(): void {
        fs.rmdirSync(this.cachePath, { recursive: true });
        fs.mkdirSync(this.cachePath);
    }
}
