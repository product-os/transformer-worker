import { getSdk } from '@balena/jellyfish-client-sdk';
import {ActorCredentials, ArtefactContract} from "./types";

const STANDARD_ARTEFACT_TYPE: string = 'tgz';

export default class Jellyfish {
    static readonly LOGIN_RETRY_INTERVAL_SECS: number = 5;
    
    private readonly sdk: any;
    
    constructor(
        apiUrl: string, 
        apiPrefix: string,
    ) {
        this.sdk = getSdk({apiUrl, apiPrefix});
    }
    
    public async login(workerSlug: string, authToken: string) {
        const snooze = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

        console.log('[WORKER] Logging in to jellyfish...');
        while(true) {
            try{
                await this.sdk.setAuthToken(authToken);
                const user = await this.sdk.auth.whoami();
                if(user?.slug === workerSlug){
                    console.log('[WORKER] Logged in');
                    return user.id;
                }else{
                    console.error(`[WORKER] WARNING!! Unexpected user slug '${user?.slug}' received. Expected: '${workerSlug}'`);
                }
            }catch(e) {
                console.log(e.stack);
                await snooze(Jellyfish.LOGIN_RETRY_INTERVAL_SECS * 1000);
            }
        }
    }
    
    // TODO: Handle reconnection.
    
    public async getTaskStream(workerId: string) {
        const schema ={
            $$links: {
                'is owned by': {
                    type: 'object',
                    properties: {
                        id: {
                            const: workerId
                        }
                    }
                }
            },
            type: 'object',
            properties: {
                type: {
                    const: 'task@1.0.0'
                }
            }
        };

        return await this.sdk.stream(schema)
    }
    
    public async storeArtifactContract(contract: ArtefactContract) {
        // Set as draft, 
        // so as not to trigger other transformers before artifact ready
        contract.data.draft = true;
        const newContract = await this.sdk.card.create(contract) as ArtefactContract;
        return newContract.id;
    }
    
    public async updateArtifactContact(contractId: string, artifactType: string, artifactName: string) {
        // TODO:
        //  Why do we need to set artifact type and name here?
        await this.sdk.card.update(contractId, STANDARD_ARTEFACT_TYPE, [
            {
                op: 'replace',
                path: '/data/artefact/type',
                value: artifactType
            },
            {
                op: 'replace',
                path: '/data/artefact/name',
                value: artifactName
            },
            {
                op: 'replace',
                path: '/data/draft',
                value: false
            }
        ]);
    }
    
    public async getActorCredentials(actorId: string) {
         return {
            slug: await this.getActorSlugFromActorId(actorId),
            sessionToken: await this.getSessionTokenFromActorId(actorId),
        } as ActorCredentials;
    }
    
    private async getActorSlugFromActorId(actorId: string) {
        const actorCard = await this.sdk.card.get(actorId);
        return actorCard.slug;
    }

    private async getSessionTokenFromActorId(actorId: string) {
        const actorSessionCard = await this.sdk.card.create({
            type: 'session@1.0.0',
            data: {
                actor: actorId,
            },
        });
        return actorSessionCard.id;
    }
}
