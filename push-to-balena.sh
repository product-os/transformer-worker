#!/usr/bin/env bash

balena_app=${BALENA_APP:-balena/product-os-transformers-workers}

#hack...
mv balena.yml balena.yml.bak
trap "mv balena.yml.bak balena.yml" EXIT

balena push "${BALENA_APP}" \
  --release-tag version "$(git describe --abbrev=0)"
