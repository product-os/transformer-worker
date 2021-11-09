import { getSdk } from '@balena/jellyfish-client-sdk';
import * as jsonpatch from 'fast-json-patch';
import {
	ActorCredentials,
	ArtifactContract,
	BackflowMapping,
	LinkContract,
	TaskContract,
	TaskStatusMetadata,
} from './types';
import * as _ from 'lodash';
import { LinkNames, TaskStatus } from './enums';
import { evaluateFormulaOrValue } from './util';
import { Contract } from '@balena/jellyfish-types/build/core';
import { JSONSchema } from '@balena/jellyfish-types';
import {
	AddOperation,
	RemoveOperation,
	ReplaceOperation,
} from 'fast-json-patch';

export default class Jellyfish {
	static readonly LOGIN_RETRY_INTERVAL_SECS: number = 5;
	static readonly HEARTBEAT_PERIOD = 10000;
	private _userId: string = '';

	get userId(): string {
		return this._userId;
	}

	constructor(
		apiUrl: string,
		apiPrefix: string,
		private sdk = getSdk({ apiUrl, apiPrefix }),
	) {}

	public async listenForTasks(
		taskHandler: (task: { data?: { after?: TaskContract } }) => Promise<void>,
	) {
		const user = await this.sdk.auth.whoami();

		const taskQuery = this.createTaskQuery(user.id);
		const taskStream = await this.sdk.stream(taskQuery);
		taskStream.on('update', taskHandler);

		taskStream.on('streamError', (error: Error) => {
			console.error(error);
		});
		const queryId = user.id;
		const handler = async ({ data }: { data: any }) => {
			console.log(`initial query handler`, data);
			if (data.id === queryId) {
				taskStream.off('dataset', handler);
				await Promise.all(
					data.cards.map((c: any) => taskHandler({ data: { after: c } })),
				);
			}
		};
		taskStream.on('dataset', handler);
		taskStream.emit('queryDataset', {
			data: {
				id: queryId,
				schema: taskQuery,
			},
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
			throw new Error(`Login failed. User: '${user}'`);
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

	private createTaskQuery(workerId: string): JSONSchema {
		return {
			$$links: {
				'is owned by': {
					type: 'object',
					properties: {
						id: {
							type: 'string',
							const: workerId,
						},
					},
				},
			},
			type: 'object',
			required: ['type', 'data'],
			properties: {
				type: {
					type: 'string',
					const: 'task@1.0.0',
				},
				data: {
					type: 'object',
					required: ['status'],
					properties: {
						status: {
							type: 'string',
							const: TaskStatus.Pending,
						},
					},
				},
			},
		};
	}

	public async storeArtifactContract(contract: ArtifactContract) {
		// See if contract already exists
		const versionedSlug = `${contract.slug}@${contract.version}`;
		const storedContract = await this.sdk.card.get(versionedSlug);

		if (storedContract) {
			// ensure local references contain proper IDs
			contract.id = storedContract.id;

			// Update existing but only change thing under /data
			const patch = jsonpatch.compare(
				{ data: storedContract.data },
				{ data: contract.data },
			);
			if (patch.length === 0) {
				return storedContract;
			}
			return await this.sdk.card.update(
				storedContract.id,
				storedContract.type,
				patch,
			);
		}
		// Create new contract
		const createdCard = await this.sdk.card.create(contract);
		if (!createdCard) {
			throw new Error(`Couldn't create contract: ${contract}`);
		}
		// ensure local references contain proper IDs
		contract.id = createdCard.id;
		contract.slug = createdCard.slug;
		return createdCard;
	}

	public async markArtifactContractReady(
		contract: ArtifactContract,
		artifactValue: string,
	) {
		await this.sdk.card.update(contract.id, contract.type, [
			{
				op: 'replace',
				path: '/data/$transformer/artifactReady',
				value: artifactValue,
			} as ReplaceOperation<string>,
		]);
	}

	public async removeArtifactReady(contract: ArtifactContract) {
		await this.sdk.card.update(contract.id, contract.type, [
			{
				op: 'remove',
				path: '/data/$transformer/artifactReady',
			} as RemoveOperation,
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
			duration,
		});
	}

	public async setTaskStatusFailed(
		task: TaskContract,
		message: string,
		duration: number,
	) {
		return this.setTaskStatus(task, TaskStatus.Failed, {
			message,
			duration,
		});
	}

	private async setTaskStatus(
		task: TaskContract,
		status: TaskStatus,
		metaData: TaskStatusMetadata = {},
	) {
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
				value: metaData,
			},
		]);
		return task;
	}

	public async createLink(from: Contract, to: Contract, linkName: string) {
		await this.sdk.card.link(from, to, linkName);
	}

	private async getLinkTo(
		linkName: string,
		fromType: string | undefined,
		contractId: string | undefined,
	): Promise<LinkContract | undefined> {
		if (!contractId) {
			throw new Error('queryLink - contract id not defined');
		}
		const linkResult = await this.sdk.query<LinkContract>(
			{
				type: 'object',
				required: ['type', 'data', 'name'],
				properties: {
					type: {
						const: 'link@1.0.0',
						type: 'string',
					},
					name: {
						const: linkName,
						type: 'string',
					},
					data: {
						type: 'object',
						required: ['to', 'from'],
						properties: {
							to: {
								type: 'object',
								required: ['id'],
								properties: {
									id: {
										const: contractId,
										type: 'string',
									},
								},
							},
							from: {
								type: 'object',
								required: ['type'],
								properties: {
									type: {
										const: fromType,
										type: 'string',
									},
								},
							},
						},
					},
				},
			},
			{ limit: 1 },
		);

		return linkResult[0];
	}

	public async getUpstreamContract(contract: ArtifactContract) {
		const type = undefined;
		const link = await this.getLinkTo(
			LinkNames.WasBuiltInto,
			type,
			contract.id,
		);
		if (link) {
			return await this.getContract<ArtifactContract>(link.data.from.id);
		}
	}

	// Get the task that generated the artifact contract
	public async getArtifactContractTask(
		contract: ArtifactContract,
	): Promise<TaskContract | null> {
		const type = 'task@1.0.0';
		const link = await this.getLinkTo(LinkNames.Generated, type, contract.id);
		if (link) {
			return await this.getContract<TaskContract>(link.data.from.id);
		} else {
			throw new Error(
				`Could not get task contract for artifact ${contract.slug} (no link)`,
			);
		}
	}

	private getBackflowPatch(
		backflowMapping: BackflowMapping[],
		upstream: ArtifactContract,
		downstream: ArtifactContract,
	) {
		const upstreamClone = _.cloneDeep(upstream);

		// Apply each mapping to clone
		for (const mapping of backflowMapping) {
			// Get source (downstream) value
			// Specified as either a literal value or formula referencing a downstream property
			let sourceValue;
			if (mapping.downstreamValue) {
				sourceValue = evaluateFormulaOrValue(mapping.downstreamValue, {
					upstream,
					downstream,
				});
			} else {
				throw new Error(
					`Missing backflow mapping source for contract '${downstream.slug}'`,
				);
			}

			// Get target (upstream) path
			// Specified as either static path or a formula
			let sourcePath;
			if (mapping.upstreamPath) {
				sourcePath = evaluateFormulaOrValue(mapping.upstreamPath, {
					upstream,
					downstream,
				});
			} else {
				throw new Error(
					`Missing backflow mapping target for contract '${downstream.slug}'`,
				);
			}

			// Apply upstream
			_.set(upstreamClone, sourcePath, sourceValue);
		}

		// Generate json patch representing all changes to upstream contract
		return jsonpatch.compare(upstream, upstreamClone);
	}

	/**
	 * stores resulting contracts in the backflow property of the source contract
	 * so it can be used there when matching with other transformers
	 * @param parent input of the transformer
	 * @param child output contract of the transformer
	 * @returns
	 */
	public async updateBackflow(
		child: ArtifactContract,
		parent: ArtifactContract,
		_task?: TaskContract,
	) {
		// ensure backflow only happens one level deep
		if (child.data.$transformer) {
			const { backflow, ...transformerDataWithoutBackflow } =
				child.data.$transformer;
			child.data.$transformer = transformerDataWithoutBackflow;
		}

		// TODO REMOVE backflowMapping
		// it's the very generic version of backflow which allowed arbitrary fields
		// and transformations to happen.
		// This should be removed once all transformers have been changed to make
		// use of the simpler solution.
		// MR 2021-09-10

		// Get backflow mapping,
		// defined in transformer contract of the task that generated artifact contract,
		const task = _task ?? (await this.getArtifactContractTask(child));
		if (!task) {
			throw new Error(
				`Could not find task that generated contract: ${child.slug}`,
			);
		}

		const backflowMapping = task.data.transformer.data.backflowMapping || [];
		if (!Array.isArray(backflowMapping)) {
			throw Error(`backflowMapping has wrong type: ${backflowMapping}`);
		}

		// Get json update patch, and apply
		const backflowPatch = this.getBackflowPatch(backflowMapping, parent, child);

		if (typeof parent.data?.$transformer?.backflow !== 'object') {
			backflowPatch.push({
				op: 'add',
				path: '/data/$transformer/backflow',
				value: [],
			} as AddOperation<any>);
		}

		const childIdx = _.findIndex(
			parent.data.$transformer?.backflow || [],
			(c) => c.id === child.id,
		);
		if (childIdx === -1) {
			backflowPatch.push({
				op: 'add',
				path: '/data/$transformer/backflow/-',
				value: child,
			} as AddOperation<Contract>);
		} else {
			backflowPatch.push({
				op: 'replace',
				path: `/data/$transformer/backflow/${childIdx}`,
				value: child,
			} as ReplaceOperation<Contract>);
		}

		await this.sdk.card.update(parent.id, task.type, backflowPatch);
		console.log(`[WORKER] backflow processed`, {
			transformer: task.data.transformer.slug,
			transformerVersion: task.data.transformer.version,
		});
	}

	public async getContract<TContract extends Contract>(idOrSlug: string) {
		return await this.sdk.card.get<TContract>(idOrSlug);
	}

	private async getActorSlugFromActorId(actorId: string) {
		const actorContract = await this.sdk.card.get(actorId);
		if (!actorContract) {
			throw new Error('actor not found');
		}
		return actorContract.slug;
	}

	private async getSessionTokenFromActorId(actorId: string) {
		const actorSessionContract = await this.sdk.card.create({
			type: 'session@1.0.0',
			data: {
				actor: actorId,
			},
		});
		if (!actorSessionContract) {
			throw new Error('session not created');
		}
		return actorSessionContract.id;
	}

	async getContractRepository(contract: ArtifactContract) {
		const [repo] = await this.sdk.query(
			{
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
								type: 'string',
							},
						},
					},
				},
			},
			{
				limit: 1,
			},
		);
		if (repo) {
			return repo;
		}
		// In the future contract repositories might become natively supported by JF.
		// For now, the worker takes the responsibility to create them as needed.
		const newRepo = {
			type: 'contract-repository@1.0.0',
			name: `Repo of ${contract.name || contract.slug}`,
			slug: `contract-repository-${contract.slug}`,
			data: {
				base_slug: contract.slug,
				base_type: contract.type,
			},
		};
		const createResult = await this.sdk.card.create(newRepo);
		if (!createResult) {
			throw new Error(`Couldn't create contract repo`);
		}
		return { ...newRepo, ...createResult };
	}

	private initializeHeartbeat() {
		setInterval(() => {
			try {
				// report to JF
			} catch (err) {
				// handle error, probably just log/report to sentry
			}
		}, Jellyfish.HEARTBEAT_PERIOD);
	}
}
