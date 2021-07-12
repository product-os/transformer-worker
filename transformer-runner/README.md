# transformer-runner

# TO BE UPDATED

`transformer-runner` is the service in charge of running transformers.
At start time, it logs into JellyFish as a `transformer-worker` actor and waits for tasks. A task defines what transformer should be run and how.

In order to be able to authenticate to JellyFish, `transformer-runner` generates a session token which `fleet-launcher` exposes to [transformers-fleet](https://github.com/product-os/transformers-fleet/) as an env variable. This session token is shared to `fleet-launcher` through a hidden file in a shared volume.

The complete workflow is perfectly explained in [this diagram](https://jel.ly.fish/workflow-jellyfish-transformer-worker-authentication-flow-89c36716-cec2-4d50-9e71-a7cac3f478ef);

In a nutshell, when the `transformer-runner` receives a task it:
1. Extracts the relevant transformer data (transformer image reference, input contract, and actor).
1. Pulls the transformer image from our private registry.
1. Creates a session for the actor that owns the task.
1. Runs the transformer.
