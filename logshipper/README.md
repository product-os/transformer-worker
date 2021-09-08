# logshipper

A log collection agent that ships logs from the balena engine
to a log aggregation service.

The agent currently ships logs to the following log aggregation services:
- Vector


## Usage

To use this image, create a service in your docker-compose.yml file as shown below:
```
logshipper:
    image: balenablocks/logshipper:<device arch name>
    labels:
      io.balena.features.journal-logs: '1'
    restart: unless_stopped
    volumes:
      - logshipper:/var/lib/logshipper
```

You can also set your docker-compose.yml to build a Dockerfile.template file, and use the build variable %%BALENA_ARCH%% so that the correct image is automatically built for your device arch (see supported architectures):


*docker-compose.yml*:
```
version: "2.1"

services:
  logshipper:
    build: ./
    labels:
      io.balena.features.journal-logs: '1'
    restart: unless_stopped
    volumes:
      - logshipper:/var/lib/logshipper
```


*Dockerfile.template*
```
FROM balenablocks/logshipper:%%BALENA_ARCH%%
```

`balenablocks/logshipper` is built for the following archs:

- `aarch64`
- `armv7hf`
- `amd64`


## Customisation

`balenablocks/logshipper` can be configured via the following variables:

| Environment Variable        | Default| Description                                          |
| --------------------------- | ------ | -----------------------------------------------------|
| `CONSOLE`                   | `true` | Sends collected logs to the console                  |
| `VECTOR_ENDPOINT`           | ``     | The endpoint of the vector log aggregator            |
| `VECTOR_TLS_CA_FILE`        | ``     | An additional CA certificate file encoded in base 64 |
| `VECTOR_VERIFY_CERTIFICATE` | `true` | Enables TLS certificate verification.                |

You can refer to the [docs](https://www.balena.io/docs/learn/manage/serv-vars/#environment-and-service-variables) on how to set environment or service variables

Alternatively, you can set them in the `docker-compose.yml` or `Dockerfile.template` files.
