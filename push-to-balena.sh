#!/bin/env bash

balena push balena/product-os-transformers-workers --release-tag version "$(git describe --abbrev=0)"
