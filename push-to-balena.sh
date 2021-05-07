#!/bin/env bash

#hack...
mv balena.yml balena.yml.bak
trap "mv balena.yml.bak balena.yml" EXIT

balena push balena/product-os-transformers-workers --release-tag version "$(git describe --abbrev=0)"
