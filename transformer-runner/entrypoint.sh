#!/bin/sh

device_uuid=$(curl -s "$BALENA_SUPERVISOR_ADDRESS/v1/device/host-config?apikey=$BALENA_SUPERVISOR_API_KEY" | jq -r .network.hostname)

if [ ! -e /shared/.token ]; then
    uuidgen > /shared/.token
fi

export WORKER_JF_TOKEN=$(cat /shared/.token)
export WORKER_SLUG="transformer-worker-${device_uuid}"

dockerd &> dockerd-output.log & sleep 1 && npm start
