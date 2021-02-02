import { getSdk } from '@balena/jellyfish-client-sdk';
import env from './env';
import * as mockSdk from './mock-jellyfish-client-sdk';
import { ActorCredentials, ArtifactContract, TaskContract } from './types';

export default class Jellyfish {
	static readonly LOGIN_RETRY_INTERVAL_SECS: number = 5;
	private sdk: any;

	constructor(private apiUrl: string, private apiPrefix: string) {}

	public async init() {
		this.sdk = env.mockJfSdk
			? await mockSdk.getSdk({ apiUrl: this.apiUrl, apiPrefix: this.apiPrefix })
			: getSdk({ apiUrl: this.apiUrl, apiPrefix: this.apiPrefix });
	}

	public async listenForTasks(taskHandler: (task: TaskContract) => Promise<void>) {
		const user = await this.sdk.auth.whoami();

		// Get task stream, and await tasks
		const taskStream = await this.getTaskStream(user.id);
		// how does this actually work? Could two tasks run in parallel?
		taskStream.on('update', async (t: TaskContract) => {
			try {
				await taskHandler(t);
			} catch(e) {
				console.log(`[WORKER] ERROR occured during task processing: ${e}`);
			}
		});

		taskStream.on('streamError', (error: Error) => {
			console.error(error);
		});
	}

	public async login(workerSlug: string, authToken: string) {
		// TODO:
		//  - retry
		//  - reconnection

		await this.sdk.setAuthToken(authToken);
		const user = await this.sdk.auth.whoami();
		if (user?.slug === workerSlug) {
			console.log(`[WORKER] Logged in to JF, id ${user.id}`);
			return user.id;
		} else {
			throw new Error(
				`Unexpected user slug '${user?.slug}' received. Expected: '${workerSlug}'`,
			);
		}
	}

	private async getTaskStream(workerId: string) {
		const schema = {
			$$links: {
				'is owned by': { // 'is assigned to' might be better
					type: 'object',
					properties: {
						id: {
							const: workerId,
						},
					},
				},
			},
			type: 'object',
			properties: {
				type: {
					const: 'task@1.0.0',
				},
				// TODO add something like state==TODO, so we filter out DONE tasks
			},
		};

		return await this.sdk.stream(schema);
	}

	public async storeArtifactContract(contract: ArtifactContract) {
		// Set as draft,
		// so as not to trigger other transformers before artifact ready
		contract.data.artifactReady = true;
		const newContract = (await this.sdk.card.create(
			contract,
		)) as ArtifactContract;
		return newContract.id;
	}

	// TODO:
	//  Why do we need to set artifact type and name here?
	public async updateArtifactContract(contractId: string) {
		//}, artifactType: string, artifactName: string) {
		await this.sdk.card.update(contractId, env.standardArtifactType, [
			/*
            {
                op: 'replace',
                path: '/data/artifact/type',
                value: artifactType
            },
            {
                op: 'replace',
                path: '/data/artifact/name',
                value: artifactName
            },
             */
			{
				op: 'replace',
				path: '/data/artifact_ready',
				value: true,
			},
		]);
	}

	public async getActorCredentials(actorId: string) {
		return {
			// why would we get the actor ID and not the slug?
			slug: await this.getActorSlugFromActorId(actorId), 
			sessionToken: await this.getSessionTokenFromActorId(actorId),
		} as ActorCredentials;
	}

	private async getActorSlugFromActorId(actorId: string) {
		const actorCard = await this.sdk.card.get(actorId);
		return actorCard.slug;
	}

	private async getSessionTokenFromActorId(actorId: string) {
		// why will this actually work? Is the actor somehow linked to the worker as part of some TBD JF process?
		const actorSessionCard = await this.sdk.card.create({
			type: 'session@1.0.0',
			data: {
				actor: actorId,
			},
		});
		return actorSessionCard.id;
	}
}
