#!/bin/sh

###################################################
# Old registration flow - to be removed
# Later JF will set device env vars
#  directly during provisioning:
#    - WORKER_JF_USERNAME
#    - WORKER_JF_PASSWORD

TOKEN=$(cat /shared/.token)
if [ "x${TOKEN}" == "x" ]; then
    uuidgen > /shared/.token
fi

TOKEN=$(cat /shared/.token)
export WORKER_JF_TOKEN="${WORKER_JF_TOKEN:-$TOKEN}"
###################################################

(
    while true; do
        rm -f /var/run/docker.pid
        dockerd >/dev/null 2>&1 # too much spam
        echo "ERROR dockerd exited! Will retry"
        sleep 1
    done
)& 

while ! docker info >/dev/null 2>&1; do sleep 1s; done

exec node build/index.js
