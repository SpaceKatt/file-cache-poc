import * as pfs from 'fs/promises';

import { createGzip, gzip, unzip } from 'zlib';
import { promisify } from 'util';
import { pipeline, Readable } from 'stream';
import { createWriteStream } from 'fs';

export const utfToHex = (s: string): string => {
    return Buffer.from(s, 'utf-8').toString('hex');
};

export const hexToUtf = (s: string): string => {
    return Buffer.from(s, 'hex').toString('utf-8');
};

const pipe = promisify(pipeline);

export const writeCompressedFile = async (
    data: any,
    outPath: string,
): Promise<void> => {
    const gzip = createGzip();
    const source = Readable.from(JSON.stringify(data));
    const sink = createWriteStream(outPath);
    await pipe(source, gzip, sink);
};

const do_unzip = promisify(unzip);

export const readCompressedFile = async (inPath: string): Promise<any> => {
    await pfs.access(inPath);
    const fh = await pfs.open(inPath, 'r');
    const data = await fh.readFile();
    const result = await do_unzip(data);
    return result;
};
