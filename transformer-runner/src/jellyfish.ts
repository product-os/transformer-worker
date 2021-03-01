import { getSdk } from '@balena/jellyfish-client-sdk';
import {ActorCredentials, ArtifactContract, TaskContract, TaskStatusMetadata} from './types';
import * as _ from 'lodash';

enum TaskStatus {
	Pending = 'pending',
	Accepted = 'accepted',
	Completed = 'completed',
	Failed = 'failed',
}

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
	}

	// This is the old registration flow, to be removed later.
	public async loginWithToken(authToken: string) {
		// TODO:
		//  - retry
		//  - reconnection

		await this.sdk.setAuthToken(authToken);
		const user = await this.sdk.auth.whoami();
		if (user?.slug) {
			console.log(`[WORKER] Logged in to JF, id ${user.id}`);
			return user.id;
		} else {
			throw new Error(
				`Login failed. User: '${user}'`,
			);
		}
	}

	// This is the user/pass based auth that will be used later.
	public async login(username: string, password: string) {
		// TODO:
		//  - retry
		//  - reconnection
		
		const session = await this.sdk.auth.login({username, password});
		console.log(`[WORKER] Logged in to JF, session: ${session}`);
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
				// TODO: Check if this is correct:
				data: {
					status: TaskStatus.Pending,
				}
			},
		};

		return await this.sdk.stream(schema);
	}

	public async storeArtifactContract(contract: ArtifactContract) {
		// TODO: Do upsert instead of insert.
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

	public async setTaskStatusAccepted(task: TaskContract) {
		return this.setTaskStatus(task, TaskStatus.Accepted);
	}

	public async setTaskStatusCompleted(task: TaskContract, duration: number) {
		return this.setTaskStatus(task, TaskStatus.Completed, {
			duration
		});
	}

	public async setTaskStatusFailed(task: TaskContract, message: string, duration: number) {
		return this.setTaskStatus(task, TaskStatus.Failed, {
			message,
			duration
		});
	}
	
	private async setTaskStatus(task: TaskContract, status: TaskStatus, metaData: TaskStatusMetadata = {}) {
		metaData.timestamp = Date.now();
		
		await this.sdk.card.update(task.id, task.type, [
			{
				op: 'replace',
				path: '/data/status',
				value: status,
			},
			{
				op: 'replace',
				path: '/data/statusMetadata',
				value: metaData
			},
		]);
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
