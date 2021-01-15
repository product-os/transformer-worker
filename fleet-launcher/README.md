
# fleet-launcher

JellyFish is the one that decides on which `transformer-worker` a transformer should be run. It makes the decision based on the system state of each  worker (what's the cpu load, is the transformer in cache, does it have enough free space, etc). Such information is provided by [transformerst-fleet](https://github.com/product-os/transformers-fleet/) at defined intervals.

In order to get system information from the device, `transformer-worker` uses [OsQuery](https://osquery.io/). OsQuery allows us to query device's system information using basic SQL command. We deploy and manage OsQuery using [fleet-launcher](https://www.kolide.com/launcher/), because it offers a tigh and easy integration with **Fleet**, the OsQuery manager we use in our [transformers-fleet](https://github.com/product-os/transformers-fleet/) project.



## Limitations (Review)

With the current implementation, OsQuery is not able to retrieve certain system information, like running processes, network interfaces or the hostname. This is because it needs access to the host's `/proc` filesystem. 

Although the supervisor supports overwritting the container's `/proc` filesystem with the host's (using the `io.balena.features.procfs` label), this breaks `fleet-launcher`. It turns out that `fleet-launcher` spawns a watchdog that monitors itself by its PID through `/proc`. Since `/proc` mismatches the container's process space (because it refers to the host's process space), the watchdog thinks that the process is always dead and re-spawns it all the time, exhausting the kernel's process pool.

For more detailed information about this problem, have a look at this [Flowdock thread.](https://www.flowdock.com/app/rulemotion/r-architecture/threads/wTvRdMcIoXC6R-7S1Ew3YOS6dqr?filter=search&query=osquery)

Some solutions would be:

* Bind-mount the hosts procfs in a different folder and then write a osquery extension to read from it. The supervisor doesn't support bind-mounts at the moment, so we'd need to use a modified version.
* Use `fleet-launcher` as system app/host extension. Although **this is the preferred solution**, it is not ready at the moment of this writting.

Since we need to know the device UUID, prior starting `fleet-launcher`, we first ask the supervisor for the UUID and then set it as an env variable. In this way, it can be retrieved by [transformers-fleet](https://github.com/product-os/transformers-fleet/).
