#!/bin/bash

export value=$(curl -X POST -H "Content-Type: application/json" -d @../tests/docker/req.json http://localhost:8080/api/collectors | jq '.token.value')
echo > ../docker/config/collector_config.yaml
envsubst '${value}' < ../tests/docker/collector_setting_from_post.yaml >> ../docker/config/collector_config.yaml

# start collector
echo "starting Collector to gather metadata from the sample data source"
docker-compose -f ../docker/demo.yaml up -d odd-collector

# sleep a bit until data be ready
read -p "waiting 30 sec to make sure containers are up and data is ready..." -t 30

echo "now you can open http://localhost:8080/management/datasources in your browser"
echo "You should be able to see a new data source with the 'AEG-test' name"
echo "Go to the Catalog section. Select the created data source in the Datasources filter. You should be able to see 11 new entities of different types injected into the Platform"
