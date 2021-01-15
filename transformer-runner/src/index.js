#!/usr/bin/env node

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
    const snooze = ms => new Promise(resolve => setTimeout(resolve, ms));

    while(true) {
        try{
            console.log('[WORKER] Trying to log in...');
            console.log(sdk);
            await sdk.setAuthToken(WORKER_JF_TOKEN);
            const user = await sdk.auth.whoami();
            console.log(user);
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

async function waitForTasks(workerId) {

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

    console.log("about to wait for tasks");
    const stream = await sdk.stream(schema)
    console.log('[WORKER] Waiting for tasks');

    stream.on('update', (update) => {
        if(update.data.after) {
            const taskData = extractTaskData(update.data.after);
            transform(taskData);
        }
    })

    stream.on('streamError', (error) => {
        console.error(error);
    })
}

function extractTaskData(taskData) {
return {
        transformer: taskData.data.transformer,
        input: taskData.data.input,
        actorId: taskData.data.actor,
    };
}

async function transform(task) {
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

async function getActorSlugFromActorId(actorId) {
    const actorCard = await sdk.card.get(actorId);
    return actorCard.slug;
}


async function getSessionTokenFromActorId(actorId) {
    const actorSessionCard = await sdk.card.create({
        type: 'session@1.0.0',
        data: {
            actor: actorId,
        },
    });
    return actorSessionCard.id;
}


async function pullTransformerIfNeeded(transformerReference, actorSlug, sessionToken) {
    console.log(`[WORKER] Pulling transformer ${transformerReference}`);

    const auth = { username: actorSlug, password: sessionToken, serveraddress: buildTransformerRegistryUrl() };

    const pulled = await new Promise((resolve, reject) => {
       docker.pull(transformerReference, { 'authconfig': auth }, (err, stream) => {
            if(err){
                console.log(err);
                return reject(false);
            }
            docker.modem.followProgress(stream, onFinished, onProgress);

            function onFinished(err, output) {
                return resolve(true);
            }

            function onProgress(event) {
                console.log(event.status);
                if(event.hasOwnProperty('progress')){
                    console.log(event.progress);
                }
            }
        });

    });

    return pulled;
}

async function runTransformer(transformerReference, input, actor, sessionToken) {
    const inputAsBase64 = Buffer.from(JSON.stringify(input)).toString('base64');

    const stdout = new streams.WritableStream();
    const stderr = new streams.WritableStream();

    try {
        console.log(`[WORKER] Running transformer ${transformerReference}`);
        const runResult = await docker.run(
            transformerReference,
            [inputAsBase64, actor, sessionToken],
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

function start() {
    loginToJf().then((workerId) => {
        waitForTasks(workerId);
    });
}

if(process.argv[2] === "start"){
    start();
}


exports.start = start
