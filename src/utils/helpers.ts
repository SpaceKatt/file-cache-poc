import { createWriteStream } from 'fs';
import * as pfs from 'fs/promises';
import { pipeline, Readable } from 'stream';
import { promisify } from 'util';
import { createGzip, unzip } from 'zlib';

export const utfToHex = (s: string): string => {
    return Buffer.from(s, 'utf-8').toString('hex');
};

export const hexToUtf = (s: string): string => {
    return Buffer.from(s, 'hex').toString('utf-8');
};

const pipe = promisify(pipeline);

export const writeCompressedFile = async (
    // eslint-disable-next-line
    data: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    outPath: string,
): Promise<void> => {
    const gzip = createGzip();
    const source = Readable.from(JSON.stringify(data));
    const sink = createWriteStream(outPath);
    await pipe(source, gzip, sink);
};

const do_unzip = promisify(unzip);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const readCompressedFile = async (inPath: string): Promise<any> => {
    await pfs.access(inPath);
    const fh = await pfs.open(inPath, 'r');
    const data = await fh.readFile();
    const result = await do_unzip(data);
    return result;
};
