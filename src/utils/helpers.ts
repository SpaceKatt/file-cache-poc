import axios, { AxiosError, AxiosResponse } from 'axios';
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

/**
 * Compresses data and writes it to a file.
 *
 * @param data Data to compress and write
 * @param outPath path to write compressed data to
 */
export const writeCompressedFile = async (
    // eslint-disable-next-line
    data: any,
    outPath: string,
): Promise<void> => {
    const gzip = createGzip();
    const source = Readable.from(JSON.stringify(data));
    const sink = createWriteStream(outPath);
    await pipe(source, gzip, sink);
};

const do_unzip = promisify(unzip);

/**
 * Reads compressed data from a file.
 *
 * @param inPath path to read compressed data from
 * @returns uncompressed data
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const readCompressedFile = async (inPath: string): Promise<any> => {
    await pfs.access(inPath);
    const fh = await pfs.open(inPath, 'r');
    const data = await fh.readFile();
    const result = await do_unzip(data);
    return JSON.parse(result.toString());
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getRequest = async (
    path: string,
    headers: any,
): Promise<AxiosResponse | undefined> => {
    const config = headers ? { headers: { ...headers } } : undefined;
    return await axios
        .get(path, config)
        .then((response: AxiosResponse) => {
            return response;
        })
        .catch((reason: AxiosError) => {
            if (reason.response!.status === 304) {
                return undefined;
            }

            throw new Error('No valid response from GET request');
        });
};
