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

## Enable security

While ODD Platform doesn't have its own registration and authentication process, it supports several third-party authentication mechanisms as well as an absence of authentication at all. To define what mechanism to use, set `auth.type` variable.

By default, the authentication option is disabled:

{% hint style="info" %}
**`auth.type`** variable must be set to **`DISABLED`**
{% endhint %}

No additional settings are required.

### Authentication: Login Form

{% hint style="info" %}
**`auth.type`** variable must be set to **`LOGIN_FORM`**
{% endhint %}

{% hint style="danger" %}
We don't recommend to use **`LOGIN_FORM`** authentication mechanism in production!
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
```
AUTH_TYPE=LOGIN_FORM
AUTH_LOGIN-FORM-CREDENTIALS=susan:susan_password,dave:dave_password
```
{% endtab %}
{% endtabs %}

### Authentication: OAuth2

{% hint style="info" %}
**`auth.type`** variable must be set to **OAUTH2**
{% endhint %}

ODD Platform supports different OIDC/OAuth2 providers. Currently there are:

* [AWS Cognito](odd-platform.md#aws-cognito)
* [Github](odd-platform.md#github)
* [Google](odd-platform.md#google)
* Okta
* Keycloak
* Custom OIDC provider

It is possible to have multiple providers at the same time (e.g. you want to allow to authenticate users from Github and Google, or from multiple Cognito user pools). Configuration properties name for each provider must fit the pattern `auth.oauth2.client.{client_id}.{client_parameter}`, where `client_id` is provider identifier.

There are some common parameters which are used across all providers:

* `auth.oauth2.client.{client-id}.provider`. Provider code, which helps application to understand which provider is used.
* `auth.oauth2.client.{client-id}.client-id`. Client ID obtained from provider
* `auth.oauth2.client.{client-id}.client-secret`. Client secret obtained from provider
* `auth.oauth2.client.{client-id}.client-name`. Custom name, which will be shown on UI. (optional)
* `auth.oauth2.client.{client-id}.redirect-uri`. Redirect URL. Must be defined as `{domain}/login/oauth2/code/{client-id}`
* `auth.oauth2.client.{client-id}.scope`. Authorization scopes which are allowed for application

{% hint style="warning" %}
For all OIDC providers **openid** scope must be included!
{% endhint %}

* `auth.oauth2.client.{client-id}.issuer-uri`. URI that can either be an OpenID Connect discovery endpoint or an OAuth 2.0 Authorization Server Metadata endpoint defined by RFC 8414.

{% hint style="info" %}
Given that the issuer uri is composed of a host and a path, ODD Platform tries to fetch information, calling following URLs:

* host/.well-known/openid-configuration/path
* issuer/.well-known/openid-configuration
* host/.well-known/oauth-authorization-server/path

If you don't have issuer uri or if you want to override some values, there are special properties, which should be defined:

* `auth.oauth2.client.{client-id}.authorization-uri.`Authorization URI for the provider.
* `auth.oauth2.client.{client-id}.token-uri.`Token URI for the provider.
* `auth.oauth2.client.{client-id}.user-info-uri.`User info URI for the provider.
* `auth.oauth2.client.{client-id}.jwk-set-uri.`JWK set URI for the provider.

If issuer uri can provide this info above parameters can be skipped.
{% endhint %}

* `auth.oauth2.client.{client-id}.username-attribute`. Defines which token claim should be picked as username in ODD Platform
* `auth.oauth2.client.{client-id}.admin-attribute`. Defines which token claim is responsible for admin principal
* `auth.oauth2.client.{client-id}.admin-principals`. List of admins. Should be used the values which are retrieved from token using admin attribute property.

#### AWS Cognito

AWS Cognito provider can be configured using common oauth properties and couple of provider specific properties:

* `auth.oauth2.client.{client-id}.admin-groups`. List of admin groups. Groups are retrieved from `cognito:groups` token claim.
* `auth.oauth2.client.{client-id}.logout-uri`. URI, application will be redirected to after user logout.

{% hint style="info" %}
`auth.oauth2.client.{client-id}.username-attribute` is `cognito:username` by default
{% endhint %}

{% tabs %}
{% tab title="YAML" %}
```yaml
auth:
    type: OAUTH2
    oauth2:
        client:
            cognito:
                provider: cognito
                client-id: {client_id}
                client-secret: {client_secret}
                scope: openid
                redirect-uri: {host}/login/oauth2/code/cognito
                client-name: Cognito
                issuer-uri: {issuer_uri}
                logout-uri: {logout_uri}
                admin-groups: admin
                admin-attribute: cognito:username
                admin-principals: john,david
```
{% endtab %}

{% tab title="Environment variables" %}
```
AUTH_TYPE=OAUTH2
AUTH_OAUTH2_CLIENT_COGNITO_PROVIDER=cognito
AUTH_OAUTH2_CLIENT_COGNITO_CLIENT_ID={client_id}
AUTH_OAUTH2_CLIENT_COGNITO_CLIENT_SECRET={client_secret}
AUTH_OAUTH2_CLIENT_COGNITO_SCOPE=openid
AUTH_OAUTH2_CLIENT_COGNITO_REDIRECT_URI={host}/login/oauth2/code/cognito
AUTH_OAUTH2_CLIENT_COGNITO_CLIENT_NAME=Cognito
AUTH_OAUTH2_CLIENT_COGNITO_ISSUER_URI={issuer_uri}
AUTH_OAUTH2_CLIENT_COGNITO_LOGOUT_URI={logout_uri}
AUTH_OAUTH2_CLIENT_COGNITO_ADMIN_GROUPS=admin
AUTH_OAUTH2_CLIENT_COGNITO_ADMIN_ATTRIBUTE=cognito:username
AUTH_OAUTH2_CLIENT_COGNITO_ADMIN_PRINCIPALS=john,david
```
{% endtab %}
{% endtabs %}

#### Github

You can use Github as your OAUTH provider. ODD platform can retrieve info about user organizations and teams and use it for granting admin permissions. There are some github specific properties, which can be set:

* `auth.oauth2.client.{client-id}.organization-name`. Restricts to login only for users from this particular organization
* `auth.oauth2.client.{client-id}.admin-groups`. Grants admin privilegies for users who are members of these teams, which are inside above organization

{% hint style="warning" %}
In order to retrieve organization information from github **user:read** and **read:org** scopes must be included
{% endhint %}

{% tabs %}
{% tab title="YAML" %}
```yaml
auth:
    type: OAUTH2
    oauth2:
        client:
            github:
                provider: github
                client-id: {client_id}
                client-secret: {client_secret}
                scope: user:read,read:org
                redirect-uri: {host}/login/oauth2/code/github
                client-name: Github
                authorization-uri: https://github.com/login/oauth/authorize
                token-uri: https://github.com/login/oauth/access_token
                user-info-uri: https://api.github.com/user
                user-name-attribute: login
                organization-name: my-cool-org
                admin-groups: admin
                admin-attribute: login
                admin-principals: john,david
```
{% endtab %}

{% tab title="Environment variables" %}
```
AUTH_TYPE=OAUTH2
AUTH_OAUTH2_CLIENT_GITHUB_PROVIDER=github
AUTH_OAUTH2_CLIENT_GITHUB_CLIENT_ID={client_id}
AUTH_OAUTH2_CLIENT_GITHUB_CLIENT_SECRET={client_secret}
AUTH_OAUTH2_CLIENT_GITHUB_SCOPE=user:read,read:org
AUTH_OAUTH2_CLIENT_GITHUB_REDIRECT_URI={host}/login/oauth2/code/github
AUTH_OAUTH2_CLIENT_GITHUB_CLIENT_NAME=Github
AUTH_OAUTH2_CLIENT_GITHUB_AUTHORIZATION_URI=https://github.com/login/oauth/authorize
AUTH_OAUTH2_CLIENT_GITHUB_TOKEN_URI=https://github.com/login/oauth/access_token
AUTH_OAUTH2_CLIENT_GITHUB_USER_INFO_URI=https://api.github.com/user
AUTH_OAUTH2_CLIENT_GITHUB_USER_NAME_ATTRIBUTE=login
AUTH_OAUTH2_CLIENT_GITHUB_ORGANIZATION_NAME=my-cool-org
AUTH_OAUTH2_CLIENT_GITHUB_ADMIN_GROUPS=admin
AUTH_OAUTH2_CLIENT_GITHUB_ADMIN_ATTRIBUTE=login
AUTH_OAUTH2_CLIENT_GITHUB_ADMIN_PRINCIPALS=john,david
```
{% endtab %}
{% endtabs %}

#### Google

ODD Platform allows to authenticate users via Google. You can restrict users to login under your organization domain. This is controlled by `auth.oauth2.client.{client-id}.allowed-domain` property.

{% tabs %}
{% tab title="YAML" %}
```yaml
auth:
    type: OAUTH2
    oauth2:
        client:
            google:
                provider: google
                client-id: {client_id}
                client-secret: {client_secret}
                scope: openid,profile,email
                redirect-uri: {host}/login/oauth2/code/google
                client-name: Google
                issuer-uri: https://accounts.google.com
                user-name-attribute: name
                admin-attribute: email
                admin-principals: john@odd.com,david@odd.com
                allowed-domain: odd.com
```
{% endtab %}

{% tab title="Environment variables" %}
```
AUTH_TYPE=OAUTH2
AUTH_OAUTH2_CLIENT_GOOGLE_PROVIDER=google
AUTH_OAUTH2_CLIENT_GOOGLE_CLIENT_ID={client_id}
AUTH_OAUTH2_CLIENT_GOOGLE_CLIENT_SECRET={client_secret}
AUTH_OAUTH2_CLIENT_GOOGLE_SCOPE=openid,profile,email
AUTH_OAUTH2_CLIENT_GOOGLE_REDIRECT_URI={host}/login/oauth2/code/google
AUTH_OAUTH2_CLIENT_GOOGLE_CLIENT_NAME=Google
AUTH_OAUTH2_CLIENT_GOOGLE_ISSUER_URI=https://accounts.google.com
AUTH_OAUTH2_CLIENT_GOOGLE_USER_NAME_ATTRIBUTE=name
AUTH_OAUTH2_CLIENT_GOOGLE_ADMIN_ATTRIBUTE=email
AUTH_OAUTH2_CLIENT_GOOGLE_ADMIN_PRINCIPALS=john@odd.com,david@odd.com
AUTH_OAUTH2_CLIENT_GOOGLE_ALLOWED_DOMAIN=odd.com
```
{% endtab %}
{% endtabs %}

#### Other OIDC providers

ODD Platform doesn't have any specific parameters for other providers, so they can be easily configured using default parameters. You can check examples below for OKTA and Keycloak OIDC providers.

{% tabs %}
{% tab title="OKTA YAML" %}
```yaml
auth:
    type: OAUTH2
    oauth2:
        client:
            okta:
                provider: okta
                client-id: {client_id}
                client-secret: {client_secret}
                scope: openid,profile,email
                redirect-uri: {host}/login/oauth2/code/okta
                client-name: Okta
                issuer-uri: {okta_issuer_uri}
                user-name-attribute: email
                admin-attribute: email
                admin-principals: john@odd.com,david@odd.com
```
{% endtab %}

{% tab title="OKTA Environment variables" %}
```
AUTH_TYPE=OAUTH2
AUTH_OAUTH2_CLIENT_OKTA_PROVIDER=google
AUTH_OAUTH2_CLIENT_OKTA_CLIENT_ID={client_id}
AUTH_OAUTH2_CLIENT_OKTA_CLIENT_SECRET={client_secret}
AUTH_OAUTH2_CLIENT_OKTA_SCOPE=openid,profile,email
AUTH_OAUTH2_CLIENT_OKTA_REDIRECT_URI={host}/login/oauth2/code/okta
AUTH_OAUTH2_CLIENT_OKTA_CLIENT_NAME=Okta
AUTH_OAUTH2_CLIENT_OKTA_ISSUER_URI={issuer_uri}
AUTH_OAUTH2_CLIENT_OKTA_USER_NAME_ATTRIBUTE=email
AUTH_OAUTH2_CLIENT_OKTA_ADMIN_ATTRIBUTE=email
AUTH_OAUTH2_CLIENT_OKTA_ADMIN_PRINCIPALS=john@odd.com,david@odd.com
```
{% endtab %}
{% endtabs %}

{% tabs %}
{% tab title="Keycloak YAML" %}
```yaml
auth:
    type: OAUTH2
    oauth2:
        client:
            keycloak:
                provider: keycloak
                client-id: {client_id}
                client-secret: {client_secret}
                scope: openid,profile,email
                redirect-uri: {host}/login/oauth2/code/keycloak
                client-name: Keycloak
                issuer-uri: {keycloak_issuer_uri}
                user-name-attribute: preferred_username
                admin-attribute: preferred_username
                admin-principals: john,davidyam
```
{% endtab %}

{% tab title="Keycloak Environment variables" %}
```
AUTH_TYPE=OAUTH2
AUTH_OAUTH2_CLIENT_KEYCLOAK_PROVIDER=keycloak
AUTH_OAUTH2_CLIENT_KEYCLOAK_CLIENT_ID={client_id}
AUTH_OAUTH2_CLIENT_KEYCLOAK_CLIENT_SECRET={client_secret}
AUTH_OAUTH2_CLIENT_KEYCLOAK_SCOPE=openid,profile,email
AUTH_OAUTH2_CLIENT_KEYCLOAK_REDIRECT_URI={host}/login/oauth2/code/keycloak
AUTH_OAUTH2_CLIENT_KEYCLOAK_CLIENT_NAME=Keycloak
AUTH_OAUTH2_CLIENT_KEYCLOAK_ISSUER_URI={issuer_uri}
AUTH_OAUTH2_CLIENT_KEYCLOAK_USER_NAME_ATTRIBUTE=preferred_username
AUTH_OAUTH2_CLIENT_KEYCLOAK_ADMIN_ATTRIBUTE=preferred_username
AUTH_OAUTH2_CLIENT_KEYCLOAK_ADMIN_PRINCIPALS=john,david
```
{% endtab %}
{% endtabs %}

### Authentication: LDAP

ODD Platform can be configured to use existing LDAP server for users authentication. There are several properties, that need to be set in order to enable this kind of security.

{% hint style="info" %}
**`auth.type`** variable must be set to **LDAP**
{% endhint %}

#### Connect to LDAP server

There are 3 properties, which are responsible for connecting to LDAP server

* `auth.ldap.url`: LDAP server url (required)
* `auth.ldap.username`: The username (principal) to use when authenticating with the LDAP server
* `auth.ldap.password`: The password (credentials) to use when authenticating with the LDAP server

{% hint style="info" %}
Username and password are not required. If they are not set, operations will be performed by using an anonymous (unauthenticated) context
{% endhint %}

{% tabs %}
{% tab title="YAML" %}
```yaml
auth:
    ldap:
        url: "ldap://localhost:389"
        username: admin
        password: password
```
{% endtab %}

{% tab title="Environment variables" %}
```
AUTH_LDAP_URL=ldap://localhost:389
AUTH_LDAP_USERNAME=admin
AUTH_LDAP_PASSWORD=password
```
{% endtab %}
{% endtabs %}

#### Perform users search

There are 2 ways of how to retrieve users in LDAP server.

1. Define DN pattern of user names. This is great, when all users are stored under a single node in a directory.
2. Setup LDAP search filter.

{% tabs %}
{% tab title="YAML" %}
**DN pattern**

This is an example of how user DN pattern can be defined. In this case DN for the user will be built by substituting login in the supplied pattern instead of 0.

```yaml
auth:
    ldap:
        dn-pattern: "uid={0},ou=people,dc=mycompany,dc=com"
```

**Search filter**

This is an example of using search filter instead of DN pattern. If a user search base isn’t supplied, the search will be performed from the root.

```yaml
auth:
    ldap:
        user-filter:
            search-base: "ou=people,dc=mycompany,dc=com"
            filter: "(uid={0})"
```
{% endtab %}

{% tab title="Environment variables" %}
**DN pattern**

This is an example of how user DN pattern can be defined. In this case DN for the user will be built by substituting login in the supplied pattern

```
AUTH_LDAP_DN_PATTERN="uid={0},ou=people"
```

**Search filter**

This is an example of using search filter instead of DN pattern. If a user search base isn’t supplied, the search will be performed from the root.

```
AUTH_LDAP_USER_FILTER_SEARCH_BASE="ou=people"
AUTH_LDAP_USER_FILTER_FILTER="uid={0}"
```
{% endtab %}
{% endtabs %}

{% hint style="warning" %}
It is required to set up one of those search methods, otherwise application start will fail
{% endhint %}

#### Define admin groups

ODD platform can get LDAP groups, which user is belongs to. Thus it is possible to define, which groups will grant admin priviligies. There are several properties, that need to be set in order to allow ODD platform to do this:

* `auth.ldap.groups.search-base`: The base DN from which the search for group membership should be performed. By default it will be performed from the root.
*   `auth.ldap.groups.filter`: The pattern to be used for the user search. Default value is

    `(member={0})`, where user DN will be placed instead of 0.
* `auth.ldap.groups.admin-groups`: List of groups, which members will be granted admin permissions.

{% tabs %}
{% tab title="YAML" %}
```yaml
auth:
    ldap:
        groups:
            search-base: "dc=mycompany,dc=com"
            filter: "(member={0})"
            admin-groups: admin
```
{% endtab %}

{% tab title="Environment variables" %}
```
AUTH_LDAP_GROUPS_SEARCH_BASE="dc=mycompany,dc=com"
AUTH_LDAP_GROUPS_FILTER="(member={0})"
AUTH_LDAP_GROUPS_ADMIN_GROUPS=admin
```
{% endtab %}
{% endtabs %}

#### Active directory

If you are using Active Directory as LDAP server there are additional properties, that need to be set

* `auth.ldap.active-directory.enabled` : Must be set to `true`
* `auth.ldap.active-directory.domain`: Domain name

{% tabs %}
{% tab title="YAML" %}
```yaml
auth:
    ldap:
        active-directory:
            enabled: true
            domain: "example.com"
```
{% endtab %}

{% tab title="Environment variables" %}
```
AUTH_LDAP_ACTIVE_DIRECTORY_ENABLED=true
AUTH_LDAP_ACTIVE_DIRECTORY_DOMAIN=example.com
```
{% endtab %}
{% endtabs %}

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
```
NOTIFICATIONS_ENABLED=true
NOTIFICATIONS_MESSAGE_DOWNSTREAM-ENTITIES_DEPTH={downstream_entities_depth_to_fetch}
NOTIFICATIONS_WAL_ADVISORY-LOCK-ID={postgresql_advisory_lock_id}
NOTIFICATIONS_WAL_REPLICATION-SLOT-NAME={postgresql_replication_slot_name}
NOTIFICATIONS_WAL_PUBLICATION-NAME={postgresql_publication_name}
NOTIFICATIONS_RECEIVERS_SLACK_URL={slack_incoming_webhook_url}
NOTIFICATIONS_RECEIVERS_SLACK_PLATFORM-BASE-URL={odd_platform_url}
NOTIFICATIONS_RECEIVERS_WEBHOOK_URL={webhook_url}
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
