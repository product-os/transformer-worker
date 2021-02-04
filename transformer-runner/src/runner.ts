import Jellyfish from './jellyfish';
import Registry from './registry';
import type {
	ActorCredentials,
	TaskContract,
	InputManifest,
	OutputManifest,
} from './types';
import { validateTask, validateOutputManifest } from './validation';

import * as fs from 'fs';
import * as streams from 'memory-streams';
import * as path from 'path';
import env from './env';
import { ContainerCreateOptions } from 'dockerode';

const jf = new Jellyfish(env.jfApiUrl, env.jfApiPrefix);
const registry = new Registry(env.registryHost, env.registryPort);

export async function init() {
	console.log(`[WORKER] ${env.workerSlug} starting...`);

	await jf.init();
	await jf.login(env.workerSlug, env.workerJfToken);
	await jf.listenForTasks(runTask);

	console.log('[WORKER] Waiting for tasks');
}

async function runTask(task: TaskContract) {
	console.log(`[WORKER] Running task ${task.slug}`);

	// Initialize task
	const actorCredentials = await initTask(task);

	// Prepare Input
	await prepareInput(task, actorCredentials);

	// Pull transformer
	const transformerImageRef = await pullTransformer(task, actorCredentials);

	// Run transformer
	const transformerExitCode = await runTransformer(task, transformerImageRef);

	// Validate output (status code, output artifact/contract)
	const outputManifest = await validateOutput(task, transformerExitCode);

	// Push output
	await pushOutput(task, outputManifest, actorCredentials);

	// Finalize task
	await finalizeTask(task);
}

async function initTask(task: TaskContract) {
	// Validate task (sanity check)
	await validateTask(task);

	// Create task input/output dirs
	await fs.promises.mkdir(getDir.input(task), { recursive: true });
	await fs.promises.mkdir(getDir.output(task), { recursive: true });

	// Get actor credentials
	const actorCredentials = await jf.getActorCredentials(task.data.actor);

	return actorCredentials;
}

async function prepareInput(
	task: TaskContract,
	_actorCredentials: ActorCredentials,
) {
	console.log(`[WORKER] Preparing transformer input`);

	const inputDir = getDir.input(task);
	const inputArtifactDir = path.join(getDir.input(task), env.artifactFilename);

	const inputContract = task.data.input;

	// Add input artifact
	await registry.pullArtifact(inputContract, inputArtifactDir);

	// Add input manifest
	const inputManifest: InputManifest = {
		input: {
			contract: inputContract,
			artifactPath: env.artifactFilename
		},
	};
	const manifestJson = JSON.stringify(inputManifest, null, 4);
	await fs.promises.writeFile(
		path.join(inputDir, env.inputManifestFilename),
		manifestJson,
		'utf8',
	);
}

async function pullTransformer(
	task: TaskContract,
	actorCredentials: ActorCredentials,
) {
	// TODO: Check why using id, and not slug+version
	const { slug, version } = task.data.transformer
	const transformerImageReference = `${slug}:${version}`;
	console.log(`[WORKER] Pulling transformer ${transformerImageReference}`);
	const transformerImageRef = await registry.pullTransformerImage(
		transformerImageReference,
		actorCredentials,
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
					`${path.resolve(getDir.input(task))}:/input/:ro`,
					`${path.resolve(getDir.output(task))}:/output/`,
				]
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

	const outputDir = getDir.output(task);

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
	_actorCredentials: ActorCredentials,
) {
	console.log(`[WORKER] Storing transformer output`);

	const outputDir = getDir.output(task);

	for (const result of outputManifest.results) {
		// Because storing an artifact requires an existing contract,
		// but a contact may trigger another transformer,
		// this must be done in following order:
		// - store output contract (artifactReady: false)
		// - push artifact
		// - update output contract (artifactReady: true)

		// Store output contract
		const outputContract = result.contract;
		const outputContractId = await jf.storeArtifactContract(outputContract);

		if (result.artifactPath) {
			// Store output artifact
			await registry.pushArtifact(
				outputContract,
				path.join(outputDir, env.artifactFilename),
			);
		}

		// Mark contract as ready
		await jf.markArtifactContractReady(outputContractId!, outputContract.type);
	}
}

async function finalizeTask(task: TaskContract) {
	// Delete input/output dir
	await fs.promises.rmdir(getDir.input(task), { recursive: true });
	await fs.promises.rmdir(getDir.output(task), { recursive: true });

	// TODO: Signal JF task complete

	console.log(`[WORKER] Task ${task.slug} completed successfully`);
}

const getDir = {
	input: (task: TaskContract) => path.join(env.inputDir, `task-${task.id}`),
	output: (task: TaskContract) => path.join(env.outputDir, `task-${task.id}`),
};
