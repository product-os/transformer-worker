#!/bin/sh

if [ ! -e /shared/.token ]; then
    uuidgen > /shared/.token
fi

export WORKER_JF_TOKEN=$(cat /shared/.token)
export WORKER_SLUG="transformer-worker-${BALENA_DEVICE_UUID}"

dockerd &> dockerd-output.log & sleep 1 && npm start
