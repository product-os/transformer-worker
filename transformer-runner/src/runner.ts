import Jellyfish from './jellyfish';
import Registry from './registry';
import type {
	ActorCredentials,
	TaskContract,
	InputManifest,
	OutputManifest,
	Contract,
} from './types';
import { validateTask, validateOutputManifest } from './validation';

import * as fs from 'fs';
import * as streams from 'memory-streams';
import * as path from 'path';
import env from './env';
import { ContainerCreateOptions } from 'dockerode';
import { F_OK } from 'constants';

const jf = new Jellyfish(env.jfApiUrl, env.jfApiPrefix);
const registry = new Registry(env.registryHost, env.registryPort);

const directory = {
	input: (task: TaskContract) => path.join(env.inputDir, `task-${task.id}`),
	output: (task: TaskContract) => path.join(env.outputDir, `task-${task.id}`),
};

const createArtifactReference = ({ slug, version }: Contract) => `${slug}:${version}`;

const runningTasks = new Set<string>();

export async function initializeRunner() {
	console.log(`[WORKER] ${env.workerSlug} starting...`);

	await jf.login(env.workerSlug, env.workerJfToken);
	await jf.listenForTasks(acceptTask);

	console.log('[WORKER] Waiting for tasks');
}

const acceptTask = async (update: any) => {
	const task: TaskContract = update?.data?.after;
	if (task) {
		if (runningTasks.has(task.id!)) {
			console.log(`[WORKER] WARN the task ${task.id} was already running. Ignoring it`)
			return;
		}
		await jf.acknowledgeTask(task);
		runningTasks.add(task.id!);
		try {
			await runTask(task)
			await jf.confirmTaskCompletion(task);
		} catch (e) {
			console.log(`[WORKER] ERROR occured during task processing: ${e}`);
			await jf.reportTaskFailed(task);
		} finally {
			runningTasks.delete(task.id!);
		}
	}
}

const pathExists = async (path: string) => {
	try {
		await fs.promises.access(path, F_OK);
		return true;
	} catch {
		return false;
	}
}

async function prepareWorkspace(task: TaskContract, credentials: ActorCredentials) {
	console.log(`[WORKER] Preparing transformer workspace`);

	const outputDir = directory.output(task);
	const inputDir = directory.input(task);

	if (await pathExists(outputDir)) {
		console.log(`[WORKER] WARN output directory already existed (from previous run?) - deleting it`);
		await fs.promises.rm(outputDir, { recursive: true, force: true });
	}
	if (await pathExists(inputDir)) {
		console.log(`[WORKER] WARN input directory already existed (from previous run?) - deleting it`);
		await fs.promises.rm(inputDir, { recursive: true, force: true });
	}

	const inputArtifactDir = path.join(
		inputDir,
		env.artifactDirectoryName,
	);

	await fs.promises.mkdir(inputArtifactDir, { recursive: true });
	await fs.promises.mkdir(outputDir, { recursive: true });

	const inputContract = task.data.input;
	await registry.pullArtifact(createArtifactReference(inputContract), inputArtifactDir, { user: credentials.slug, password: credentials.sessionToken });

	// Add input manifest
	const inputManifest: InputManifest = {
		input: {
			contract: inputContract,
			artifactPath: env.artifactDirectoryName,
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
	const transformerImageReference = createArtifactReference(task.data.transformer);
	console.log(`[WORKER] Pulling transformer ${transformerImageReference}`);
	const transformerImageRef = await registry.pullImage(
		transformerImageReference,
		{ user: actorCredentials.slug, password: actorCredentials.sessionToken },
	);

	return transformerImageRef;
}

async function runTransformer(task: TaskContract, transformerImageRef: string) {
	console.log(`[WORKER] Running transformer image ${transformerImageRef}`);

	const stdout = new streams.WritableStream();
	const stderr = new streams.WritableStream();

	const docker = registry.docker;

	const runResult = await docker.run(
		transformerImageRef,
		[],
		[stdout, stderr],
		{
			Tty: false,
			Env: [
				`INPUT=/input/${env.inputManifestFilename}`,
				`OUTPUT=/output/${env.outputManifestFilename}`,
			],
			Volumes: {
				'/input/': {},
				'/output/': {},
			},
			HostConfig: {
				Privileged: true,
				Binds: [
					`${path.resolve(directory.input(task))}:/input/:ro`,
					`${path.resolve(directory.output(task))}:/output/`,
				],
			},
		} as ContainerCreateOptions,
	);

	// What to do with stdout/stderr?  For now, leaving as it was
	console.log(JSON.stringify(runResult));
	console.log(`stdout: ${stdout.toString()}`);
	console.log(`stderr: ${stderr.toString()}`);

	const output = runResult[0];
	// const container = runResult[1];

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

	for (const result of outputManifest.results) {
		// Because storing an artifact requires an existing contract,
		// but a contact may trigger another transformer,
		// this must be done in following order:
		// - store output contract (artifactReady: false)
		// - push artifact
		// - update output contract (artifactReady: true)

		// Store output contract
		const outputContract = result.contract;
		// TODO: Do upsert instead of insert.
		const outputContractId = await jf.storeArtifactContract(outputContract);

		if (result.artifactPath) {
			// Store output artifact
			await registry.pushArtifact(
				createArtifactReference(outputContract),
				path.join(outputDir, env.artifactDirectoryName),
				{ user: actorCredentials.slug, password: actorCredentials.sessionToken }
			);
		}

		await jf.markArtifactContractReady(outputContractId!, outputContract.type);
	}
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

	await cleanupWorkspace(task);

	console.log(`[WORKER] Task ${task.slug} completed successfully`);
}
