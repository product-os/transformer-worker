#!/bin/sh

if [ ! -e /shared/.token ]; then
    uuidgen > /shared/.token
fi

TOKEN=$(cat /shared/.token)
export WORKER_JF_TOKEN="${WORKER_JF_TOKEN:-$TOKEN}"

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
