#!/bin/bash

GENERATOR_IMAGE="openapitools/openapi-generator-cli:v7.2.0"
CONFIG_PATH="odd-platform-ui/openapi-config.yaml"
WORKDIR="//mnt" # Using double-slash for compatibility with Windows
HOST_DIRECTORY=/$(pwd)/..

docker run -v "$HOST_DIRECTORY:$WORKDIR" -w "$WORKDIR" --rm "$GENERATOR_IMAGE" generate -c "$CONFIG_PATH"