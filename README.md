# transformer-worker

`transformer-worker` is a balena app that enables balena devices to run transformers. Is composed by three services: [fleet-launcher](./fleet-launcher), [transformer-runner](./transformer-runner), and [docuum](./docuum)

## Building and deploying

1. Set the *NPM_TOKEN* value in `.balena/balena.yml`
2. Run `balena push -m <Balena app>`

### fleet-launcher required env-variables
* `FLEET_HOSTNAME`: Url to `transformers-fleet` server
* `FLEET_ENROLL_SECRET`: Secret used to enroll to the device to `transformers-fleet`
* `FLEET_EXTRA_ARGS`: Extra arguments that should be passed to `fleet-launcher` at start time. 

### transformer-worker required env variables
* `JF_API_URL`: Url to the JellyFish API server
* `JF_API_PREFIX`: JellyFish API prefix
* `REGISTRY_URL`: Url to the transformers private registry
* `REGISTRY_PORT`: Port to be used when connecting to the registry. Default: 80

### docuum required env variables
* `DOCUUM_MAX_STORAGE_THRESHOLD`: Docuum will kick in when the disk space is below this threshold
