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
