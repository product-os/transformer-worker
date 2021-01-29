import Jellyfish from './jellyfish';
import Registry from './registry';
import type { ActorCredentials, TaskContract, InputManifest, OutputManifest } from './types';

import * as fs from 'fs';
import * as Docker from 'dockerode';
import * as streams from 'memory-streams';
import * as path from 'path';

const WORKER_SLUG = process.env.WORKER_SLUG || '';
const WORKER_JF_TOKEN = process.env.WORKER_JF_TOKEN || '';
const JF_API_URL = process.env.JF_API_URL || '';
const JF_API_PREFIX = process.env.JF_API_PREFIX || '';
const REGISTRY_HOST = process.env.REGISTRY_HOST || '';
const REGISTRY_PORT = process.env.REGISTRY_PORT;

const INPUT_DIR = 'input';
const OUTPUT_DIR = 'output';
const INPUT_MANIFEST_FILENAME = 'input.json';
const OUTPUT_MANIFEST_FILENAME = 'output.json';
const CONTRACT_FILENAME = 'contract.json';
const ARTIFACT_FILENAME = 'artifact';

const docker = new Docker();
const jf = new Jellyfish(JF_API_URL, JF_API_PREFIX);
const registry = new Registry(REGISTRY_HOST, REGISTRY_PORT);

export async function init() {
    console.log(`[WORKER] ${WORKER_SLUG} starting...`)
    
    await jf.login(WORKER_SLUG, WORKER_JF_TOKEN);
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
    await validateOutput(task, transformerExitCode);
    
    // Push output
    await pushOutput(task, actorCredentials);
    
    // Finalize task
    await finalizeTask(task);
}

async function initTask(task: TaskContract) {
    // Create task input/output dirs
    await fs.promises.mkdir(getDir.input(task), { recursive: true });
    await fs.promises.mkdir(getDir.output(task), { recursive: true });
    
    // Get actor credentials
    const actorCredentials = await jf.getActorCredentials(task.data.actor);
    
    return actorCredentials;
}

async function prepareInput(task: TaskContract, _actorCredentials: ActorCredentials) {
    console.log(`[WORKER] Preparing transformer input`);
    
    const inputDir = getDir.input((task));
    const inputContract = task.data.input;
    
    // Add input artifact
    await registry.pullArtifact(inputContract, inputDir);
    
    // Add input manifest
    const inputManifest : InputManifest = {
        input : {
            contract : inputContract,
            artifactPath : ARTIFACT_FILENAME,
        }
    }
    const manifestJson = JSON.stringify(inputManifest, null, 4);
    await fs.promises.writeFile(path.join(inputDir, INPUT_MANIFEST_FILENAME), manifestJson, 'utf8')
}

async function pullTransformer(task: TaskContract, actorCredentials: ActorCredentials) {
    const transformerId = task.data.transformer.id;
    console.log(`[WORKER] Pulling transformer ${transformerId}`);
    const transformerImageRef = await registry.pullTransformerImage(transformerId, actorCredentials);
    
    return transformerImageRef;
}

async function runTransformer(task: TaskContract, transformerImageRef: string) {
    console.log(`[WORKER] Running transformer image ${transformerImageRef}`);
    
    const stdout = new streams.WritableStream();
    const stderr = new streams.WritableStream();
    
    const runResult = await docker.run(
        transformerImageRef,
        [],
        [stdout, stderr],
        {
            Tty: false,
            Env: {
                INPUT: `/input/${INPUT_MANIFEST_FILENAME}`,
                OUTPUT: `/output/${OUTPUT_MANIFEST_FILENAME}`,
            },
            HostConfig: {
                Privileged: true
            },
            Mounts: [
                {
                    Type: 'bind',
                    Source: path.resolve(getDir.input(task)),
                    Destination: '/input',
                    RW: false,
                },
                {
                    Type: 'bind',
                    Source: path.resolve(getDir.output(task)),
                    Destination: '/output',
                    RW: true,
                }
            ],
        });

    // What to do with stdout/stderr?  For now, leaving as it was
    console.log(JSON.stringify(runResult));
    console.log(`stdout: ${stdout.toString()}`);
    console.log(`stderr: ${stderr.toString()}`);

    const output = runResult[0];
    // const container = runResult[1];

    return output.StatusCode;
}

async function validateOutput(_task: TaskContract, _transformerExitCode: number) {
    console.log(`[WORKER] Validating transformer output`);
    // TODO:
    //  Check exit code
    //  Check output manifest
    //  Check output artifact(s)
}

async function pushOutput(task: TaskContract, _actorCredentials: ActorCredentials) {
    console.log(`[WORKER] Storing transformer output`);
    
    const outputDir = getDir.output(task);
    
    // Read output manifest
    const outputManifest = JSON.parse(
        await fs.promises.readFile(path.join(outputDir, OUTPUT_MANIFEST_FILENAME), 'utf8')
    ) as OutputManifest;
    
    for (const result of outputManifest.results) {
        // Because storing an artifact requires an existing contract, 
        // but a contact may trigger another transformer,
        // this must be done in following order:
        // - store output contract (should_trigger: false)
        // - push artifact
        // - update output contract (should_trigger_true)
        
        // Store output contract
        const outputContract = result.contract;
        const outputContractId = await jf.storeArtifactContract(outputContract);

        // Store output artifact
        await registry.pushArtifact(outputContract, path.join(outputDir, CONTRACT_FILENAME));

        // Update output contract
        await jf.updateArtifactContract(outputContractId);
    }
}

async function finalizeTask(task: TaskContract) {
    // Delete input/output dir
    await fs.promises.rmdir(getDir.input(task), { recursive: true });
    await fs.promises.rmdir(getDir.output(task), { recursive: true });
    
    console.log(`[WORKER] Task ${task.slug} completed successfully`);
}

export const getDir = {
    input: (task: TaskContract) => path.join(INPUT_DIR, `task-${task.id}`),
    output: (task: TaskContract) => path.join(OUTPUT_DIR,`task-${task.id}`),
}
