#!/bin/bash -e


if [ -f done.marker  ]; then
	echo "already done importing artifacts"
	tail -f /dev/null
fi

ps -a | grep 'docker'
has_daemon_running=$?

if [ -z "$has_daemon_running" ]; then
	echo "starting docker-in-docker";
	dockerd & sleep 5;
fi

echo "start importing artifacts"

pushd images
for img in $(ls) ; do

	pushd $img
	TAG="${REGISTRY_HOST}:${REGISTRY_PORT}/${img}:1.0.0"
	docker build -t $TAG .
	docker push $TAG
	popd

done
popd


pushd artifacts
for artifact in $(ls) ; do

	pushd $artifact
	TAG="${REGISTRY_HOST}:${REGISTRY_PORT}/${artifact}:1.0.0"
	oras push --plain-http $TAG *
	popd

done
popd


echo "finished importing artifacts"

touch done.marker

tail -f /dev/null