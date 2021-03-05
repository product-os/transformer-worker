import { getSdk } from '@balena/jellyfish-client-sdk';
import {ActorCredentials, ArtifactContract, Contract, TaskContract, TaskStatusMetadata} from './types';
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
	private _userId: string = '';
	
	get userId(): string {
		return this._userId;
	}

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
			this._userId = user.id;
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
			required: ['type', 'data'],
			properties: {
				type: {
					const: 'task@1.0.0',
				},
				data: {
					type: 'object',
					required: ['status'],
					properties: {
						status: {
							const: TaskStatus.Pending
						}
					}
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

	public async markArtifactContractReady(contractId: string, contractType: string) {
		await this.sdk.card.update(contractId, contractType, [
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
				op: 'add',
				path: '/data/status',
				value: status,
			},
			{
				op: 'add',
				path: '/data/statusMetadata',
				value: metaData
			},
		]);
		return task;
	}

	public async createLink(from: Contract, to: Contract, linkName: string) {
		await this.sdk.card.link(from, to, linkName);
	}

	public async getContract(idOrSlug: string) {
		return await this.sdk.card.get(idOrSlug);
	}

	private async getActorSlugFromActorId(actorId: string) {
		const actorContract = await this.sdk.card.get(actorId);
		return actorContract.slug;
	}

	private async getSessionTokenFromActorId(actorId: string) {
		const actorSessionContract = await this.sdk.card.create({
			type: 'session@1.0.0',
			data: {
				actor: actorId,
			},
		});
		return actorSessionContract.id;
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
