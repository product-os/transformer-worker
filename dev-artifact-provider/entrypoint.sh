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

# used by fleet, transformer-runner
echo $jf_auth_token > /shared/.token

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
		--insecure || echo "card for $artifact already exists (I hope)"
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
		--data-binary @card.json \
		--insecure ||  echo "card for $artifact already exists (I hope)"

	TAG="${REGISTRY_HOST}${REGISTRY_PORT}/${img}:1.0.0"
	docker build -t $TAG .
	docker push $TAG

	popd
done
popd

echo "finished importing artifacts"

echo "linking cards"

loop_id=$(curl 'http://api.ly.fish.local/api/v2/slug/loop-product-os' \
  -H "Authorization: Bearer $jf_auth_token" | jq -j .id)

curl 'http://api.ly.fish.local/api/v2/action' \
  -H "Authorization: Bearer $jf_auth_token" \
  -H 'Content-Type: application/json;charset=UTF-8' \
  --data-raw '{"card":"link","type":"type","action":"action-create-card@1.0.0","arguments":{"reason":null,"properties":{"slug":"link-poructos-owns-identity-transformer","tags":[],"version":"1.0.0","links":{},"requires":[],"capabilities":[],"active":true,"name":"owns","data":{"inverseName":"is owned by","from":{"id":"'$loop_id'","type":"loop@1.0.0"},"to":{"id":"fb3b504c-5f3c-462f-bff8-0c8cc26e2443","type":"transformer@1.0.0"}}}}}' \
  || echo "link already exists"

echo "marking artifacts as ready"

for c in ls ./*/*/card.json ; do

	id=$(cat $c | jq -j .arguments.properties.id)

	curl 'http://api.ly.fish.local/api/v2/action' \
	-H 'Accept: application/json' \
	-H "Authorization: Bearer $jf_auth_token" \
	-H 'Content-Type: application/json;charset=UTF-8' \
	--data-raw '{"card":"'$id'","type":"faq@1.0.0","action":"action-update-card@1.0.0","arguments":{"reason":null,"patch":[{"op":"replace","path":"/data/$transformer/artifactReady","value":true}]}}'

done

tail -f /dev/null
