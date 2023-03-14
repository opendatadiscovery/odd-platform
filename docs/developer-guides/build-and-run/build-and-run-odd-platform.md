---
description: Developer guide on how to build and run ODD Platform backend and frontend
---

# Build and run ODD Platform

For instructions on how to run the ODD Platform and ODD Collectors locally in a Docker environment, please follow [Try locally](../../configuration-and-deployment/trylocally.md) article.&#x20;

## ODD Platform tech stack

ODD Platform tech stack is:

* Backend
  * Java
  * Gradle
  * [Spring WebFlux](https://docs.spring.io/spring-framework/docs/current/reference/html/web-reactive.html)
  * [jOOQ](https://www.jooq.org/)
  * [Flyway](https://flywaydb.org/) for database migrations
  * [Testcontainers](https://www.testcontainers.org/) for integration testing
* Frontend
  * Typescript
  * React

ODD Platform's backend and frontend are packaged inside one JAR, which is packaged inside one Docker container using [JIB](https://github.com/GoogleContainerTools/jib).

We believe in contract-first approach. That's why ODD Platform uses OpenAPI generators and jOOQ custom generator over database migrations to create models which are used further in the code.

## Prerequisites

* [Docker Engine 19.03.0+](https://docs.docker.com/engine/install/)
* preferably the latest [docker-compose](https://docs.docker.com/compose/install/)
* Java 17 (consider using [SDKMAN](https://sdkman.io/) for that)
* [Node 16.14.0](https://nodejs.org/en/) and npm (consider using [nvm](https://github.com/nvm-sh/nvm) for that)

## Build ODD Platform

[Fork and clone](../how-to-contribute.md#forking-a-repository) a repository if you haven't done it already.

```shell
git clone https://github.com/{username}/odd-platform.git
```

Go into the repository's root directory

```shell
cd odd-platform
```

### Build ODD Platform into JAR file

Use gradle wrapper to build the platform

```shell
./gradlew clean build
```

Building a project is a good way to check if your code compiles, all tests pass, there's no code smells, etc.

### Build ODD Platform into Docker container

Use gradle wrapper to build the platform and containerize it

```shell
./gradlew clean jibDockerBuild --image odd-platform:dev -PmultiArchContainerBuild=false
```

The above command will build a platform and create a local docker container called `odd-platform:dev`. If you want to change the image name, feel free to change an `--image` property to what you want.

{% hint style="info" %}
Above commands will not only build ODD Platform into JAR or Docker container, but also run tests and checkstyle validations. If you want to remove this behaviour, add following properties to the end of a command:

* &#x20;`-x test` — for disabling test runs
* `-x checkstyleMain -x checkstyleTest` — for disabling code checkstyle validations
{% endhint %}

{% hint style="info" %}
Gradle's `clean` task deletes generated OpenAPI and jOOQ models and invalidates gradle's build cache, which causes slower builds. If you are not changing an odd-platform-specification OpenAPI and not developing database migrations, the best approach would be to not run this task. Just omit `clean` word in your commands
{% endhint %}

## Run ODD Platform locally

{% hint style="info" %}
All commands must be executed in the **project's root directory**
{% endhint %}

The easiest way to have ODD Platform at your disposal locally is to:

Launch a PostgreSQL docker container as a ODD Platform's database using docker-compose

```shell
docker-compose -f docker/demo.yaml up -d database
```

Start the application

```shell
./gradlew bootRun
```

Inject some demo metadata into your local ODD Platform.&#x20;

{% hint style="info" %}
You'd need to install Python 3.8+ in order to run this.
{% endhint %}

```shell
PLATFORM_HOST_URL=http://localhost:8080 APP_PATH=./docker/injector python docker/injector/inject.py
```

Now you should have ODD Platform with demo metadata injected at your disposal at `http://localhost:8080`. If you want to reconfigure default settings, please take a look at [Configure ODD Platform](../../configuration-and-deployment/odd-platform/) page.

### Run ODD Platform as a frontend engineer

We understand that frontend engineers might not want to install heavy prerequisites such as Java only for make changes in the UI. Here is one of the ways how to run fully functional ODD Platform in Docker:

Launch Docker container with ODD Platform, database and inject demo metadata using docker-compose:

```shell
docker-compose -f docker/demo.yaml up -d odd-platform-enricher
```

Or if you want to have the latest platform version from main or any branch, [build it](build-and-run-odd-platform.md#build-odd-platform-into-docker-container) and replace odd-platform image with created one in `docker/demo.yaml` compose file and run it using command above:

```yaml
odd-platform:
  image: <Put your image here>
  restart: always
  environment:
    - SPRING_DATASOURCE_URL=jdbc:postgresql://database:5432/${POSTGRES_DATABASE}
    - SPRING_DATASOURCE_USERNAME=${POSTGRES_USER}
    - SPRING_DATASOURCE_PASSWORD=${POSTGRES_PASSWORD}
  depends_on:
    - database
  ports:
    - 8080:8080
```

Go into UI folder

```shell
cd odd-platform-ui
```

Run UI development server

```shell
VITE_DEV_PROXY=http://localhost:8080/ npm run start
```

Now you should have UI development server at your disposal at `http://localhost:3000`

## Run ODD Platform test

To run backend tests simply execute the following command:

```shell
./gradlew test
```

To run frontend tests execute the following command in `odd-platform-ui` folder:

```shell
npm run test
```
