#!/bin/bash

# start platform
echo "starting infra with ODD Platform with a metadata sample in it..."
docker-compose -f ./docker/docker-compose.yaml up odd-platform-enricher

echo "now you can open http://localhost:8080/management/datasources in your browser"
echo "You should be able to see predefined data sources in the list"
echo "Go to the Catalog section. You should be able to see metadata sample injected in the Platform"
