import { getSdk } from '@balena/jellyfish-client-sdk';

export default class Jellyfish {
    static readonly LOGIN_RETRY_INTERVAL_SECS: number = 5;
    
    private readonly sdk: any;
    
    constructor(
        apiUrl: string, 
        apiPrefix: string, 
        private readonly authToken: string, 
        private readonly workerSlug: string
    ) {
        this.sdk = getSdk({apiUrl, apiPrefix});
    }
    
    public async login() {
        const snooze = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

        console.log('[WORKER] Logging in to jellyfish...');
        while(true) {
            try{
                await this.sdk.setAuthToken(this.authToken);
                const user = await this.sdk.auth.whoami();
                if(user?.slug === this.authToken){
                    console.log('[WORKER] Logged in');
                    return user.id;
                }else{
                    console.error(`[WORKER] WARNING!! Unexpected user slug '${user?.slug}' received. Expected: '${this.workerSlug}'`);
                }
            }catch(e) {
                console.log(e.stack);
                await snooze(Jellyfish.LOGIN_RETRY_INTERVAL_SECS * 1000);
            }
        }
    }
    
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

    public async getActorSlugFromActorId(actorId: string) {
        const actorCard = await this.sdk.card.get(actorId);
        return actorCard.slug;
    }

    public async getSessionTokenFromActorId(actorId: string) {
        const actorSessionCard = await this.sdk.card.create({
            type: 'session@1.0.0',
            data: {
                actor: actorId,
            },
        });
        return actorSessionCard.id;
    }
}
