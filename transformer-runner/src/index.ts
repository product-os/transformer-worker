const getSdk = require('@balena/jellyfish-client-sdk').getSdk;
const Docker = require('dockerode');
const streams = require('memory-streams');

const LOGIN_INTERVAL_SECS=5
const WORKER_SLUG = process.env.WORKER_SLUG;
const WORKER_JF_TOKEN = process.env.WORKER_JF_TOKEN;

const JF_API_URL = process.env.JF_API_URL || '';
const JF_API_PREFIX = process.env.JF_API_PREFIX || '';
const REGISTRY_URL = process.env.REGISTRY_URL || '';
const REGISTRY_PORT = process.env.REGISTRY_PORT || '';

const sdk = getSdk({apiUrl: JF_API_URL, apiPrefix: JF_API_PREFIX});
const docker = new Docker();

const transformerCommonEnvVariables = [
    `BLUEBIRD_DEBUG=1`,
    `JF_API_URL=${JF_API_URL}`,
    `JF_API_PREFIX=${JF_API_PREFIX}`,
    `REGISTRY_URL=${REGISTRY_URL}`,
    `REGISTRY_PORT=${REGISTRY_PORT}`
];

async function loginToJf() {
    const snooze = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    console.log('[WORKER] Logging in...');
    while(true) {
        try{
            await sdk.setAuthToken(WORKER_JF_TOKEN);
            const user = await sdk.auth.whoami();
            if(user && user.slug === WORKER_SLUG){
                console.log('[WORKER] Logged in');
                return user.id;
            }else{
                console.log(`[WORKER] WARNING!! Unexpected user slug '${user.slug}' received. Expected: '${WORKER_SLUG}'`);
            }
        }catch(e) {
            console.log(e.stack);
            await snooze(LOGIN_INTERVAL_SECS * 1000);
        }
    }
}

async function waitForTasks(workerId: string) {

    const schema ={
        $$links: {
            'is owned by': {
                type: 'object',
                properties: {
                    id: {
                        const: workerId
                    }
                }
            }
        },
        type: 'object',
        properties: {
            type: {
                const: 'task@1.0.0'
            }
        }
    };

    const stream = await sdk.stream(schema)
    console.log('[WORKER] Waiting for tasks');

    stream.on('update', (update: any) => {
        if(update.data.after) {
            const taskData = extractTaskData(update.data.after);
            transform(taskData);
        }
    })

    stream.on('streamError', (error: Error) => {
        console.error(error);
    })
}

function extractTaskData(taskData: any) {
    return {
            transformer: taskData.data.transformer,
            input: taskData.data.input,
            actorId: taskData.data.actor,
        };
}

async function transform(task: any) {
    const transformer = task.transformer;
    const input = task.input;
    const actorSlug = await getActorSlugFromActorId(task.actorId);
    const actorSessionToken = await getSessionTokenFromActorId(task.actorId);
    let transformerReference = `${buildTransformerRegistryUrl()}/${transformer.id}`;
    if(await pullTransformerIfNeeded(transformerReference, actorSlug, actorSessionToken)){
        await runTransformer(transformerReference, input, actorSlug, actorSessionToken);
    }
}


function buildTransformerRegistryUrl() {
    let repo = (REGISTRY_URL && REGISTRY_PORT) ? `${REGISTRY_URL}:${REGISTRY_PORT}` : REGISTRY_URL;
    return repo;
}

async function getActorSlugFromActorId(actorId: string) {
    const actorCard = await sdk.card.get(actorId);
    return actorCard.slug;
}


async function getSessionTokenFromActorId(actorId: string) {
    const actorSessionCard = await sdk.card.create({
        type: 'session@1.0.0',
        data: {
            actor: actorId,
        },
    });
    return actorSessionCard.id;
}


async function pullTransformerIfNeeded(transformerReference: any, actorSlug: string, sessionToken: string) {
    console.log(`[WORKER] Pulling transformer ${transformerReference}`);

    const auth = { username: actorSlug, password: sessionToken, serveraddress: buildTransformerRegistryUrl() };

    const pulled = await new Promise((resolve, reject) => {
       docker.pull(transformerReference, { 'authconfig': auth }, (err: Error, stream: any) => {
            if(err){
                console.log(err);
                return reject(false);
            }
            docker.modem.followProgress(stream, onFinished, onProgress);

            function onFinished(_err: Error, _output: any) {
                return resolve(true);
            }

            function onProgress(event: any) {
                console.log(event.status);
                if(event.hasOwnProperty('progress')){
                    console.log(event.progress);
                }
            }
        });

    });

    return pulled;
}

async function runTransformer(transformerReference: any, input: any, actorSlug: string, sessionToken: string) {
    const inputAsBase64 = Buffer.from(JSON.stringify(input)).toString('base64');

    const stdout = new streams.WritableStream();
    const stderr = new streams.WritableStream();

    try {
        console.log(`[WORKER] Running transformer ${transformerReference}`);
        const runResult = await docker.run(
            transformerReference,
            [inputAsBase64, actorSlug, sessionToken],
            [stdout, stderr],
            {
                Tty: false,
                Env: transformerCommonEnvVariables,
                HostConfig: {
                    Privileged: true
                }
            });

        console.log(JSON.stringify(runResult));
        console.log(`stdout: ${stdout.toString()}`);
        console.log(`stderr: ${stderr.toString()}`);

    }catch(err) {
        console.log(err.stack);
    }
}


loginToJf().then((workerId) => {
    waitForTasks(workerId);
});
