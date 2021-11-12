#!/bin/bash

while [ "x" == "x$WORKER_JF_TOKEN" ]; do
	echo "waiting for JF token..."
	sleep 1
	export WORKER_JF_TOKEN=$(cat /shared/jf-token)
done
while [ "x" == "x$FLEET_ENROLL_SECRET" ]; do
	echo "waiting for enroll secret..."
	sleep 1
	export FLEET_ENROLL_SECRET=$(cat /shared/.enroll_secret)
done

echo "FLEET-LAUNCHER starting up"
 
launcher --hostname=${FLEET_HOSTNAME} \
	--root_directory=$(mktemp -d) \
	--enroll_secret=${FLEET_ENROLL_SECRET} \
	--osquery_flag docker_socket=/var/run/balena-engine.sock \
	--osquery_flag host-identifier=specified \
	--osquery_flag specified-identifier="${BALENA_DEVICE_UUID}" \
	${FLEET_EXTRA_ARGS}
