#!/bin/bash -ex

set +e
ps -a | grep '[d]ockerd'
has_daemon_running=$?
set -e

if [ -n $has_daemon_running ]; then
	echo "starting docker-in-docker";
	rm -f /var/run/docker.pid # might happen during live-push
	dockerd 2>&1 | grep ER & 
	sleep 5
fi

jf_auth_token=$(curl 'http://api.ly.fish.local/api/v2/action' \
  -H 'Accept: application/json' \
  -H 'Content-Type: application/json;charset=UTF-8' \
  --data-raw '{"card":"user-jellyfish","type":"user","action":"action-create-session@1.0.0","arguments":{"password":"jellyfish"}}' \
  --insecure --fail | jq -j .data.id)

if [ "x" == "x$jf_auth_token" ]; then
  echo "JF login failed"
  exit 1
fi

docker login registry.ly.fish.local --username user-jellyfish --password $jf_auth_token

echo "start importing artifacts"

pushd artifacts
for artifact in $(ls) ; do
	pushd $artifact

	curl 'http://api.ly.fish.local/api/v2/action' \
		-H "Authorization: Bearer $jf_auth_token" \
 		-H 'Accept: application/json, text/plain, */*' \
		-H 'Content-Type: application/json;charset=UTF-8' \
		--data-binary @card.json \
		--insecure --fail -v
	TAG="${REGISTRY_HOST}${REGISTRY_PORT}/${artifact}:1.0.0"
	oras push --plain-http \
		--username user-jellyfish --password $jf_auth_token \
		$TAG *

	popd
done
popd

echo "Done with generic artifacts. Continuing with container images"

pushd images
for img in $(ls) ; do
	pushd $img

	curl 'http://api.ly.fish.local/api/v2/action' \
		-H "Authorization: Bearer $jf_auth_token" \
		-H 'Content-Type: application/json;charset=UTF-8' \
		--data-raw @card.json \
		--insecure --fail

	TAG="${REGISTRY_HOST}${REGISTRY_PORT}/${img}:1.0.0"
	docker build -t $TAG .
	docker push $TAG

	popd
done
popd

echo "finished importing artifacts"

tail -f /dev/null
