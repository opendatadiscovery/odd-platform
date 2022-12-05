# OAUTH2/OIDC

ODD Platform supports different OIDC/OAuth2 providers. Currently there are:

* [AWS Cognito](oauth2-oidc.md#aws-cognito)
* [Github](oauth2-oidc.md#github)
* [Google](oauth2-oidc.md#google)
* [Okta](oauth2-oidc.md#other-oidc-providers)
* [Keycloak](oauth2-oidc.md#other-oidc-providers)
* [Custom OIDC provider](oauth2-oidc.md#other-oidc-providers)

It is possible to have multiple providers at the same time (e.g. you want to allow to authenticate users from Github and Google, or from multiple Cognito user pools). Configuration properties name for each provider must fit the pattern `auth.oauth2.client.{client_id}.{client_parameter}`, where `client_id` is provider identifier.

There are some common parameters which are used across all providers:

* `auth.type`. Must be set to OAUTH2
* `auth.oauth2.client.{client-id}.provider`. Provider code, which helps application to understand which provider is used.
* `auth.oauth2.client.{client-id}.client-id`. Client ID obtained from provider
* `auth.oauth2.client.{client-id}.client-secret`. Client secret obtained from provider
* `auth.oauth2.client.{client-id}.client-name`. Custom name, which will be shown on UI in case of multiple providers enabled. (optional)
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

If issuer uri can provide this info above parameters might be skipped.
{% endhint %}

* `auth.oauth2.client.{client-id}.username-attribute`. Defines which token claim should be picked as username in ODD Platform
* `auth.oauth2.client.{client-id}.admin-attribute`. Defines which token claim is responsible for admin principal
* `auth.oauth2.client.{client-id}.admin-principals`. List of users, who will have ADMIN role on login (for detailed explanation please check [roles.md](../authorization/roles.md "mention") section).

#### AWS Cognito

AWS Cognito provider can be configured using common oauth properties and couple of provider specific properties:

* `auth.oauth2.client.{client-id}.admin-groups`. List of admin groups. Groups are retrieved from `cognito:groups` token claim.
* `auth.oauth2.client.{client-id}.logout-uri`. Application will be redirected to this URI after user logout for removing session on cognito side. Please check [AWS Docs](https://docs.aws.amazon.com/cognito/latest/developerguide/logout-endpoint.html) for more details.

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

You can use Github as your OAUTH provider. ODD platform can retrieve info about user organizations and teams and use it for granting ADMIN permissions (for detailed explanation please check [roles.md](../authorization/roles.md "mention") section). There are some github specific properties, which can be set:

* `auth.oauth2.client.{client-id}.organization-name`. Restricts login only for users from this particular organization
* `auth.oauth2.client.{client-id}.admin-groups`. Grants admin privilegies for users who are members of these teams, which are inside above organization

{% hint style="warning" %}
In order to retrieve organization information from github, **user:read** and **read:org** scopes must be included
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
