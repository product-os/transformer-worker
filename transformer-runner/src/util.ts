import * as fs from 'fs';
import { F_OK } from 'constants';

export const pathExists = async (path: string) => {
    try {
        await fs.promises.access(path, F_OK);
        return true;
    } catch {
        return false;
    }
}

export function streamToPromise(stream: NodeJS.ReadableStream): Promise<string> {
    return new Promise((resolve, reject) => {
        let buf = '';
        stream.on('data', (d) => (buf += d.toString()));
        stream.on('end', () => resolve(buf));
        stream.on('error', reject);
    });
}
