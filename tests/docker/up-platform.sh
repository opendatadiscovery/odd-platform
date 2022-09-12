#!/bin/bash

# start platform
echo "starting infra with ODD Platform with a metadata sample in it..."
docker-compose -f ../docker/demo.yaml up -d odd-platform-enricher

# sleep a bit until data be ready
read -p "waiting 30 sec to make sure containers are up and data is ready..." -t 30

echo "now you can open http://localhost:8080/management/datasources in your browser"
echo "You should be able to see 10 predefined data sources in the list"
echo "Go to the Catalog section. You should be able to see metadata sample injected in the Platform"
