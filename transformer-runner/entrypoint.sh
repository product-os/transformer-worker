#!/usr/bin/env bash

###################################################
# Old registration flow - to be removed
# Later JF will set device env vars
#  directly during provisioning:
#    - WORKER_JF_USERNAME
#    - WORKER_JF_PASSWORD

# https://raw.githubusercontent.com/concourse/docker-image-resource/master/assets/common.sh
# shellcheck disable=SC1091
source docker-lib

# shellcheck disable=SC2153
docker_registry_mirror=${DOCKER_REGISTRY_MIRROR:-}
insecure_registries=${INSECURE_REGISTRIES:-registry:5000 registry.ly.fish.local:80 registry.ly.fish.local}
# https://docs.docker.com/engine/reference/commandline/dockerd/
max_concurrent_downloads=${MAX_CONCURRENT_DOWNLOADS:-3}
max_concurrent_uploads=${MAX_CONCURRENT_UPLOADS:-5}

TOKEN=$(cat /shared/jf-token)
if [[ -z ${TOKEN} ]]; then
    uuidgen > /shared/jf-token
fi

TOKEN=$(cat /shared/jf-token)
export WORKER_JF_TOKEN="${WORKER_JF_TOKEN:-$TOKEN}"
###################################################

rm -f /var/run/docker.pid

# shellcheck disable=SC2086
start_docker \
  ${max_concurrent_downloads} \
  ${max_concurrent_uploads} \
  "${insecure_registries}" \
  ${docker_registry_mirror}

exec node build/index.js "$@"