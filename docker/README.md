# OpenDataDiscovery Platform local demo environment

## Overview

This docker-compose contains:
* ODD Platform
* ODD Platform Puller
* Several adapters:
* MySQL
* PostgreSQL
* Glue
* Redshift

## Configuration

All configuration variables are defined in `.env` file. Please adjust them to your data sources' credentials.

ODD Platform requires to define three mandatory env vars:
* SPRING_DATASOURCE_URL: jdbc:postgresql://{DATABASE_HOSTNAME}:{DATABASE_PORT}/{DATABASE_NAME}
* SPRING_DATASOURCE_USERNAME: {DATABASE_USERNAME}
* SPRING_DATASOURCE_PASSWORD: {DATABASE_PASSWORD}

## Execution

To run the **whole** environment execute:

`docker-compose -f demo.yaml up -d`.

If you'd like to run specific adapters, list them after the command using docker-compose services as identificators:

`docker-compose -f demo.yaml up -d mysql-adapter glue-adapter redshift-adapter`

ODD Platform will be available at `http://localhost:8080/`

## Initial setup

All adapters expose 808x port:
* MySQL adapter: **8084**
* PostgreSQL adapter: **8085**
* Glue adapter: **8086**
* Redshift adapter: **8087**

To start ingesting metadata from adapters to the platform:
* Go to the `http://localhost:8080/management/datasources` and click on `Add datasource` button
* Enter DataSource information:
* Name
* ODDRN: OpenDataDiscovery Resource Name. To identify DataSource's ODDRN make an HTTP GET request to the `http://localhost:{adapter_port}/entities` and find `data_source_oddrn` entry at the top-level JSON. If you have [JQ](https://stedolan.github.io/jq/) installed you may find the following command useful: `curl -s http://localhost:8080/entities | jq .data_source_oddrn`
* URL: Use `http://{adapter_service_name}:8080` as the URL e.g. `http://mysql-adapter:8080`
* Select `Receive data from current datasource` and choose an interval
* Description (optional)
* Hit `Save` and you're good to go! (Please note that it will take some time -- normally under a minute -- to ingest the metadata from your data source to the platform).

## Authentication

Enabling authentication will bring additional functionality such as:
1. `User mapping` (OAuth2 user -> ODD Platform Owner)
2. `My Objects` in start and search pages
3. `Upstream/Downstream dependencies` in start page
4. ...

ODD Platform has several supported authentication mechanisms:
* Form Login
* OAuth2 + OIDC

By default, the authentication is **disabled**

### Form Login

To enable Form Login auth mechanism:

1. Set  `AUTH_TYPE=LOGIN_FORM` environment variable in **ODD Platform** docker-compose service
2. Configure Login Form auth section in ODD Platform Puller service using this [reference](https://github.com/opendatadiscovery/odd-platform-puller#readme)

### OAuth2

ODD Platform can be configured to be both OAuth2 client for API calls and OAuth2 Resource server for ingesting entities from adapters. To enable OAuth2 auth mechanism:

1. Set  `AUTH_TYPE=OAUTH2` environment variable in **ODD Platform** docker-compose service
3. Configure OAuth2 + OIDC using [this reference page](https://docs.spring.io/spring-security/site/docs/5.2.x/reference/html/oauth2.html#oauth2) via environment variables in ODD Platform docker-compose service
4. Configure OAuth2 Authorization Server's issuer URL by setting `SPRING_SECURITY_OAUTH2_RESOURCESERVER_JWT_ISSUER_URL` property via environment variables in ODD Platform docker-compose service
5. Configure OAuth2 section in ODD Platform Puller service using this [reference](https://github.com/opendatadiscovery/odd-platform-puller#readme)
