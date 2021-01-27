import * as spawn from '@ahmadnassri/spawn-promise'

export default class Oras {
    constructor(private registryUrl: string) {}
    
    async pull(name: string) {
        try {
            const streams = await spawn(`oras`, [`pull`, `${this.registryUrl}/${name}:latest`]);
            const output = streams.stdout.toString('utf8');
            console.log(`* Oras output: ${output}`);
            const m = output.match(/Downloaded .* (.*)/);
            if (m[1]) {
                return m[1];
            } else {
                throw new Error('[ERROR] Could not determine what was pulled from the registry');
            }
        } catch (e) {
            this.reportErrorAndThrow(e);
        }
    }
    
    async push() {
        throw Error('[ERROR] Not implemented');
    }
    
    private reportErrorAndThrow = (e: any) => {
        if (e.spawnargs) {
            console.error(e.spawnargs);
            console.error((stream: any) => stream.toString('utf8'));
        } else {
            console.error(e);
        }
        throw e;
    }
}
