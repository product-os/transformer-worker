#!/bin/bash

inDir=$(dirname $INPUT)
outDir=$(dirname $OUTPUT)

copy -r "$inDir/*" "$outDir/"

cat $INPUT | jq ''

