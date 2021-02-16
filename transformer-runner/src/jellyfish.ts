import { getSdk } from '@balena/jellyfish-client-sdk';
import { ActorCredentials, ArtifactContract, TaskContract } from './types';
import * as _ from 'lodash';

export default class Jellyfish {
	static readonly LOGIN_RETRY_INTERVAL_SECS: number = 5;
	static readonly HEARTBEAT_PERIOD = 10000;
	private sdk: any;

	constructor(private apiUrl: string, private apiPrefix: string) {
		this.sdk = getSdk({ apiUrl: this.apiUrl, apiPrefix: this.apiPrefix });
	}

	public async listenForTasks(taskHandler: (task: TaskContract) => Promise<void>) {
		const user = await this.sdk.auth.whoami();

		// Get task stream, and await tasks
		const taskStream = await this.getTaskStream(user.id);
		taskStream.on('update', taskHandler);

		taskStream.on('streamError', (error: Error) => {
			console.error(error);
		});

		this.initializeHeartbeat();

		// TODO: Need to define high level jf-worker protocol. I.e. support:
		//  - Working signaling:
		// 		- ready for task
		// 		- acceptance of task
		// 		- rejection of task
		// 		- completion of task
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
		// TODO: Check this schema with Lucian
		const schema = {
			$$links: {
				'is owned by': {
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
			},
		};

		return await this.sdk.stream(schema);
	}

	public async storeArtifactContract(contract: ArtifactContract) {
		// Set as draft,
		// so as not to trigger other transformers before artifact ready
		_.set(contract, "data.$transformer.artifactReady", false);
		const newContract = await this.sdk.card.create(
			contract,
		) as ArtifactContract;
		return newContract.id;
	}

	public async markArtifactContractReady(contractId: string, cardType: string) {
		await this.sdk.card.update(contractId, cardType, [
			{
				op: 'replace',
				path: '/data/$transformer/artifactReady',
				value: true,
			},
		]);
	}

	// TODO: Check why we are using id and not slug
	public async getActorCredentials(actorId: string) {
		return {
			slug: await this.getActorSlugFromActorId(actorId),
			sessionToken: await this.getSessionTokenFromActorId(actorId),
		} as ActorCredentials;
	}

	public async acknowledgeTask(task: TaskContract) {
		// TODO: Acknowledge task with JF
		return task;
	}

	public async confirmTaskCompletion(task: TaskContract) {
		// TODO: Mark task as completed with JF
		return task;
	}

	public async reportTaskFailed(task: TaskContract) {
		// TODO: Mark task as FAILED with JF
		return task;
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
	
	private initializeHeartbeat() {
		setInterval(() => {
			try {
				// report to JF
			} catch (err) {
				// handle error, probably just log/report to sentry
			}
		}, Jellyfish.HEARTBEAT_PERIOD);
	};
}
