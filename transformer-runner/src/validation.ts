import type { OutputManifest } from'./types';
import * as fs from 'fs';
import * as path from "path";

export async function validateOutputManifest(m: OutputManifest, outputDir: string) {
    const message = 'Output manifest validation error: ';
    if(!Array.isArray(m.results)) {
        throw new Error(`${message} missing results array`);
    }
    
    if(m.results.length < 1) {
        throw new Error(`${message} empty results array`);
    }

    for (const result of m.results) {
        if(!result.contract || !result.contract.data) {
            throw new Error(`${message} missing result contract`);
        }
        
        // Note: artifactPath can be empty
        if(result.artifactPath) {
            try {
                await fs.promises.access(path.join(outputDir, result.artifactPath), fs.constants.R_OK);
            } catch(e) {
                throw new Error(`${message} artifact path ${result.artifactPath} is not readable`);
            }
        }
    }
}
