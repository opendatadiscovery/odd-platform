# Open Data Discovery Platform local demo environment
* * *

The following is a set of instructions to run ODD Platform locally using docker and docker-compose.
This configuration is basic and best suited as a demo sandbox.

This environment consists of:
* ODD Platform – an application that ingests, structurizes, indexes and provides a collected metadata via REST API and UI
* ODD Platform Enricher – a tool to inject a metadata sample into the Platform
* PostgreSQL sample database
* ODD Collector – a lightweight service which gathers metadata from all your data sources

## Prerequisites

* Docker Engine 19.03.0+
* Preferably the latest docker-compose

## Step 1: Configuring and running ODD Platform with a metadata sample in it

### Assumptions

* Ports 5432 and 8080 are free. Commands to check that might be:
    * Linux/Mac: `lsof -i -P -n | grep LISTEN | grep <PORT_NUMBER>`
    * Windows Powershell: `Get-NetTCPConnection | where Localport -eq <PORT_NUMBER> | select Localport,OwningProcess`

    Replace `<PORT_NUMBER>` with 5432 and 8080. Empty output means that the port is free and ready to go.

### Execution

Run **from the project root folder** `docker-compose -f docker/demo.yaml up -d odd-platform-enricher`.

### Result

1. Open http://localhost:8080/management/datasources in your browser

You should be able to see 10 predefined data sources in the list

2. Go to the **Catalog** section

You should be able to see metadata sample injected into the Platform

## Step 2: Configuring and running Collector to gather metadata from the sample data source

### Create Collector entity

1. Go to the http://localhost:8080/management/collectors and select `Add collector`
2. Complete the following fields:
    * **Name**
    * **Namespace** (optional)
    * **Description** (optional)
3. Click **Save**. Your collector should appear in the list
4. Copy the token by clicking **Copy** right to the token value

### Configure and run the Collector

1. Paste the token obtained in the previous step into the `docker/config/collector_config.yaml` file under the `token` entry
2. If you'd like, you may change the name of the `postgresql` plugin under the `name` entry.
3. Save the changed file and run **from the project root folder** `docker-compose -f docker/demo.yaml up -d odd-collector`.

### Result

1. Open http://localhost:8080/management/datasources in your browser

You should be able to see a new data source with the name you've passed into the collector_config.yaml file
(Default is `postgresql-step2-test`). Overall you should see 11 data sources in the list

2. Go to the **Catalog** section. Select the created data source in the `Datasources` filter

You should be able to see 11 new entities of different types injected into the Platform

## Step 3 (Optional): Configuring and running Collector to gather metadata from your own data sources

### Assumptions

* You've done Step 1 and Step 2
* You already have locally accessible data sources and want to ingest metadata from these data sources into the Platform
* These data sources are supported by Collectors:
    *  [supported data sources by odd-collector](https://github.com/opendatadiscovery/odd-collector/blob/main/README.md)
    *  [supported data sources by odd-collector-aws](https://github.com/opendatadiscovery/odd-collector-aws/blob/main/README.md)

### Configure the existing Collector

1. Add new entries under plugin list in the `docker/config/collector_config.yaml`
   See a documentation [here](https://github.com/opendatadiscovery/odd-collector/blob/main/README.md)
2. Restart the Collector by running **from the project root folder** `docker-compose -f docker/demo.yaml restart odd-collector`

### Result

You should be able to see new data sources and data entities that correspond with them

### Troubleshooting

**My entities from the sample data aren't shown in the platform.**

Check the logs by running **from the project root folder** `docker-compose -f docker/demo.yaml logs -f`
