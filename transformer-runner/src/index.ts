import Jellyfish from './jellyfish';
import Registry from './registry';
import type { ActorCredentials, TaskContract } from './types';

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

const docker = new Docker();
const jf = new Jellyfish(JF_API_URL, JF_API_PREFIX);
const registry = new Registry(REGISTRY_HOST, REGISTRY_PORT);

async function init() {
    console.log(`[WORKER] ${WORKER_SLUG} starting...`);
    
    // Login to JF
    const workerId = await jf.login(WORKER_SLUG, WORKER_JF_TOKEN);
    
    // Get task stream, and await tasks
    const taskStream = await jf.getTaskStream(workerId);
    taskStream.on('update', runTask);

    taskStream.on('streamError', (error: Error) => {
        console.error(error);
    })

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

async function prepareInput(_task: TaskContract, _actorCredentials: ActorCredentials) {
    console.log(`[WORKER] Preparing transformer input`);

    // Add input contract

    // Add input artifact
}

async function pullTransformer(task: TaskContract, actorCredentials: ActorCredentials) {
    const transformerId = task.data.transformer.id;
    const transformerImageRef = await registry.pullTransformerImage(transformerId, actorCredentials);
    
    return transformerImageRef;
}

async function runTransformer(task: TaskContract, transformerImageRef: string) {
    const stdout = new streams.WritableStream();
    const stderr = new streams.WritableStream();

    console.log(`[WORKER] Running transformer ${transformerImageRef}`);
    const runResult = await docker.run(
        transformerImageRef,
        [],
        [stdout, stderr],
        {
            Tty: false,
            Env: {
                IN_DIR: '/in',
                OUT_DIR: '/out'
            },
            HostConfig: {
                Privileged: true
            },
            Mounts: [
                {
                    Type: 'bind',
                    Source: path.resolve(getDir.input(task)),
                    Destination: '/in',
                    RW: false,
                },
                {
                    Type: 'bind',
                    Source: path.resolve(getDir.output(task)),
                    Destination: '/out',
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
}

async function pushOutput(_task: TaskContract, _actorCredentials: ActorCredentials) {
    console.log(`[WORKER] Storing transformer output`);

    // Because storing an artefact requires an existing contract, 
    // but a contact may trigger another transformer,
    // this must be done in following order:
    // - store output contract (should_trigger: false)
    // - push artifact
    // - update output contract (should_trigger_true)

    // Store output contract
    // jf.storeArtifactContract

    // Store output artifact
    // registry.pushArtifact

    // Update output contract
    // jf.updateArtifactContract
}

async function finalizeTask(task: TaskContract) {
    // Delete input/output dir
    await fs.promises.rmdir(getDir.input(task), { recursive: true });
    await fs.promises.rmdir(getDir.output(task), { recursive: true });
    
    console.log(`[WORKER] Task ${task.slug} completed successfully`);
}

const getDir = {
    input: (task: TaskContract) => path.join(INPUT_DIR, `task-${task.id}`),
    output: (task: TaskContract) => path.join(OUTPUT_DIR,`task-${task.id}`),
}

init();
