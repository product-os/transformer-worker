import * as Docker from 'dockerode';

export default class TransformerRegistry {
    private readonly registryUrl: string;
    private readonly docker: any;
    
    constructor(registryUrl: string, registryPort?: string) {
        this.registryUrl = registryPort ? `${registryUrl}:${registryPort}` : registryUrl;
        this.docker = new Docker();
    }

    public async pullTransformerImage(transformerId: string, actorSlug: string, sessionToken: string) {
        const transformerImageRef = `${this.registryUrl}/${transformerId}`;
        console.log(`[WORKER] Pulling transformer ${transformerImageRef}`);

        const auth = { username: actorSlug, password: sessionToken, serveraddress: this.registryUrl };

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
}




