#!/bin/bash

CONTRACT=$1
SESSION=$2

echo
echo "-------------"
echo "ENV VARIABLES"
echo "-------------"
echo "JF_API_URL = ${JF_API_URL}"
echo "JF_API_PREFIX = ${JF_API_PREFIX}"
echo "REGISTRY_URL = ${REGISTRY_URL}"
echo "REGISTRY_PORT = ${REGISTRY_PORT}"
echo
echo "---------"
echo "ARGUMENTS"
echo "---------"
echo "CONTRACT_BASE64 = ${CONTRACT}"
echo "CONTRACT_PLAINTEXT = $(echo ${CONTRACT} | base64 -d)"
echo "SESSION = ${SESSION}"
echo
