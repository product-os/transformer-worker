import * as fs from 'fs';
import * as path from 'path';
import * as _ from 'lodash';
import { Contract } from '@balena/jellyfish-types/build/core';
import Runtime from '@balena/transformer-runtime';
import { OutputManifest } from '@balena/transformer-runtime/build/types';

import Jellyfish from './jellyfish';
import Registry from './registry';
import { LinkNames } from './enums';
import { locker } from './updatelock';
import type { ActorCredentials, TaskContract, ArtifactContract } from './types';
import { validateTask } from './validation';
import env from './env';
import { pathExists } from './util';
import { logger, withLogger } from './logger';

const jf = new Jellyfish(env.jfApiUrl, env.jfApiPrefix);
const registry = new Registry(env.registryHost, env.registryPort);

const directory = {
	input: (task: TaskContract) => path.join(env.inputDir, `task-${task.id}`),
	output: (task: TaskContract) => path.join(env.outputDir, `task-${task.id}`),
};

const createArtifactReference = ({
	slug,
	version,
}: Pick<Contract, 'slug' | 'version'>) => {
	let registryPort = '';
	if (env.registryPort) {
		registryPort = `:${env.registryPort}`;
	}
	return `${env.registryHost}${registryPort}/${slug}:${version}`;
};
const runningTasks = new Set<string>();

const runtime = new Runtime(
	env.secretKey
		? Buffer.from(env.secretKey, 'base64').toString('utf-8')
		: undefined,
);

export async function initializeRunner() {
	logger.info('starting...');

	await locker.init();

	// Old registration process
	await jf.loginWithToken(env.workerJfToken);
	// New registration process
	/*
	if(!env.workerJfUsername ?? !env.workerJfPassword) {
		logger.warn('no jf username/password set for worker ${env.workerSlug}. Halting.');
		return;
	}
	await jf.login(env.workerJfUsername, env.workerJfPassword);
	*/

	await jf.listenForTasks(acceptTask);
	logger.info('waiting for tasks');
}

const acceptTask = async (update: { data?: { after?: TaskContract } }) => {
	const task = update?.data?.after;
	const taskStartTimestamp = Date.now();
	if (!task) {
		logger.warn('got an empty task');
		return;
	}
	const commitId = task.data.input.type.startsWith('commit@')
		? (task.data.input.data as any).head.sha
		: task.data.input.data.$transformer?.repoData?.commit;
	// ensure all log lines written within the context of this task get the appropriate context data appended
	await withLogger(
		logger.child(
			{
				task: task.id,
				commit: commitId,
				taskName: task.name,
				transformerSlug: task.data.transformer.slug,
				inputSlug: task.data.input.slug,
			},
			true,
		),
		async () => {
			if (runningTasks.has(task.id)) {
				logger.warn('the task was already running. Ignoring it');
				return;
			}
			await locker.addActive();
			runningTasks.add(task.id!);
			try {
				await jf.setTaskStatusAccepted(task);
				await runTask(task);
				await jf.setTaskStatusCompleted(task, Date.now() - taskStartTimestamp);
			} catch (err: any) {
				logger.error(
					{
						err,
						stdout: err.stdout?.toString('utf8'),
						stderr: err.stderr?.toString('utf8'),
					},
					'error occurred during task processing',
				);
				try {
					await jf.setTaskStatusFailed(
						task,
						err.message,
						Date.now() - taskStartTimestamp,
					);
				} catch (err: any) {
					logger.error(err, `couldn't set task to failed`);
				}
				try {
					await produceErrorContract(task, err);
				} catch (err: any) {
					logger.error(err, `couldn't set task to failed`);
				}
			} finally {
				runningTasks.delete(task.id!);
				await locker.removeActive();
			}
		},
	);
};

/**
 * creates input and output directories and pulls the input and backflow
 * artifacts into (subdirectories of) the input dir
 * @param task
 * @param credentials for pulling from the registry
 * @returns path to artifacts
 */
async function prepareWorkspace(
	task: TaskContract,
	credentials: ActorCredentials,
) {
	logger.info('preparing transformer workspace');

	const outputDir = directory.output(task);
	const inputDir = directory.input(task);

	if (await pathExists(outputDir)) {
		logger.warn('output directory already existed- deleting it');
		await fs.promises.rm(outputDir, { recursive: true, force: true });
	}
	if (await pathExists(inputDir)) {
		logger.warn('input directory already existed- deleting it');
		await fs.promises.rm(inputDir, { recursive: true, force: true });
	}

	const inputArtifactDir = path.join(inputDir, env.artifactDirectoryName);

	await fs.promises.mkdir(inputDir, { recursive: true });
	await fs.promises.mkdir(outputDir, { recursive: true });

	const inputContract = task.data.input;

	const backflows = inputContract.data.$transformer?.backflow ?? [];
	logger.info(
		{ backflowLen: backflows.length },
		'getting backflow artifacts: ',
	);
	await Promise.all(
		backflows.map(async (b) => {
			if (!b.data.$transformer?.artifactReady) {
				return;
			}
			const subArtifactDir = path.join(inputDir, b.id);
			return registry.pullArtifact(createArtifactReference(b), subArtifactDir, {
				username: credentials.slug,
				password: credentials.sessionToken,
			});
		}),
	);

	const secondaryInput = task.data.input.data.$transformer?.backflow?.map(
		(bf) => ({ contract: bf, artifactDirectory: path.join(inputDir, bf.id) }),
	);

	if (inputContract.data.$transformer?.artifactReady) {
		await registry.pullArtifact(
			createArtifactReference(inputContract),
			inputArtifactDir,
			{ username: credentials.slug, password: credentials.sessionToken },
		);
	}

	// TODO parent contract into input manifest
	if (inputContract.data.$transformer?.parentVersion) {
		const parentContract = await jf.getContract(
			`${inputContract.slug}@${inputContract.data.$transformer?.parentVersion}`,
		);
		if (!parentContract) {
			logger.info('no contract found for parent');
		} else if (
			(parentContract as ArtifactContract).data.$transformer?.artifactReady
		) {
			const subArtifactDir = path.join(inputDir, parentContract.id);
			await registry.pullArtifact(
				createArtifactReference(parentContract),
				subArtifactDir,
				{ username: credentials.slug, password: credentials.sessionToken },
			);
			secondaryInput?.push({
				contract: parentContract,
				artifactDirectory: subArtifactDir,
			});
		}
	}

	return {
		artifactDir: inputArtifactDir,
		secondaryInput,
	};
}

async function pullTransformer(
	task: TaskContract,
	actorCredentials: ActorCredentials,
) {
	const transformerImageReference = createArtifactReference(
		task.data.transformer,
	);
	logger.info({ transformerImageReference }, 'pulling transformer');
	const transformerImageRef = await registry.pullImage(
		transformerImageReference,
		{
			username: actorCredentials.slug,
			password: actorCredentials.sessionToken,
		},
	);

	return transformerImageRef;
}

async function pushOutput(
	task: TaskContract,
	outputManifest: OutputManifest,
	actorCredentials: ActorCredentials,
) {
	logger.info('storing transformer output');

	const outputDir = directory.output(task);
	const inputContract = task.data.input;

	for (const result of outputManifest.results) {
		// Because storing an artifact requires an existing contract,
		// but a contact may trigger another transformer,
		// this must be done in following order:
		// - store output contract (artifactReady: false)
		// - push artifact
		// - update output contract (artifactReady: true)

		// Store output contract
		const outputContract = result.contract as ArtifactContract;
		outputContract.name = outputContract.name ?? inputContract.name;
		outputContract.version = outputContract.version ?? inputContract.version;
		outputContract.data.$transformer = {
			...inputContract.data.$transformer,
			...outputContract.data.$transformer,
			artifactReady: false,
		};
		const baseSlug = inputContract.data.$transformer?.baseSlug;
		// If baseSlug exists, then set deterministic slug,
		// otherwise keep transformer-defined slug
		if (baseSlug) {
			const outputType = outputContract.type.split('@')[0];
			outputContract.slug = `${outputType}-${baseSlug}`;
			const slugSuffix = outputContract.data.$transformer?.slugSuffix;
			if (slugSuffix) {
				outputContract.slug += `-${slugSuffix}`;
				delete outputContract.data.$transformer.slugSuffix;
			}
		}
		if (outputContract.type.endsWith('@latest')) {
			const latestType = await jf.getContract(outputContract.type);
			outputContract.type = `${latestType!.slug}@${latestType!.version}`;
		}
		logger.info({ slug: outputContract.slug }, 'upserting output contract');
		await jf.upsertContract(outputContract);

		// Store output artifact
		logger.info({ slug: outputContract.slug }, 'storing output artifact');
		const artifactReference = createArtifactReference(outputContract);
		const authOptions = {
			username: actorCredentials.slug,
			password: actorCredentials.sessionToken,
		};
		if (
			_.compact([result.imagePath, result.artifactPath, result.manifestList])
				.length > 1
		) {
			throw new Error(
				`result ${outputContract.slug} contained multiple kinds of artifact`,
			);
		}
		let hasArtifact = true;
		if (result.imagePath) {
			await registry.pushImage(
				artifactReference,
				path.join(outputDir, result.imagePath),
				authOptions,
			);
		} else if (result.artifactPath) {
			await registry.pushArtifact(
				artifactReference,
				path.join(outputDir, result.artifactPath),
				authOptions,
			);
		} else if (result.manifestList) {
			await registry.pushManifestList(
				artifactReference,
				result.manifestList,
				authOptions,
			);
		} else {
			hasArtifact = false;
			logger.info({ slug: outputContract.slug }, 'no artifact for result');
		}

		// Create links to output contract
		logger.info({ slug: outputContract.slug }, 'linking output contract');
		const contractRepo = await jf.getContractRepository(outputContract);
		await jf.createLink(contractRepo, outputContract, LinkNames.RepoContains);
		await jf.createLink(
			inputContract,
			outputContract,
			LinkNames.WasTransformedTo,
		);
		await jf.createLink(task, outputContract, LinkNames.Generated);

		if (hasArtifact) {
			// Mark artifact ready, allowing it to be processed by downstream transformers
			logger.info(
				{ slug: outputContract.slug },
				'marking output contract artifactReady',
			);
			await jf.markArtifactContractReady(outputContract, artifactReference);
		} else {
			// contracts without artifacts shouldn't have an 'artifactReady' field at all, but we keep it
			// with "false" until now, to block it being processed before links are created
			logger.info(
				{ slug: outputContract.slug },
				'removing output contract artifactReady, since no artifact',
			);
			await jf.removeArtifactReady(outputContract);
		}
	}
}

async function processBackflow(
	task: TaskContract,
	outputManifest: OutputManifest,
) {
	logger.info('processing backflow');

	const inputContract = _.cloneDeep(task.data.input);

	// Process backflow from each output contract, to input contract
	for (const result of outputManifest.results) {
		// ensure we have a *full* contract, including field generated by formulas
		const outputContract: ArtifactContract = result.contract.id
			? (await jf.getContract(result.contract.id))!
			: (result.contract as ArtifactContract);
		await jf.updateBackflow(outputContract, inputContract, task);
	}

	// Propagate backflow recursively from input contract upstream
	const backflowLimit = 100;

	const propagate = async (contract: ArtifactContract, step: number = 1) => {
		if (step > backflowLimit) {
			logger.info(
				{ backflowLimit },
				'backflow propagation limit reached, not following further',
			);
			return;
		}

		const parent = await jf.getUpstreamContract(contract);
		if (parent) {
			// the previous step might have resulted in changes to formulas
			const freshContract = (await jf.getContract<ArtifactContract>(
				contract.id,
			))!;
			await jf.updateBackflow(freshContract, parent);
			await propagate(parent, step + 1);
		}
	};

	await propagate(inputContract);
}

async function cleanupWorkspace(task: TaskContract) {
	await fs.promises.rmdir(directory.input(task), { recursive: true });
	await fs.promises.rmdir(directory.output(task), { recursive: true });
}

async function runTask(task: TaskContract) {
	logger.info({ taskSlug: task.slug }, 'running task');

	await validateTask(task);

	// The actor is the loop, and to start with that will always be product-os
	const actorCredentials = await jf.getActorCredentials(task.data.actor);

	const [transformerImageRef, workspace] = await Promise.all([
		pullTransformer(task, actorCredentials),
		prepareWorkspace(task, actorCredentials),
	]);

	// unfortunately logger is not happy when you try to set some fields :/
	const { name: _n, hostname: _h, pid: _p, ...logMeta } = logger.fields;
	const outputManifest = await runtime.runTransformer(
		workspace.artifactDir,
		task.data.input,
		task.data.transformer,
		transformerImageRef,
		directory.input(task),
		directory.output(task),
		true,
		{ ['io.balena.transformer.task.id']: task.id },
		workspace.secondaryInput,
		logMeta,
	);

	logger.info({ outputManifest }, 'received output manifest');

	await pushOutput(task, outputManifest, actorCredentials);

	await processBackflow(task, outputManifest);

	await cleanupWorkspace(task);

	logger.info('task completed successfully');
}

async function produceErrorContract(task: TaskContract, err: any) {
	const transformer = task.data.transformer;
	const errorContract = {
		type: 'error@1.0.0',
		name: `Runtime Error - ${transformer.name} - ${task.data.input.name}`,
		data: {
			message: err.message,
			code: err.code ?? 'unknown',
			transformer: `${transformer.slug}@${transformer.version}`,
			expectedOutputTypes: transformer.data?.expectedOutputTypes ?? [],
			stdOutTail: err.stdout?.toString('utf8'),
			stdErrTail: err.stderr?.toString('utf8'),
		},
	};
	const createdErr = await jf.upsertContract(errorContract);
	await jf.createLink(task.data.input, createdErr!, LinkNames.WasTransformedTo);
}
