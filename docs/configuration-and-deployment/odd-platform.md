---
description: >-
  This section defines how to configure ODD Platform in order to leverage all of
  its functionality and features
---

# Configure ODD Platform

## Configuration approaches

There are two ways to configure the Platform:

* **Environment variables** are used for simple entries
* Configuring via **YAML** can come in handy when there's a complex configuration block (e.g OAuth2 authentication or logging levels) needs to be defined.

<details>

<summary>YAML entries VS environment variables</summary>

Here is an example of how to define the following block and configure the Platform with it using environment variables.

YAML:

```yaml
spring:
    datasource:
        url: URL
        username: USERNAME
        password: PASSWORD
```

To configure the Platform using environment variables, replace semicolons with underscores and uppercasing words, like so:

* `SPRING_DATASOURCE_URL=URL`
* `SPRING_DATASOURCE_USERNAME=USERNAME`
* `SPRING_DATASOURCE_PASSWORD=PASSWORD`

</details>

## Connect your database

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

## Enable security

While ODD Platform doesn't have its own registration and authentication process, it supports several third-party authentication mechanisms as well as an absence of authentication at all. To define what mechanism to use, set `auth.type` variable.

By default, the authentication option is disabled:

{% hint style="info" %}
**`auth.type`** variable must be set to **`Disabled`**
{% endhint %}

No additional settings are required.

### Authentication: Login Form

{% hint style="info" %}
**`auth.type`** variable must be set to **`LOGIN_FORM`**
{% endhint %}

{% hint style="danger" %}
**`LOGIN_FORM`** authentication mechanism **is not recommended** to be used in production!
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
**`auth.type`** variable must be set to **`LDAP`**
{% endhint %}

TODO: finish

## Select session provider

ODD Platform is able to keep users' sessions in several places such as in memory, PostgreSQL database or Redis. Session provider can be set via `session.provider` variable with following expected values:

* `IN_MEMORY`: Local in-memory storage. ODD Platform defaults to this value
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
Otherwise **`INTERNAL_POSTGRESQL`** is the best pick
{% endhint %}

## Enable Metrics

Some of metadata ODD Platform ingests can be conveniently represented in a shape of time-series chart, for example the amount of data in the MySQL table or the physical size of the Redshift database. ODD Platform pushes metadata to the [OTLP collector](https://opentelemetry.io/docs/collector/) as a telemetry in order to be able to create charts in [Prometheus](https://prometheus.io/), [New Relic](https://newrelic.com/) or any other backend that supports [OTLP Exporters](https://aws-otel.github.io/docs/components/otlp-exporter). These variables are needed to be set in order to leverage this functionality:

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

## Enable Alert Notifications

Any alert that is created inside the platform can be sent via webhook and/or [Slack incoming webhook](https://api.slack.com/messaging/webhooks). Such notifications contain information such as:

### ODD Platform configuration

{% tabs %}
{% tab title="YAML" %}

{% endtab %}

{% tab title="Environment variables" %}

{% endtab %}
{% endtabs %}

1. Name of the entity upon which alert has been created
2. Data source and namespace of an entity
3. Owners of an entity
4. Possibly affected entities&#x20;

ODD Platform uses PostgreSQL replication mechanism to be able to send a notification even if there's a network lag occurred or the platform crushes. In order to enable this functionality, an underlying PostgreSQL database needs to be configured as well.

### PostgreSQL Configuration

PostgreSQL database must be [configured](https://www.postgresql.org/docs/current/config-setting.html) in order for ODD Platform to leverage its replication mechanism along with the granting the database user replication permissions

#### Database settings

To configure the database the following entries must be added to the `postgresql.conf` file:

```
max_wal_senders = 1
wal_keep_size = 16
wal_level = logical
max_replication_slots = 1
```

Or if the replication mechanism is already configured, just increment the `max_wal_senders` and `max_replication_slots` numbers

#### Database user permissions

ODD Platform database user must be granted with replication permissions:

```sql
ALTER ROLE {database_username} WITH REPLICATION
```

{% hint style="info" %}
User permissions configuration may vary from one on-demand/cloud provider to another. This example shows the generic PostgreSQL syntax.
{% endhint %}

### ODD Platform configuration

Following variables need to be defined:

* `notifications.enabled`: must be set to `true`. Defaults to `false`
* `notifications.message.downstream-entities-depth`: limits the amount of fetching of affected data entities **in terms of lineage graph level.** Defaults to 1
* `notifications.wal.advisory-lock-id`: ODD Platform uses [PostgreSQL advisory lock](https://www.postgresql.org/docs/current/explicit-locking.html#ADVISORY-LOCKS) in order to make sure that in a case of horizontal scaling only one instance of the platform processes alert messages. This setting defines advisory lock id. Defaults to `100`
* `notifications.wal.replication-slot-name`: PostgreSQL replication slot name that will be created if it doesn't exist yet. Defaults to `odd_platform_replication_slot`
* `notifications.wal.publication-name`: PostgreSQL publication name that will be created if it doesn't exist yet. Defaults to `odd_platform_publication_alert`
* `notifications.receivers.slack.url`: [Slack incoming webhook](https://api.slack.com/messaging/webhooks) URL
* `notifications.receivers.slack.platform-base-url`: ODD Platform URL to be used in alert messages' hyperlinks.
* `notifications.receivers.webhook.url`: Generic webhook URL

ODD Platform configuration would look like this:

{% tabs %}
{% tab title="YAML" %}
```yaml
notifications:
  enabled: true
  message:
    downstream-entities-depth: {downstream_entities_depth_to_fetch}
  wal:
    advisory-lock-id: {postgresql_advisory_lock_id}
    replication-slot-name: {postgresql_replication_slot_name}
    publication-name: {postgresql_publication_name}
  receivers:
    slack:
      url: {slack_incoming_webhook_url}
      platform-base-url: {platform_url}
    webhook:
      url: {webhook_url}
```
{% endtab %}

{% tab title="Environment variables" %}
* `NOTIFICATIONS_ENABLED=true`
* `NOTIFICATIONS_MESSAGE_DOWNSTREAM-ENTITIES_DEPTH={downstream_entities_depth_to_fetch}`
* `NOTIFICATIONS_WAL_ADVISORY-LOCK-ID={postgresql_advisory_lock_id}`
* `NOTIFICATIONS_WAL_REPLICATION-SLOT-NAME={postgresql_replication_slot_name}`
* `NOTIFICATIONS_WAL_PUBLICATION-NAME={postgresql_publication_name}`
* `NOTIFICATIONS_RECEIVERS_SLACK_URL={slack_incoming_webhook_url}`
* `NOTIFICATIONS_RECEIVERS_SLACK_PLATFORM-BASE-URL={odd_platform_url}`
* `NOTIFICATIONS_RECEIVERS_WEBHOOK_URL={webhook_url}`
{% endtab %}
{% endtabs %}
