import Jellyfish from './jellyfish';
import TransformerRegistry from './transformer-registry';

import * as Docker from 'dockerode';
import * as streams from 'memory-streams';

const WORKER_SLUG = process.env.WORKER_SLUG || '';
const WORKER_JF_TOKEN = process.env.WORKER_JF_TOKEN || '';
const JF_API_URL = process.env.JF_API_URL || '';
const JF_API_PREFIX = process.env.JF_API_PREFIX || '';
const REGISTRY_URL = process.env.REGISTRY_URL || '';
const REGISTRY_PORT = process.env.REGISTRY_PORT;

const transformerCommonEnvVars = [
    `BLUEBIRD_DEBUG=1`,
    `JF_API_URL=${JF_API_URL}`,
    `JF_API_PREFIX=${JF_API_PREFIX}`,
    `REGISTRY_URL=${REGISTRY_URL}`,
    `REGISTRY_PORT=${REGISTRY_PORT}`
];

const docker = new Docker();
const jf = new Jellyfish(JF_API_URL, JF_API_PREFIX, WORKER_JF_TOKEN, WORKER_SLUG)
const transformerRegistry = new TransformerRegistry(REGISTRY_URL, REGISTRY_PORT);

async function start() {
    console.log(`[WORKER] ${WORKER_SLUG} starting...`);
    const workerId = await jf.login()
    
    const taskStream = await jf.getTaskStream(workerId);
    console.log('[WORKER] Waiting for tasks');

    taskStream.on('update', (update: any) => {
        const task = update?.data?.after;
        if(task?.data) {
            processTask({
                transformer: task.data.transformer,
                input: task.data.input,
                actorId: task.data.actor,
            });
        } else {
            console.error(`Update received from task stream with no data`);
        }
    })

    taskStream.on('streamError', (error: Error) => {
        console.error(error);
    })
}

async function processTask(task: any) {
    const transformerId = task.transformer?.id;
    const input = task.input;
    const actorSlug = await jf.getActorSlugFromActorId(task.actorId);
    const actorSessionToken = await jf.getSessionTokenFromActorId(task.actorId);
    
    const transformerImageRef = await transformerRegistry.pullTransformerImage(transformerId, actorSlug, actorSessionToken);
    await runTransformer(transformerImageRef, input, actorSlug, actorSessionToken);
}


async function runTransformer(transformerImageRef: string, input: any, actorSlug: string, sessionToken: string) {
    const inputAsBase64 = Buffer.from(JSON.stringify(input)).toString('base64');

    const stdout = new streams.WritableStream();
    const stderr = new streams.WritableStream();

    try {
        console.log(`[WORKER] Running transformer ${transformerImageRef}`);
        const runResult = await docker.run(
            transformerImageRef,
            [inputAsBase64, actorSlug, sessionToken],
            [stdout, stderr],
            {
                Tty: false,
                Env: transformerCommonEnvVars,
                HostConfig: {
                    Privileged: true
                }
            });

        console.log(JSON.stringify(runResult));
        console.log(`stdout: ${stdout.toString()}`);
        console.log(`stderr: ${stderr.toString()}`);
    }
    catch(err) {
        console.error(err.stack);
    }
}

start();
