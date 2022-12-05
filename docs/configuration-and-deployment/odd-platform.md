---
description: >-
  This section defines how to configure ODD Platform in order to leverage all of
  its functionality and features.
---

# Configure ODD Platform

## Configuration approaches

There are two ways to configure the Platform:

* **Environment variables** are used for simple entries
* Configuring via **YAML** can come in handy when it is necessary to define a complex configuration block (e.g OAuth2 authentication or logging levels).

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
```
SPRING_DATASOURCE_URL=jdbc:postgresql://{database_host}:{database_port}/{database_name}
SPRING_DATASOURCE_USERNAME={database_username}
SPRING_DATASOURCE_PASSWORD={database_password}
```
{% endtab %}
{% endtabs %}

## Security

Please follow [enable-security](enable-security/ "mention") section for enabling security in ODD Platform.

## Select session provider

ODD Platform is able to keep users' sessions in several places such as in memory, PostgreSQL database or Redis. A session provider can be set via `session.provider` variable with following expected values:

* `IN_MEMORY`: Local in-memory storage. ODD Platform defaults to this value
* `INTERNAL_POSTGRESQL`: Underlying PostgreSQL database
* `REDIS`: [Redis data-store](https://redis.io/).

{% hint style="info" %}
If you'd like to use only one instance of ODD Platform and you're ready to tolerate users' logouts each time the Platform restarts, the best choice would be **`IN_MEMORY`**

\
If you already have a Redis in your infrastructure or you're willing to install it, the best choice would be **`REDIS`**

\
Otherwise **`INTERNAL_POSTGRESQL`** is the best pick
{% endhint %}

{% tabs %}
{% tab title="YAML" %}
**In memory (default)**

```yaml
session:
    provider: IN_MEMORY
```

**Internal PostgreSQL**

```yaml
session:
    provider: INTERNAL_POSTGRESQL
```

**Redis**

In order to connect to Redis following variables are needed to be defined:

* `spring.redis.host`: Redis host
* `spring.redis.port`: Redis port
* `spring.redis.username`: Redis user's name
* `spring.redis.password`: Redis user's password
* `spring.redis.database`: Redis database index

YAML for Redis session provider

```yaml
spring:
    redis:
        host: {redis_host}
        port: {redis_port}
        username: {redis_username}
        password: {redis_password}
session:
    provider: REDIS
```
{% endtab %}

{% tab title="Environment Variables" %}
**In memory (default)**

* `SESSION_PROVIDER=IN_MEMORY`

**Internal PostgreSQL**

* `SESSION_PROVIDER=IN_MEMORY`

**Redis**

In order to connect to Redis following variables are needed to be defined:

* `spring.redis.host`: Redis host
* `spring.redis.port`: Redis port
* `spring.redis.username`: Redis user's name
* `spring.redis.password`: Redis user's password
* `spring.redis.database`: Redis database index

Environment variables for Redis session provider:

```
SESSION_PROVIDER=REDIS
SPRING_REDIS_HOST={redis_host}
SPRING_REDIS_PORT={redis_port}
SPRING_REDIS_USERNAME={redis_username}
SPRING_REDIS_PASSWORD={redis_password}
SPRING_REDIS_DATABASE={redis_database}
```
{% endtab %}
{% endtabs %}

## Enable Metrics

Some of metadata ODD Platform ingests can be conveniently represented in a shape of time-series chart, for example, an amount of data in a MySQL table or a physical size of a Redshift database. ODD Platform pushes metadata to the [OTLP collector](https://opentelemetry.io/docs/collector/) as a telemetry in order to be able to create charts in [Prometheus](https://prometheus.io/), [New Relic](https://newrelic.com/) or any other backend that supports [OTLP Exporters](https://aws-otel.github.io/docs/components/otlp-exporter). These variables are needed to be set in order to leverage this functionality:

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
```
METRICS_EXPORT_ENABLED=true
METRICS_EXPORT_OTLP-ENDPOINT={otlp-endpoint-url}
```
{% endtab %}
{% endtabs %}

## Enable Alert Notifications

Any alert that is created inside the platform can be sent via webhook and/or [Slack incoming webhook](https://api.slack.com/messaging/webhooks). Such notifications contain information such as:

1. Name of the entity upon which alert has been created
2. Data source and namespace of an entity
3. Owners of an entity
4. Possibly affected entities

ODD Platform uses the PostgreSQL replication mechanism to be able to send a notification even if there's a network lag occurred or the Platform crushes. In order to enable this functionality, an underlying PostgreSQL database needs to be configured as well.

### PostgreSQL Configuration

PostgreSQL database must be [configured](https://www.postgresql.org/docs/current/config-setting.html) in order to leverage the replication mechanism of the Platform along with the granting the database user replication permissions.

#### Database settings

To configure the database, add the following entries to the `postgresql.conf` file:

```
max_wal_senders = 1
wal_keep_size = 16
wal_level = logical
max_replication_slots = 1
```

Or if the replication mechanism is already configured, just increment the `max_wal_senders` and `max_replication_slots` numbers.

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
* `notifications.wal.advisory-lock-id`: ODD Platform uses [PostgreSQL advisory lock](https://www.postgresql.org/docs/current/explicit-locking.html#ADVISORY-LOCKS) in order to make sure that in a case of horizontal scaling only one instance of the Platform processes alert messages. This setting defines advisory lock id. Defaults to `100`
* `notifications.wal.replication-slot-name`: PostgreSQL replication slot name will be created if it doesn't exist yet. Defaults to `odd_platform_replication_slot`
* `notifications.wal.publication-name`: PostgreSQL publication name will be created if it doesn't exist yet. Defaults to `odd_platform_publication_alert`
* `notifications.receivers.slack.url`: [Slack incoming webhook](https://api.slack.com/messaging/webhooks) URL
* `notifications.receivers.webhook.url`: Generic webhook URL
* `odd.platform-base-url`: ODD Platform URL to be used in alert messages' hyperlinks.

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
    webhook:
      url: {webhook_url}
odd:
  platform-base-url: {platform_url}
```
{% endtab %}

{% tab title="Environment variables" %}
```
NOTIFICATIONS_ENABLED=true
NOTIFICATIONS_MESSAGE_DOWNSTREAM-ENTITIES_DEPTH={downstream_entities_depth_to_fetch}
NOTIFICATIONS_WAL_ADVISORY-LOCK-ID={postgresql_advisory_lock_id}
NOTIFICATIONS_WAL_REPLICATION-SLOT-NAME={postgresql_replication_slot_name}
NOTIFICATIONS_WAL_PUBLICATION-NAME={postgresql_publication_name}
NOTIFICATIONS_RECEIVERS_SLACK_URL={slack_incoming_webhook_url}
NOTIFICATIONS_RECEIVERS_SLACK_PLATFORM-BASE-URL={odd_platform_url}
NOTIFICATIONS_RECEIVERS_WEBHOOK_URL={webhook_url}
ODD_PLATFORM_BASE_URL={odd_platform_base_url}
```
{% endtab %}
{% endtabs %}

### Cleaning up

{% hint style="danger" %}
ODD Platform **doesn't clean up** replication slot it has created. If you need to disable Alert Notification functionality, please perform the following steps along with disabling a feature on a ODD Platform side
{% endhint %}

In order to remove replication slot and publication, these SQL queries must be run against the database:

*   ```sql
    SELECT pg_drop_replication_slot('<>');
    ```

    where `<>` is a name of replication slot defined in the ODD Platform. Default is `odd_platform_replication_slot`
*   ```sql
    DROP PUBLICATION IF EXISTS <>;
    ```

    where `<>` is a name of publication defined in the ODD Platform. Default is `odd_platform_publication_alert`

## Enable Data Collaboration

Data collaboration feature allows users to initiate discussion about specific data entity in messengers directly from the ODD Platform. Thread replies are tracked by ODD Platform and saved in it, allowing users to retrieve conversation's context and decisions from one place.

At the moment ODD Platform supports only Slack as a target messenger. It uses Slack APIs to send messages and [Slack Events API](https://api.slack.com/apis/connections/events-api) to receive message's thread replies.

### Creating Slack application

Go to the [Slack apps](https://api.slack.com/apps) website and click on `Create New App -> From an app manifest`

<figure><img src="../.gitbook/assets/image (4).png" alt=""><figcaption><p>Creating an app</p></figcaption></figure>

Select a workspace you want to add an application to and click `Next`

<figure><img src="../.gitbook/assets/image (7).png" alt=""><figcaption><p>Selecting a workspace to install application to</p></figcaption></figure>

Enter the following manifest into the YAML section, replace the `<ODD_PLATFORM_BASE_URL>` with URL of your ODD Platform deployment and click `Next`

```yaml
display_information:
  name: ODD Data Collaboration
features:
  bot_user:
    display_name: ODD Data Collaboration
    always_online: false
oauth_config:
  scopes:
    bot:
      - channels:history
      - channels:read
      - chat:write
      - users:read
      - incoming-webhook
settings:
  event_subscriptions:
    request_url: https://<ODD_PLATFORM_BASE_URL>/api/slack/events
    bot_events:
      - message.channels
  org_deploy_enabled: false
  socket_mode_enabled: false
  token_rotation_enabled: false
```

<figure><img src="../.gitbook/assets/image (3).png" alt=""><figcaption><p>Inserting a YAML manifest</p></figcaption></figure>

Review your application's scopes and permissions and click `Create`

<figure><img src="../.gitbook/assets/image.png" alt=""><figcaption><p>Reviewing scopes and permissions</p></figcaption></figure>

Proceed with Slack instructions on how to install application into workspace and you should be good to go.

### ODD Platform configuration

Following variables need to be defined:

* `datacollaboration.enabled`: must be set to `true`. Defaults to `false`
* `datacollaboration.receive-event-advisory-lock-id`: PostgreSQL advisory lock id for a job, which translates events from messengers to messages. Defaults to `110`
* `datacollaboration.sender-message-advisory-lock-id`: PostgreSQL advisory lock id for a job, which sends messages created in the platform to messengers. Defaults to `120`
* `datacollaboration.message-partition-period`: time interval in days for a message table partition in PostgreSQL. Defaults to `30`
*   `datacollaboration.slack-oauth-token`: Slack application OAuth token used for communicating with Slack. Can be retrieved in the `OAuth & Permissions` section of a Slack application.\


    <figure><img src="../.gitbook/assets/image (2).png" alt=""><figcaption><p>Retrieving OAuth Token</p></figcaption></figure>

{% tabs %}
{% tab title="YAML" %}
```yaml
datacollaboration:
  receive-event-advisory-lock-id: {receive_event_advisory_lock_id}
  sender-message-advisory-lock-id: {sender_message_advisory_lock_id}
  message-partition-period: {message_partition_period}
  enabled: true
  slack-oauth-token: {slack_oauth_token}

odd:
  platform-base-url: {platform_url}
```
{% endtab %}

{% tab title="Environment variables" %}
```
DATACOLLABORATION_ENABLED=true
DATACOLLABORATION_RECEIVE_EVENT_ADVISORY_LOCK_ID={receive_event_advisory_lock_id}
DATACOLLABORATION_SENDER_MESSAGE_ADVISORY_LOCK_ID={sender_message_advisory_lock_id}
DATACOLLABORATION_MESSAGE_PARTITION_PERIOD={message_partition_period}
DATACOLLABORATION_SLACK_OAUTH_TOKEN={slack_oauth_token}
ODD_PLATFORM_BASE_URL={odd_platform_base_url}
```
{% endtab %}
{% endtabs %}
