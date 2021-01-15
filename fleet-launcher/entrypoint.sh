#!/bin/bash

device_uuid=$(curl -s "$BALENA_SUPERVISOR_ADDRESS/v1/device/host-config?apikey=$BALENA_SUPERVISOR_API_KEY" | jq -r .network.hostname)
export WORKER_JF_TOKEN="$(cat /shared/.token)"

launcher --hostname=${FLEET_HOSTNAME} --root_directory=$(mktemp -d) --enroll_secret=${FLEET_ENROLL_SECRET} --osquery_flag docker_socket=/var/run/balena-engine.sock --osquery_flag host-identifier=specified --osquery_flag specified-identifier="$device_uuid" ${FLEET_EXTRA_ARGS}
