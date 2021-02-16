#!/bin/sh

###################################################
# Old registration flow - to be removed
# Later JF will set device env vars
#  directly during provisioning:
#    - WORKER_JF_USERNAME
#    - WORKER_JF_PASSWORD
if [ ! -e /shared/.token ]; then
    uuidgen > /shared/.token
fi

TOKEN=$(cat /shared/.token)
export WORKER_JF_TOKEN="${WORKER_JF_TOKEN:-$TOKEN}"
###################################################

export WORKER_SLUG="transformer-worker-${BALENA_DEVICE_UUID}"

(
    while true; do
        rm -f /var/run/docker.pid
        dockerd
        echo "ERROR dockerd exited! Will retry"
        sleep 1
    done
)& 

sleep 2
npm start
