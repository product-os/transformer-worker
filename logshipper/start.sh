#!/usr/bin/env bash

set -e

cd /etc/vector/

export BALENA_FLEET_NAME=${BALENA_APP_NAME}
export CERTIFICATES_DIR="/etc/vector/certificates"
CONFIG_FILES="vector.yaml"

if [ ! -z $VECTOR_ENDPOINT ]
then
    cp -f sink-vector.yaml.template sink-vector.yaml
    CONFIG_FILES="$CONFIG_FILES sink-vector.yaml"
    export VECTOR_TLS_ENABLED="false"
    if [ ! -z $VECTOR_TLS_CA_FILE ]
    then
        echo ${VECTOR_TLS_CA_FILE} | base64 -d > ${CERTIFICATES_DIR}/ca.pem
        sed -i "s|# ca_file: |ca_file: ${CERTIFICATES_DIR}/ca.pem|g" sink-vector.yaml
        export VECTOR_TLS_ENABLED="true"
    fi
    if [ ! -z $VECTOR_TLS_CRT_FILE ] && [ ! -z $VECTOR_TLS_KEY_FILE ]
    then
        echo ${VECTOR_TLS_CRT_FILE} | base64 -d > ${CERTIFICATES_DIR}/client.pem
        echo ${VECTOR_TLS_KEY_FILE} | base64 -d > ${CERTIFICATES_DIR}/client-key.pem
        sed -i "s|# crt_file: |crt_file: ${CERTIFICATES_DIR}/client.pem|g" sink-vector.yaml
        sed -i "s|# key_file: |key_file: ${CERTIFICATES_DIR}/client-key.pem|g" sink-vector.yaml
        export VECTOR_TLS_ENABLED="true"
    fi
fi

vector --config $CONFIG_FILES
