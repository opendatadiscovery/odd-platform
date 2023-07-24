#### Configuring and running Collector to gather metadata from your own data sources
#### modify "demo.yaml","collector_config.yaml",".env" files for compose-up 

1. Set Postgresql service in demo.yaml file
    - Docker service config example
        '''
            version: "3.3"
            services:
            database:
                image: postgres:13.2-alpine
                restart: always
                environment:
                - POSTGRES_USER=${POSTGRES_USER}
                - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
                - POSTGRES_DATABASE=${POSTGRES_DATABASE}
                ports:
                - 5433:5432

            odd-platform:
                image: ghcr.io/opendatadiscovery/odd-platform:latest
                restart: always
                environment:
                - SPRING_DATASOURCE_URL=jdbc:postgresql://database:5432/${POSTGRES_DATABASE}
                - SPRING_DATASOURCE_USERNAME=${POSTGRES_USER}
                - SPRING_DATASOURCE_PASSWORD=${POSTGRES_PASSWORD}
                depends_on:
                - database
                ports:
                - 8080:8080

            odd-platform-enricher:
                image: python:3.9.12-alpine3.15
                volumes:
                - ../injector:/injector
                - ./config/injector:/samples
                command:
                - sh
                - ./injector/start.sh
                environment:
                - PLATFORM_HOST_URL=${PLATFORM_HOST_URL}
                - PYTHONUNBUFFERED=1
                depends_on:
                - odd-platform

            sample-postgresql:
                image: postgres:13.2-alpine
                restart: always
                volumes:
                - ./config/dump.sql:/docker-entrypoint-initdb.d/init.sql
                environment:
                - POSTGRES_USER=${SAMPLE_POSTGRES_USER}
                - POSTGRES_PASSWORD=${SAMPLE_POSTGRES_PASSWORD}
                - POSTGRES_DATABASE=${SAMPLE_POSTGRES_DATABASE}
            ### modify from here
            odd-collector:
                image: ghcr.io/opendatadiscovery/odd-collector:latest
                restart: always
                volumes:
                - ./config/collector_config.yaml:/app/collector_config.yaml
                environment:
                - PLATFORM_HOST_URL=${PLATFORM_HOST_URL}
                - SAMPLE_POSTGRES_HOST=sample-postgresql
                - SAMPLE_POSTGRES_USER=${SAMPLE_POSTGRES_USER}
                - SAMPLE_POSTGRES_DATABASE=${SAMPLE_POSTGRES_DATABASE}
                - SAMPLE_POSTGRES_PASSWORD=${SAMPLE_POSTGRES_PASSWORD}
                - MY_POSTGRES_USER=postgres
                - MY_POSTGRES_PASSWORD=${MY_POSTGRES_PASSWORD}
                - MY_POSTGRES_DATABASE=${MY_POSTGRES_DATABASE}
                depends_on:
                - sample-postgresql
        '''

2.  Edit .env file
    - Example
        '''
        PLATFORM_HOST_URL=http://odd-platform:8080
        MY_POSTGRES_USER=postgres
        MY_POSTGRES_PASSWORD=postgres
        MY_POSTGRES_DATABASE=postgres
        '''

3.  Edit collector_config.yaml
    - According to develper, "user" must define here, though we are using an .env file   
      for defining environment !!! 
    - Example
    '''
    default_pulling_interval: 1
    token: "add token here later "
    plugins:
    - type: postgresql
        name: traffic
        host: 172.21.0.2
        port: 5432
        user: postgres
        password: !ENV ${MY_POSTGRES_PASSWORD}
        database: !ENV ${MY_POSTGRES_DATABASE}
    '''

4. After the modifications,we can compose now
    '''
    cd odd-platform
    docker-compose -f docker/demo.yaml up -d odd-platform-enricher
    '''

5. Open collectors page to add a new collector
    - http://localhost:8080/management/collectors

6. Copy new collector token & paste it to token in collector_config.yaml
    - Example
    '''
    default_pulling_interval: 1
    token: "K6N9QG86FfowqdNF9AjIe9WSzm6adzTSX6O39d3y"
    plugins:
    - type: postgresql
        name: traffic
        host: 172.21.0.2
        port: 5432
        user: postgres
        password: !ENV ${MY_POSTGRES_PASSWORD}
        database: !ENV ${MY_POSTGRES_DATABASE}
    '''

7. Active `odd-collector` service
    ```
    docker-compose -f docker/demo.yaml up -d odd-collector
    ```
8. Check your postgresql datasource exists in odd-platform datasources page
    - http://localhost:8080/management/datasources
    - datasource name: postgresql-step3-test-v0
