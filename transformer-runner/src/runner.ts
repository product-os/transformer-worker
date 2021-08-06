import Jellyfish from './jellyfish';
import Registry from './registry';
import { pathExists } from './util';
import { LinkNames } from './enums';
import { locker } from './updatelock';
import type {
	ActorCredentials,
	TaskContract,
	InputManifest,
	OutputManifest,
	ArtifactContract,
} from './types';
import { validateTask, validateOutputManifest } from './validation';
import * as fs from 'fs';
import * as path from 'path';
import env from './env';
import { ContainerCreateOptions } from 'dockerode';
import * as _ from 'lodash';
import NodeRSA = require('node-rsa');
import { Contract } from '@balena/jellyfish-types/build/core';

const jf = new Jellyfish(env.jfApiUrl, env.jfApiPrefix);
const registry = new Registry(env.registryHost, env.registryPort);
const secretsKey = env.secretKey
	? new NodeRSA(
			Buffer.from(env.secretKey, 'base64').toString('utf-8'),
			'pkcs1',
			{ encryptionScheme: 'pkcs1' },
	  )
	: undefined;

const directory = {
	input: (task: TaskContract) => path.join(env.inputDir, `task-${task.id}`),
	output: (task: TaskContract) => path.join(env.outputDir, `task-${task.id}`),
};

const createArtifactReference = ({ slug, version }: Contract) => {
	let registryPort = '';
	if (env.registryPort) {
		registryPort = `:${env.registryPort}`;
	}
	return `${env.registryHost}${registryPort}/${slug}:${version}`;
};
const runningTasks = new Set<string>();

export async function initializeRunner() {
	console.log(`[WORKER] starting...`);

	await locker.init();

	// Old registration process
	await jf.loginWithToken(env.workerJfToken);
	// New registration process
	/*
	if(!env.workerJfUsername || !env.workerJfPassword) {
		console.log(`[WORKER] WARN no jf username/password set for worker ${env.workerSlug}. Halting.`);
		return;
	}
	await jf.login(env.workerJfUsername, env.workerJfPassword);
	*/

	await jf.listenForTasks(acceptTask);
	console.log('[WORKER] Waiting for tasks');
}

const acceptTask = async (update: { data?: { after?: TaskContract } }) => {
	const task = update?.data?.after;
	const taskStartTimestamp = Date.now();
	if (!task) {
		console.log(`[WORKER] WARN got an empty task`);
		return;
	}
	if (runningTasks.has(task.id)) {
		console.log(
			`[WORKER] WARN the task ${task.id} was already running. Ignoring it`,
		);
		return;
	}
	await locker.addActive();
	runningTasks.add(task.id!);
	try {
		await jf.setTaskStatusAccepted(task);
		await runTask(task);
		await jf.setTaskStatusCompleted(task, Date.now() - taskStartTimestamp);
	} catch (e) {
		console.log(
			`[WORKER] ERROR occurred during task processing: ${e}`,
			e.stdout?.toString('utf8'),
			e.stderr?.toString('utf8'),
		);
		await jf.setTaskStatusFailed(
			task,
			e.message,
			Date.now() - taskStartTimestamp,
		);
	} finally {
		runningTasks.delete(task.id!);
		await locker.removeActive();
	}
};

async function prepareWorkspace(
	task: TaskContract,
	credentials: ActorCredentials,
) {
	console.log(`[WORKER] Preparing transformer workspace`);

	const outputDir = directory.output(task);
	const inputDir = directory.input(task);

	if (await pathExists(outputDir)) {
		console.log(
			`[WORKER] WARN output directory already existed (from previous run?) - deleting it`,
		);
		await fs.promises.rm(outputDir, { recursive: true, force: true });
	}
	if (await pathExists(inputDir)) {
		console.log(
			`[WORKER] WARN input directory already existed (from previous run?) - deleting it`,
		);
		await fs.promises.rm(inputDir, { recursive: true, force: true });
	}

	const inputArtifactDir = path.join(inputDir, env.artifactDirectoryName);

	await fs.promises.mkdir(inputArtifactDir, { recursive: true });
	await fs.promises.mkdir(outputDir, { recursive: true });

	const inputContract = task.data.input;
	if (task.data.transformer.data.inputType != 'contract-only') {
		await registry.pullArtifact(
			createArtifactReference(inputContract),
			inputArtifactDir,
			{ username: credentials.slug, password: credentials.sessionToken },
		);
	}

	// Add input manifest
	const inputManifest: InputManifest = {
		input: {
			contract: inputContract,
			transformerContract: task.data.transformer,
			artifactPath: env.artifactDirectoryName,
			decryptedSecrets: decryptSecrets(
				secretsKey,
				inputContract.data.$transformer?.encryptedSecrets,
			),
			decryptedTransformerSecrets: decryptSecrets(
				secretsKey,
				task.data.transformer.data.encryptedSecrets,
			),
		},
	};

	await fs.promises.writeFile(
		path.join(directory.input(task), env.inputManifestFilename),
		JSON.stringify(inputManifest, null, 4),
		'utf8',
	);
}

async function pullTransformer(
	task: TaskContract,
	actorCredentials: ActorCredentials,
) {
	const transformerImageReference = createArtifactReference(
		task.data.transformer,
	);
	console.log(`[WORKER] Pulling transformer ${transformerImageReference}`);
	const transformerImageRef = await registry.pullImage(
		transformerImageReference,
		{
			username: actorCredentials.slug,
			password: actorCredentials.sessionToken,
		},
	);

	return transformerImageRef;
}

async function runTransformer(task: TaskContract, transformerImageRef: string) {
	console.log(`[WORKER] Running transformer image ${transformerImageRef}`);

	const docker = registry.docker;

	// docker-in-docker work by mounting a tmpfs for the inner volumes
	const tmpDockerVolume = `tmp-docker-${task.id}`;

	//HACK - dockerode closes the stream unconditionally
	process.stdout.end = () => {};
	process.stderr.end = () => {};

	const runResult = await docker.run(
		transformerImageRef,
		[],
		[process.stdout, process.stderr],
		{
			Tty: false,
			Env: [
				`INPUT=/input/${env.inputManifestFilename}`,
				`OUTPUT=/output/${env.outputManifestFilename}`,
			],
			Volumes: {
				'/input/': {},
				'/output/': {},
				'/var/lib/docker': {}, // if the transformers uses docker-in-docker, this is required
			},
			HostConfig: {
				Init: true, // should ensure that containers never leave zombie processes
				Privileged: true, //TODO: this should at least only happen for Transformers that need it
				Binds: [
					`${path.resolve(directory.input(task))}:/input/:ro`,
					`${path.resolve(directory.output(task))}:/output/`,
					`${tmpDockerVolume}:/var/lib/docker`,
				],
			},
		} as ContainerCreateOptions,
	);

	const output = runResult[0];
	const container = runResult[1];

	await docker.getContainer(container.id).remove({ force: true });
	await docker.getVolume(tmpDockerVolume).remove({ force: true });

	console.log('[WORKER] run result', JSON.stringify(runResult));

	return output.StatusCode;
}

async function validateOutput(task: TaskContract, transformerExitCode: number) {
	console.log(`[WORKER] Validating transformer output`);

	if (transformerExitCode !== 0) {
		throw new Error(
			`Transformer ${task.data.transformer.id} exited with non-zero status code: ${transformerExitCode}`,
		);
	}

	const outputDir = directory.output(task);

	let outputManifest;
	try {
		outputManifest = JSON.parse(
			await fs.promises.readFile(
				path.join(outputDir, env.outputManifestFilename),
				'utf8',
			),
		) as OutputManifest;
	} catch (e) {
		e.message = `Could not load output manifest: ${e.message}`;
		throw e;
	}

	await validateOutputManifest(outputManifest, outputDir);

	return outputManifest;
}

async function pushOutput(
	task: TaskContract,
	outputManifest: OutputManifest,
	actorCredentials: ActorCredentials,
) {
	console.log(`[WORKER] Storing transformer output`);

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
		const outputContract = result.contract;
		outputContract.version = inputContract.version;
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
			}
		}
		await jf.storeArtifactContract(outputContract);

		// Store output artifact
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
				`result ${result.contract.slug} contained multiple kinds of artifact`,
			);
		}
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
			console.log(`[WORKER] no artifact for result ${result.contract.slug}`);
		}

		// Create links to output contract
		const contractRepo = await jf.getContractRepository(outputContract);
		await jf.createLink(contractRepo, outputContract, 'contains');
		await jf.createLink(inputContract, outputContract, LinkNames.WasBuiltInto);
		await jf.createLink(task, outputContract, LinkNames.Generated);

		// Mark artifact ready, allowing it to be processed by downstream transformers
		await jf.markArtifactContractReady(outputContract);
	}
}

async function processBackflow(
	task: TaskContract,
	outputManifest: OutputManifest,
) {
	console.log(`[WORKER] Processing backflow`);

	const inputContract = task.data.input;

	// Process backflow from each output contract, to input contract
	for (const result of outputManifest.results) {
		const outputContract = result.contract;
		await jf.updateBackflow(outputContract, inputContract, task);
	}

	// Propagate backflow recursively from input contract upstream
	const backflowLimit = 20;

	const propagate = async (contract: ArtifactContract, step: number = 1) => {
		if (step > backflowLimit) {
			console.log(
				`[WORKER] Backflow propagation limit reached, not following further`,
			);
			return;
		}

		const parent = await jf.getUpstreamContract(contract);
		if (parent) {
			await jf.updateBackflow(contract, parent);
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
	console.log(`[WORKER] Running task ${task.slug}`);

	await validateTask(task);

	// The actor is the loop, and to start with that will always be product-os
	const actorCredentials = await jf.getActorCredentials(task.data.actor);

	await prepareWorkspace(task, actorCredentials);

	const transformerImageRef = await pullTransformer(task, actorCredentials);

	const transformerExitCode = await runTransformer(task, transformerImageRef);

	const outputManifest = await validateOutput(task, transformerExitCode);

	await pushOutput(task, outputManifest, actorCredentials);

	await processBackflow(task, outputManifest);

	await cleanupWorkspace(task);

	console.log(`[WORKER] Task ${task.slug} completed successfully`);
}

/**
 * This function takes an object tree with all string values expected to be
 * base64 encoded secrets and returns the same tree with the values decrypted
 * but again base64 encoded.
 * (The latter allows passing binary secrets as well)
 *
 * @param encryptedSecrets object that only contains string values or other encryptedSecrets objects
 */
export function decryptSecrets(secretsKey: NodeRSA | undefined, sec: any): any {
	if (!sec) {
		return undefined;
	}
	if (!secretsKey) {
		console.log(
			`WARN: no secrets key provided! Will pass along secrets without decryption. Should not happen in production`,
		);
		return sec;
	}
	let result: any = {};
	for (const key of Object.keys(sec)) {
		const val = sec[key];
		if (typeof val === 'string') {
			result[key] = secretsKey.decrypt(val, 'base64');
		} else if (typeof val === 'object') {
			result[key] = exports.decryptSecrets(secretsKey, val);
		} else {
			console.log(`WARN: unknown type in secrets for key ${key}`);
		}
	}
	return result;
}
