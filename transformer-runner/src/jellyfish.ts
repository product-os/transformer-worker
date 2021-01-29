import { getSdk } from '@balena/jellyfish-client-sdk';
import * as mockSdk from './mock-jellyfish-client-sdk';
import { ActorCredentials, ArtefactContract, TaskContract } from "./types";

const STANDARD_ARTEFACT_TYPE: string = 'tgz';
const MOCK_JF_SDK = process.env.JF_API_PREFIX || true;

export default class Jellyfish {
    static readonly LOGIN_RETRY_INTERVAL_SECS: number = 5;
    
    private readonly sdk: any;
    
    constructor(
        apiUrl: string, 
        apiPrefix: string,
    ) {
        this.sdk = MOCK_JF_SDK ? 
            mockSdk.getSdk({apiUrl, apiPrefix}) :
            getSdk({apiUrl, apiPrefix});
    }
    
    public async listenForTasks(taskHandler: (task: TaskContract) => void) {
        const user = await this.sdk.auth.whoami();

        // Get task stream, and await tasks
        const taskStream = await this.getTaskStream(user.id);
        taskStream.on('update', taskHandler);

        taskStream.on('streamError', (error: Error) => {
            console.error(error);
        })
    }
    
    public async login(workerSlug: string, authToken: string) {
        // TODO:
        //  - retry
        //  - reconnection
        
        await this.sdk.setAuthToken(authToken);
        const user = await this.sdk.auth.whoami();
        if(user?.slug === workerSlug){
            console.log(`[WORKER] Logged in to JF, id ${user.id}`);
            return user.id;
        }else{
            throw new Error(`Unexpected user slug '${user?.slug}' received. Expected: '${workerSlug}'`);
        }
    }
    
    private async getTaskStream(workerId: string) {
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
    
    public async storeArtefactContract(contract: ArtefactContract) {
        // Set as draft, 
        // so as not to trigger other transformers before artifact ready
        contract.data.artefact_ready = true;
        const newContract = await this.sdk.card.create(contract) as ArtefactContract;
        return newContract.id;
    }

    // TODO:
    //  Why do we need to set artifact type and name here?
    public async updateArtefactContract(contractId: string) { //}, artefactType: string, artefactName: string) {
        await this.sdk.card.update(contractId, STANDARD_ARTEFACT_TYPE, [
            /*
            {
                op: 'replace',
                path: '/data/artefact/type',
                value: artefactType
            },
            {
                op: 'replace',
                path: '/data/artefact/name',
                value: artefactName
            },
             */
            {
                op: 'replace',
                path: '/data/artifact_ready',
                value: true
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
