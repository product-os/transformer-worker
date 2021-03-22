import { getSdk } from '@balena/jellyfish-client-sdk';
import * as jsonpatch from 'fast-json-patch';
import {
	ActorCredentials,
	ArtifactContract,
	BackflowMapping,
	Contract,
	LinkContract,
	TaskContract,
	TaskStatusMetadata,
} from './types';
import * as _ from 'lodash';
import { LinkNames, TaskStatus } from './enums';
import {evaluateFormulaOrValue} from "./util";

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

		const session = await this.sdk.auth.login({ username, password });
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
		// See if contract already exists
		const versionedSlug = `${contract.slug}@${contract.version}`;
		let storedContract = await this.sdk.card.get(versionedSlug);
		
		if(storedContract) {
			// Update existing 
			const patch = jsonpatch.compare(storedContract, contract);
			storedContract = await this.sdk.card.update(
				storedContract.id, storedContract.type, patch
			) as ArtifactContract;
		}
		else {
			// Create new contract
			storedContract = await this.sdk.card.create(
				contract,
			) as ArtifactContract;
		}
		
		contract.id = storedContract.id;
		return contract;
	}

	public async markArtifactContractReady(contract: ArtifactContract) {
		await this.sdk.card.update(contract.id, contract.type, [
			{
				op: 'replace',
				path: '/data/$transformer/artifactReady',
				value: true,
			},
		]);
	}

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

	private async getLinkTo(linkName: string, contractType: string | undefined, contractId: string | undefined): Promise<LinkContract | undefined> {
		if (!contractId) {
			throw new Error("queryLink - contract id not defined");
		}
		const linkResult = await this.sdk.query({
			"type": "object",
			"required": ["type", "data", "name"],
			"properties": {
				"type": {
					"const": "link@1.0.0",
					"type": "string"
				},
				"name": {
					"const": linkName,
					"type": "string"
				},
				"data": {
					"type": "object",
					"required": ["to"],
					"properties": {
						"to": {
							"type": "object",
							"required": ["id"],
							"properties": {
								"type": {
									"const": contractType,
									"type": "string"
								},
								"id": {
									"const": contractId,
									"type": "string"
								}
							}
						}
					}
				}
			}
		}, { limit: 1 });

		return linkResult[0];
	}

	public async getUpstreamContract(contract: ArtifactContract) {
		const type = undefined;
		const link = await this.getLinkTo(LinkNames.WasBuiltInto, type, contract.id);
		if (link) {
			return await this.getContract(link.data.to.id);
		}
	}

	// Get the task that generated the artifact contract
	public async getArtifactContractTask(contract: ArtifactContract): Promise<TaskContract | undefined> {
		const type = 'task@1.0.0';
		const link = await this.getLinkTo(LinkNames.Generated, type, contract.id);
		if (link) {
			return await this.getContract(link.data.to.id);
		} else {
			throw new Error(`Could not get task contract for artifact ${contract.slug} (no link)`);
		}
	}

	private getBackflowPatch(backflowMapping: BackflowMapping[], upstream: ArtifactContract, downstream: ArtifactContract) {
		const upstreamClone = _.cloneDeep(upstream);

		// Apply each mapping to clone
		for (const mapping of backflowMapping) {
			
			// Get source (downstream) value
			// Specified as either a literal value or formula referencing a downstream property
			let sourceValue;
			if(mapping.downstreamValue) {
				sourceValue = evaluateFormulaOrValue(mapping.downstreamValue, { upstream, downstream });
			}
			else {
				throw new Error(`Missing backflow mapping source for contract '${downstream.slug}'`);
			}
			
			// Get target (upstream) path
			// Specified as either static path or a formula 
			let sourcePath;
			if(mapping.upstreamPath) {
				sourcePath = evaluateFormulaOrValue(mapping.upstreamPath, {upstream, downstream});
			} else {
				throw new Error(`Missing backflow mapping target for contract '${downstream.slug}'`);
			}
			
			// Apply upstream
			_.set(upstreamClone, sourcePath, sourceValue);
		}

		// Generate json patch representing all changes to upstream contract
		return jsonpatch.compare(upstream, upstreamClone);
	}

	public async updateBackflow(child: ArtifactContract, parent: ArtifactContract, _task?: TaskContract) {
		// Get backflow mapping, 
		// defined in transformer contract of the task that generated artifact contract,
		const task = _task ?? await this.getArtifactContractTask(child);
		if (!task) {
			throw new Error(`Could not find task that generated contract: ${child.slug}`);
		}
		const backflowMapping = task.data.transformer.data.backflowMapping;
		if (!backflowMapping) {
			console.log('No backflow mapping defined - skipping');
			return;
		}
		if (!Array.isArray(backflowMapping)) {
			throw Error(`backflowMapping has wrong type: ${backflowMapping}`);
		}

		// Get json update patch, and apply
		const backflowPatch = this.getBackflowPatch(backflowMapping, parent, child);
		
		await this.sdk.card.update(parent.id, task.type, backflowPatch);
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

	async getContractRepository(contract: ArtifactContract) {
		const [repo] = await this.sdk.query({
			type: 'object',
			required: ['type', 'data'],
			properties: {
				type: {
					const: 'contract-repository@1.0.0',
					type: 'string',
				},
				data: {
					type: 'object',
					required: ['base_slug'],
					properties: {
						base_slug: {
							const: contract.slug,
							type: 'string'
						}
					}
				}
			},
		}, {
			limit: 1
		})
		if (repo) {
			return repo;
		}
		// In the future contract repositories might become natively supported by JF.
		// For now, the worker takes the responsibility to create them as needed.
		const newRepo = {
			type: 'contract-repository@1.0.0',
			name: `Contract Repository for contracts from ${contract.name}`,
			slug: `contract-repository-${contract.slug}`,
			data: {
				base_slug: contract.slug,
				base_type: contract.type,
			}
		}
		await this.sdk.card.create(newRepo)
		return newRepo
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
