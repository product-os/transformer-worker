#!/usr/bin/env bash

app=${BALENA_APP:-product_os/transformers-workers}

#hack...
mv balena.yml balena.yml.bak
trap "mv balena.yml.bak balena.yml" EXIT

balena push "${app}" \
  --release-tag version "$(cat VERSION)" sha "$(git rev-parse --short HEAD)"
