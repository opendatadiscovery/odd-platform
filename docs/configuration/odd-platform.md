---
description: >-
  This section defines how to configure ODD Platform in order to leverage all of
  its functionality and features
---

# ODD Platform

## Configuration approaches

ODD Platform can be configured either via putting a YAML file or defining environment variables that translate properties from YAML file. Configuring via YAML can come in handy when there's a complex configuration block (e.g OAuth2 authentication or logging levels) needs to be defined while environment variables are good for simple entries.

<details>

<summary>How to map YAML entries to environment variables</summary>

&#x20;Let's say you need to define the following configuration block and configure the platform with it using environment variables

```yaml
spring:
    datasource:
        url: URL
        username: USERNAME
        password: PASSWORD
```

This block flattens to 3 environment variables by replacing semicolons with underscores and uppercasing words, like so:

* `SPRING_DATASOURCE_URL=URL`
* `SPRING_DATASOURCE_USERNAME=USERNAME`
* `SPRING_DATASOURCE_PASSWORD=PASSWORD`

</details>

## Database connection

For all of its features ODD Platform uses PostgreSQL database and PostgreSQL database only. These variables are needed to be defined to connect ODD Platform to database:

* `spring.datasource.url`: [JDBC string](https://jdbc.postgresql.org/documentation/80/connect.html) of your PostgreSQL database. Default value is `jdbc:postgresql://127.0.0.1:5432/odd-platform`
* `spring.datasource.username`: your PostgreSQL user's name. Default value is `odd-platform`
* `spring.datasource.password`: your PostgreSQL user's password. Default value is `odd-platform-password`

So that your database connection defining block would look like this:

{% tabs %}
{% tab title="YAML" %}
```yaml
spring:
    datasource:
        url: jdbc:postgresql://{database_host}:{database_port}/{database_name}
        username: {database_username}
        password: {database_password}
```
{% endtab %}

{% tab title="Environment variables" %}
* `SPRING_DATASOURCE_URL=jdbc:postgresql://{database_host}:{database_port}/{database_name}`
* `SPRING_DATASOURCE_USERNAME={database_username}`
* `SPRING_DATASOURCE_PASSWORD={database_password}`
{% endtab %}
{% endtabs %}

## Authentication

While ODD Platform doesn't have its own registration and authentication process, it supports several third-party authentication mechanisms as well as an absence of authentication at all. You can define what mechanism to use by setting `auth.type` variable.

### Authentication: Disabled

{% hint style="info" %}
**`auth.type`** variable must be set to **`LOGIN_FORM`**
{% endhint %}

No additional settings are required.

### Authentication: Login Form

{% hint style="info" %}
**`auth.type`** variable must be set to **`LOGIN_FORM`**
{% endhint %}

{% hint style="danger" %}
**`LOGIN_FORM`**authentication mechanism **is not meant** to be used in production!
{% endhint %}

The easiest authentication mechanism to use. Users' credentials can be set by defining `auth.login-form-credentials` variable in the following format: `username1:password1,username2:password2.` Default value is `admin:admin,root:root`, hence by default ODD Platform will be able to authenticate 2 users with usernames `admin` and `root` and passwords `admin` and `root` respectively.

{% tabs %}
{% tab title="YAML" %}
```yaml
auth:
    type: LOGIN_FORM
    login-form-credentials: susan:susan_password,dave:dave_password
```
{% endtab %}

{% tab title="Environment variables" %}
* `AUTH_TYPE=LOGIN_FORM`
* `AUTH_LOGIN-FORM-CREDENTIALS=susan:susan_password,dave:dave_password`
{% endtab %}
{% endtabs %}

### Authentication: OAuth2

{% hint style="info" %}
**`auth.type`**variable must be set to **`OAUTH2`**
{% endhint %}

ODD Platform supports any authentication provider if it implements the [OAuth 2.0](https://oauth.net/2/) and [OpenID Connect 1.0 Provider](https://openid.net/connect/). In order to connect the platform to the OAuth2 provider, these variables are needed to be set:

```yaml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: # JWT Issuer URI
      client:
        registration:
          # Name of your OAuth2 provider, e.g github, google, okta or custom one
          provider_name: 
            client-id: # Client ID issued by your OAuth2 provider
            client-secret: # Client Secret issued by your OAuth2 provider
            scope: # OAuth2 Scopes
            redirect-uri: # OAuth2 Redirect URI
            client-name: # Name of the OAuth2 client
        provider:
          # Name of your OAuth2 provider, e.g github, google, okta or custom one
          provider_name:
            issuerUri: # Issuer Identifier uri
            user-name-attribute: # payload attribute referencing username or user id
```

### Authentication: LDAP

{% hint style="info" %}
**`auth.type`**variable must be set to **`LDAP`**
{% endhint %}

TODO: finish



## Session provider

ODD Platform is able to keep users' sessions in several places such as in memory, PostgreSQL database or Redis. Session provider can be set via `session.provider` variable with following expected values:

* `IN_MEMORY`: Local in-memory storage. **ODD Platform defaults to this value**
* `INTERNAL_POSTGRESQL`: Underlying PostgreSQL database
* `REDIS`: [Redis data-store](https://redis.io/). In order to connect to Redis following variables are needed to be defined:
  * `spring.redis.host`: Redis host
  * `spring.redis.port`: Redis port
  * `spring.redis.username`: Redis user's name
  * `spring.redis.password`: Redis user's password
  * `spring.redis.database`: Redis database index

{% tabs %}
{% tab title="In memory" %}
```yaml
session:
    provider: IN_MEMORY
```

or

* `SESSION_PROVIDER=IN_MEMORY`
{% endtab %}

{% tab title="PostgreSQL" %}
```yaml
session:
    provider: INTERNAL_POSTGRESQL
```

or

* `SESSION_PROVIDER=INTERNAL_POSTGRESQL`
{% endtab %}

{% tab title="Redis" %}
```yaml
spring:
    redis:
        host: ...
        port: ...
        username: ...
        password: ...
session:
    provider: REDIS
```

or

* `SESSION_PROVIDER=REDIS`
* `SPRING_REDIS_HOST=...`
* `SPRING_REDIS_PORT=...`
* `SPRING_REDIS_USERNAME=...`
* `SPRING_REDIS_PASSWORD=...`
* `SPRING_REDIS_DATABASE=...`
{% endtab %}
{% endtabs %}

{% hint style="info" %}
If you'd like to use only one instance of ODD Platform and you're ready to tolerate users' logouts each time the platform restarts, the best choice would be **`IN_MEMORY`**

\
If you already have a Redis in your infrastructure or you're willing to install it, the best choice would be **`REDIS`**\
**``**\
**``**Otherwise **`INTERNAL_POSTGRESQL`**is the best pick
{% endhint %}

## Metrics Export

Some of metadata ODD Platform ingests can be conveniently represented in a shape of time-series   chart, for example the amount of data in the MySQL table or the physical size of the Redshift database. ODD Platform allows users to push such metadata to the [OTLP collector](https://opentelemetry.io/docs/collector/) as a telemetry in order to be able to create charts in Prometheus, New Relic or any other backend that supports [OTLP Exporters](https://aws-otel.github.io/docs/components/otlp-exporter). These variables are needed to be set in order to leverage this functionality:

* `metrics.export.enabled`: Must be set to `true`
* `metrics.export.otlp-endpoint`: OTLP Collector endpoint

{% tabs %}
{% tab title="YAML" %}
```yaml
metrics:
    export:
        enabled: true
        otlp-endpoint: {otlp-endpoint-url}
```
{% endtab %}

{% tab title="Environment variables" %}
* `METRICS_EXPORT_ENABLED=true`
* `METRICS_EXPORT_OTLP-ENDPOINT={otlp-endpoint-url}`
{% endtab %}
{% endtabs %}

## Alert notifications

Any alert that is created inside the platform can be sent via webhook or [Slack incoming webhook](https://api.slack.com/messaging/webhooks). ODD Platform is using PostgreSQL replication mechanism so to be able to send a notification even if there's a network lag occurred or the platform crushes. In order to enable this functionality, an underlying PostgreSQL database needs to be configured as well.

{% tabs %}
{% tab title="ODD Platform configuration" %}
Here are generic variables to define:

* `notifications.enabled` must be set to `true`.
* `notifications.message.downstream-entities-depth`: Allows to define a level of lineage  graph depth to be fetched to enrich an alert data. **Defaults to `1`**
* `notifications.wal.advisory-lock-id`: PostgreSQL advisory lock id. **Defaults to `100`**
* `notifications.wal.replication-slot-name`: PostgreSQL replication slot name that will be created if it's not exists yet. **Defaults to `odd_platform_replication_slot`**
* `notifications.wal.publication-name`: PostgreSQL publication name. **Defaults to `odd_platform_publication_alert`**

\
You can define Slack incoming webhook URL and/or a webhook URL:

* `notifications.receivers.slack.url`: Slack incoming webhook URL
* `notifications.receivers.slack.platform-base-url`: ODD Platform public URL for hyperlinks inside of alert messages
* `notifications.receivers.webhook.url`: Generic webhook URL
{% endtab %}

{% tab title="PostgreSQL configuration" %}

{% endtab %}
{% endtabs %}
