# Open Data Discovery Platform local demo environment
* * *

The following is set of instructions to run ODD Platform locally using docker and docker-compose. This configuration is basic and best suited as a demo sandbox.

This environment consists of:
* ODD Platform -- an application that ingests, structurizes, indexes and provides a collected metadata via REST API and UI
* ODD Platform Enricher -- a tool to inject a sample demo metadata into the Platform
* PostgreSQL sample database
* ODD Collector -- a service that collects metadata, maps it onto
  [ODD specification](https://github.com/opendatadiscovery/opendatadiscovery-specification)
  and pushes it into the Platform

## Prerequisites

* Docker Engine 19.03.0+
* Preferably the latest docker-compose

## Step 1: Configuring and running ODD Platform with the sample metadata in it

### Assumptions

* Ports 5432 and 8080 aren't busy. Commands to check that might be:
    * Linux/Mac: `lsof -i -P -n | grep LISTEN | grep <PORT_NUMBER>`
    * Windows Powershell: `Get-NetTCPConnection | where Localport -eq <PORT_NUMBER> | select Localport,OwningProcess`
      Replace `<PORT_NUMBER>` with 5432 and 8080. Empty outputы mean that the port is free and ready to go.

### Execution

Run `docker-compose -f docker/demo.yaml odd-platform-enricher` **from the root folder**.

### Result

Open `http://localhost:8080` in your browser. You should be able to see the Platform's UI
and by clicking the `Catalog` you should be able to see sample metadata injected in the Platform

## Step 2: Configuring and running collector to scrape metadata from the sample data source

### Creating Collector entity in the Platform UI

1. Go to the http://localhost:8080/management/collectors and press `Add collector`
2. The name is only one required field. You may want to choose a namespace for the collector
   or create it from the form by typing in the `Namespace` field. Press `Save`.
3. In the collectors' list find your freshly created one and copy the token by clicking the `Copy` button
   right to the token value.

### Configuring and running the collector

1. Paste the token obtained in the previous step in the `docker/config/collector_config.yaml` file under the `token` entry
2. If you'd like, you may change the name of the `postgresql` plugin under the `name` entry.
3. Save the changed file and run `docker-compose -f docker/demo.yaml up -d odd-collector` **from the root folder**.

### Result

New data source and data entities should be injected in seconds.

## Step 3 (Optional): Configuring and running collector to scrape metadata from your own data sources

### Assumptions

* You've done first two steps
* You have your own data sources from which you want to ingest metadata into the platform and they are reachable from your machine
* These data sources are supported by collectors. Full list you may find
  in [here](https://github.com/opendatadiscovery/odd-collector/blob/main/README.md)
  and [here](https://github.com/opendatadiscovery/odd-collector-aws/blob/main/README.md)

### Configuring the existing collector

1. Add new entries under plugin list in the `docker/config/collector_config.yaml`.
   See a documentation on how-to [here](https://github.com/opendatadiscovery/odd-collector/blob/main/README.md)
2. Restart a collector by running `docker-compose -f docker/demo.yaml restart odd-collector` **from the root folder**.


### Result

You should be able to see new data sources and data entities that correspond with freshly defined plugins and your data sources


## Additional ODD Platform features

### Authentication

Enabling authentication will bring additional functionality such as:

1. `User mapping` (Authenticated identity -> ODD Platform Owner)
2. `My Objects` in start and search pages
3. `Upstream/Downstream dependencies` in start page

ODD Platform has several supported authentication mechanisms. By default, the authentication is **disabled**

#### Form Login

To enable Form Login authentication mechanism, set `AUTH_TYPE=LOGIN_FORM` environment variable in **odd-platform** docker-compose service.

Credentials are: `root:root` or `admin:admin`. These can be changed via `AUTH_LOGIN_FORM_CREDENTIALS` environment variable in format `username1:password1,username2:password2`

### OAuth2

To enable OAuth2 authentication mechanism:

1. Set `AUTH_TYPE=OAUTH2` environment variable in **odd-platform** docker-compose service
3. Configure OAuth2 + OIDC
   using [this reference page](https://docs.spring.io/spring-security/site/docs/5.2.x/reference/html/oauth2.html#oauth2)
   via environment variables in ODD Platform docker-compose service
4. Configure OAuth2 Authorization Server's issuer URL by setting `SPRING_SECURITY_OAUTH2_RESOURCESERVER_JWT_ISSUER_URL`
   property via environment variables in ODD Platform docker-compose service
5. Configure OAuth2 section in ODD Platform Puller service using
   this [reference](https://github.com/opendatadiscovery/odd-platform-puller#readme)

### Troubleshooting
Q: My entities from the sample data aren't shown in the platform.  
A: Check the logs by running `docker-compose -f docker/demo.yaml logs -f` **from the root folder**.