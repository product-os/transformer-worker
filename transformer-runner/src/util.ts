import * as fs from 'fs';
import { F_OK } from 'constants';
import { Formula } from "./types";
const jellyscript = require('@balena/jellyfish-jellyscript');


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

export function evaluateFormulaOrValue(formulaOrValue: Formula | any, context: any) {
    if(formulaOrValue.$$formula) {
        try {
            const result = jellyscript.evaluate(formulaOrValue.$$formula, {
                context
            });
            return result?.value;
        } 
        catch(e) {
            if(e.message) {
                e.message = `Formula eval error: ${e.message}`;
            }
            throw e;
        }
    } else {
        return formulaOrValue;
    }
}
