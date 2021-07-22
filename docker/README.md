
# OpenDataDiscovery Platform local demo environment

## Overview

This docker-compose contains:
* ODD Platform
* ODD Platform Puller and dependencies (Celery with Redis)
* Several adapters:
	* MySQL
	* PostgreSQL
	* Glue
	* Redshift

## Configuration

All configuration variables are defined in `.env` file. Please adjust them to your data sources' credentials.

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

ODD Platform uses OAuth2 + OIDC as the auth mechanism. This feature is **disabled** by default. To enable it you'd have to set up additional configurution for ODD Platform:
* Set `AUTH_ENABLED=true` environment variable in ODD Platform docker-compose  service
* Configure OAuth2 + OIDC using [this reference page](https://docs.spring.io/spring-security/site/docs/5.2.x/reference/html/oauth2.html#oauth2) via environment variables in ODD Platform docker-compose service.

Enabling authentication will also bring additional functionality in the ODD Platform such as:
* `User mapping` (OAuth2 user -> ODD Platform Owner)
* `My Objects` in start and search pages
* `Upstream/Downstream dependencies` in start page
* ...

### Example: Cognito

`application.yaml` file entry:

    security:  
      oauth2:  
        client:  
          registration:  
            cognito:  
              client-id: {cognito_app_client_id}
              client-secret: {cognito_app_client_secret}
              scope: openid
              redirect-uri: http://localhost:8080/login/oauth2/code/cognito
              client-name: auth-client
          provider:  
            cognito: 
              issuerUri: https://cognito-idp.${cognito_region}.amazonaws.com/${user_pool_id}
              user-name-attribute: username

Could also be configured as environment variables e.g:
* SECURITY_OAUTH2_CLIENT_REGISTRATION_COGNITO_CLIENT_ID=${cognito_app_client_id}
* SECURITY_OAUTH2_CLIENT_REGISTRATION_COGNITO_CLIENT_SECRET=${cognito_app_client_secret}
* ...