import * as Docker from 'dockerode';
import type { ActorCredentials, ArtefactContract } from "./types";
import spawn from "@ahmadnassri/spawn-promise";

export default class Registry {
    public readonly registryUrl: string;
    private readonly docker: any;
    // @ts-ignore
    private readonly oras: any;
    
    constructor(registryHost: string, registryPort?: string) {
        this.registryUrl = registryPort ? `${registryHost}:${registryPort}` : registryHost;
        this.docker = new Docker();
    }

    public async pullTransformerImage(transformerId: string, actorCredentials: ActorCredentials) {
        const transformerImageRef = `${this.registryUrl}/${transformerId}`;
        console.log(`[WORKER] Pulling transformer ${transformerImageRef}`);

        const auth = { username: actorCredentials.slug, password: actorCredentials.sessionToken, serveraddress: this.registryUrl };

        await new Promise((resolve, reject) => {
            this.docker.pull(transformerImageRef, { 'authconfig': auth }, (err: Error, stream: any) => {
                if(err){
                    console.error(err);
                    return reject(false);
                }
                this.docker.modem.followProgress(stream, onFinished, onProgress);

                function onFinished(_err: Error, _output: any) {
                    return resolve(true);
                }

                function onProgress(event: any) {
                    console.log(event.status);
                    if(event.hasOwnProperty('progress')){
                        console.log(event.progress);
                    }
                }
            });
        });

        return transformerImageRef;
    }

    public async pullArtifact(contract: ArtefactContract, _destiDir: string) {
        const artefact = contract.data.artefact;
        console.log(`[WORKER] Pulling artefact ${artefact.name}`);
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
            this.logErrorAndThrow(e);
        }
    }
    
    public async pushArtifact(contract: ArtefactContract, _artefactPath: string) {
        const artefact = contract.data.artefact;
        console.log(`[WORKER] Pushing artefact ${artefact.name}`);
        // TODO
    }
    
    private logErrorAndThrow = (e: any) => {
        if (e.spawnargs) {
            console.error(e.spawnargs);
            console.error(e.stderr.toString('utf8'));
        } else {
            console.error(e);
        }
        throw e;
    }
}




