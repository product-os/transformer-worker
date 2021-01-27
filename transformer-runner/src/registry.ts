import * as Docker from 'dockerode';
import type { ActorCredentials, ArtefactContract } from "./types";
import Oras from './oras';

export default class Registry {
    public readonly registryUrl: string;
    private readonly docker: any;
    // @ts-ignore
    private readonly oras: any;
    
    constructor(registryHost: string, registryPort?: string) {
        this.registryUrl = registryPort ? `${registryHost}:${registryPort}` : registryHost;
        this.docker = new Docker();
        this.oras = new Oras(this.registryUrl);
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
        
        // TODO
    }
    
    public async pushArtifact(contract: ArtefactContract, _artefactPath: string) {
        const artefact = contract.data.artefact;
        console.log(`[WORKER] Pushing artefact ${artefact.name}`);
        // TODO
    }
}




