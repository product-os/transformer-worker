#!/usr/bin/env bash

cd /etc/vector/

export BALENA_FLEET_NAME=${BALENA_APP_NAME}
export CERTIFICATES_DIR="/etc/vector/certificates"

if [ ! -z $VECTOR_ENDPOINT ]
then
    cp -f sink-vector.yaml.template sink-vector.yaml
    if [ ! -z $VECTOR_TLS_CA_FILE ]
    then
        echo ${VECTOR_TLS_CA_FILE} | base64 -d > ${CERTIFICATES_DIR}/ca.pem || exit 1
        sed -i "" "s|# ca_file: |ca_file: ${CERTIFICATES_DIR}/ca.pem|g" sink-vector.yaml
    fi
fi

vector --config *.yaml
