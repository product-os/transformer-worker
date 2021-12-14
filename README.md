**CI/CD reimagined Balena-style. Reactive. Scalable. Batteries included.**

## Highlights

- **adds CI/CD capabilities to [ProductOS](https://github.com/product-os/)**: using a primitive that we call a "Transformer". 
- **A Transformer is a piece of code, wrapped in a container, that takes input and produces output**: Input and output can be anything but must be described with some our own meta-data format which we call "contracts" and which you typically find in a file called `balena.yml`. Transformers have an input filter, which is a JSON schema which gets matched against any contract that gets picked up by our GitHub integration. If it matches the Transformer gets executed with the input and its contract.

## Motivation

Because other CI/CD systems just didn't cut it...

## Building and deploying

* Run `BALENA_APP=<Balena app> ./push-to-balena.sh`

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

## License

balenaSense is free software, and may be redistributed under the terms specified in the [license](https://github.com/product-os/transformer-worker/blob/master/LICENSE).