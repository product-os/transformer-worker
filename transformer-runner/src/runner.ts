import Jellyfish from './jellyfish';
import Registry from './registry';
import type {
	ActorCredentials,
	TaskContract,
	InputManifest,
	OutputManifest,
	Contract, ArtifactContract,
} from './types';
import { validateTask, validateOutputManifest } from './validation';
import * as fs from 'fs';
import * as path from 'path';
import env from './env';
import { ContainerCreateOptions } from 'dockerode';
import { pathExists } from "./util";
import { LinkNames } from "./enums";
import * as _ from "lodash";

const jf = new Jellyfish(env.jfApiUrl, env.jfApiPrefix);
const registry = new Registry(env.registryHost, env.registryPort);

const directory = {
	input: (task: TaskContract) => path.join(env.inputDir, `task-${task.id}`),
	output: (task: TaskContract) => path.join(env.outputDir, `task-${task.id}`),
};

const createArtifactReference = ({ slug, version }: Contract) => {
	let registryPort = "";
	if (env.registryPort) {
		registryPort = `:${env.registryPort}`;
	}
	return `${env.registryHost}${registryPort}/${slug}:${version}`;
}
const runningTasks = new Set<string>();

export async function initializeRunner() {
	console.log(`[WORKER] starting...`);

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

const acceptTask = async (update: any) => {
	const task: TaskContract = update?.data?.after;
	const taskStartTimestamp = Date.now();
	if (task) {
		if (runningTasks.has(task.id!)) {
			console.log(`[WORKER] WARN the task ${task.id} was already running. Ignoring it`);
			return;
		}
		await jf.setTaskStatusAccepted(task);
		runningTasks.add(task.id!);
		try {
			await runTask(task);
			await jf.setTaskStatusCompleted(task, Date.now() - taskStartTimestamp);
		} catch (e) {
			console.log(`[WORKER] ERROR occurred during task processing: ${e}`);
			await jf.setTaskStatusFailed(task, e.message, Date.now() - taskStartTimestamp);
		} finally {
			runningTasks.delete(task.id!);
		}
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
	await registry.pullArtifact(createArtifactReference(inputContract), inputArtifactDir, { username: credentials.slug, password: credentials.sessionToken });

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
		{ username: actorCredentials.slug, password: actorCredentials.sessionToken },
	);

	return transformerImageRef;
}

async function runTransformer(task: TaskContract, transformerImageRef: string) {
	console.log(`[WORKER] Running transformer image ${transformerImageRef}`);

	const docker = registry.docker;

	//HACK - dockerode closes the stream unconditionally
	process.stdout.end = () => { }
	process.stderr.end = () => { }

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

	console.log("[WORKER] run result", JSON.stringify(runResult));

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
		_.set(outputContract, "data.$transformer.artifactReady", false);
		const baseSlug = inputContract.data.$transformer.baseSlug;
		// If baseSlug exists, then set deterministic slug, 
		// otherwise keep transformer-defined slug
		if(baseSlug) {
			outputContract.data.$transformer.baseSlug = baseSlug;
			outputContract.slug = `${outputContract.type}-${baseSlug}`;
		}
		await jf.storeArtifactContract(outputContract);

		// Store output artifact
		const artifactReference = createArtifactReference(outputContract);
		const authOptions = { username: actorCredentials.slug, password: actorCredentials.sessionToken };
		if (result.imagePath && result.artifactPath) {
			throw new Error(`result ${result.contract.slug} contained an artifact and an image`);
		}
		if (result.imagePath) {
			await registry.pushImage(
				artifactReference,
				path.join(outputDir, result.imagePath),
				authOptions,
			)
		} else if (result.artifactPath) {
			await registry.pushArtifact(
				artifactReference,
				path.join(outputDir, result.artifactPath),
				authOptions,
			);
		} else {
			console.log(`[WORKER] no artifact for result ${result.contract.slug}`);
		}

		// Create links to output contract
		const contractRepo = await jf.getContractRepository(outputContract)
		await jf.createLink(contractRepo, outputContract, 'contains')
		await jf.createLink(inputContract, outputContract, LinkNames.WasBuiltInto);
		await jf.createLink(task, outputContract, LinkNames.Generated);

		// Mark artifact ready, allowing it to be processed by downstream transformers
		await jf.markArtifactContractReady(outputContract);
	}
}

async function processBackflow(task: TaskContract, outputManifest: OutputManifest) {
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
			console.log(`[WORKER] Backflow propagation limit reached, not following further`);
			return;
		}

		const parent = await jf.getUpstreamContract(contract);
		if (parent) {
			await jf.updateBackflow(contract, parent);
			await propagate(parent, step + 1);
		}
	}

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
