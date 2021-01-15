# fleet-launcher

JellyFish is the one that decides on which `transformer-worker` a transformer should be run. It makes the decision based on the system state of each worker (what's the CPU load, is the transformer in the cache, does it have enough free space, etc). Such information is provided by [transformerst-fleet](https://github.com/product-os/transformers-fleet/) at defined intervals.

In order to get system information from the device, `transformer-worker` uses [OsQuery](https://osquery.io/). OsQuery allows us to query the device system information using basic SQL commands. We deploy and manage OsQuery using [fleet-launcher](https://www.kolide.com/launcher/), because it offers tight and easy integration with **Fleet**, the OsQuery manager we use in our [transformers-fleet](https://github.com/product-os/transformers-fleet/) project.



## Limitations

With the current implementation, OsQuery is not able to retrieve certain system information from the host, like running processes, network interfaces, or the hostname, which is a problem because we need to expose the Balena device UUID to `transformers-fleet` so that it can be provided to JellyFish.

The problem is that OsQuery retrieves this information from the host `/proc` filesystem and, although the supervisor supports overwriting the container's `/proc` filesystem with the host's (using the `io.balena.features.procfs` label), this breaks `fleet-launcher`. It turns out that `fleet-launcher` spawns a watchdog that monitors itself by its PID through `/proc`. Because the container's `/proc` mismatches with the container's process space (because it refers to the host's process space), the watchdog cannot find the process and therefore thinks that `fleet-launcher` is constantly dying so it keeps on re-spawning it until the kernel's process space exhausts.

For more detailed information about this problem, have a look at this [Flowdock thread.](https://www.flowdock.com/app/rulemotion/r-architecture/threads/wTvRdMcIoXC6R-7S1Ew3YOS6dqr?filter=search&query=osquery)

Some solutions would be:

* Bind-mount the hosts `/proc` in a different folder and then write a OsQuery extension to read from it. The supervisor doesn't support bind-mounts at the moment, so we'd need to use a modified version.
* Use `fleet-launcher` as system app/host extension. Although **this is the preferred solution**, the feature is not ready at the moment of this writing.

The current workaround is to request the device UUID to the supervisor and then set it as an env variable. In this way, it can be retrieved by [transformers-fleet](https://github.com/product-os/transformers-fleet/).
