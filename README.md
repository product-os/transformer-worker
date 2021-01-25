# transformer-worker

`transformer-worker` is a balena app that enables balena devices to run transformers. Is composed by three services: [fleet-launcher](./fleet-launcher), [transformer-runner](./transformer-runner), and [garbage-collector](./garbage-collector)

## Building and deploying

1. Set the *NPM_TOKEN* value in `.balena/balena.yml`
2. Run `balena push -m <Balena app>`

### fleet-launcher required env-variables
* `FLEET_HOSTNAME`: Url to `transformers-fleet` server
* `FLEET_ENROLL_SECRET`: Secret used to enroll to the device to `transformers-fleet`
* `FLEET_EXTRA_ARGS`: Extra arguments that should be passed to `fleet-launcher` at start time. 

### transformer-runner required env variables
* `JF_API_URL`: Url to the JellyFish API server
* `JF_API_PREFIX`: JellyFish API prefix
* `REGISTRY_URL`: Url to the transformers private registry
* `REGISTRY_PORT`: Port to be used when connecting to the registry. Default: 80

### garbage-collector required env variables
* `GC_MAX_STORAGE_THRESHOLD`: GC will kick in when the disk space is below this threshold
