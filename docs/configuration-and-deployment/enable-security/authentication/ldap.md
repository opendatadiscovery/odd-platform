# LDAP

ODD Platform can be configured to use existing LDAP server for users authentication. There are several properties, that need to be set in order to enable this kind of security.

**Define authentication type**

{% tabs %}
{% tab title="YAML" %}
```yaml
auth:
    type: LDAP
```
{% endtab %}

{% tab title="Environment variables" %}
```
AUTH_TYPE=LDAP
```
{% endtab %}
{% endtabs %}

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
AUTH_LDAP_ACTIVE_DIRECTORY_DOMAIN="example.com"
```
{% endtab %}
{% endtabs %}

**Final configuration example**

{% tabs %}
{% tab title="YAML" %}
```yaml
auth:
    type: LDAP
    ldap:
        url: "ldap://localhost:389"
        username: admin
        password: password
        dn-pattern: "uid={0},ou=people,dc=mycompany,dc=com"
        groups:
            search-base: "dc=mycompany,dc=com"
            filter: "(member={0})"
            admin-groups: admin
```
{% endtab %}

{% tab title="Environment variables" %}
```
AUTH_TYPE=LDAP
AUTH_LDAP_URL=ldap://localhost:389
AUTH_LDAP_USERNAME=admin
AUTH_LDAP_PASSWORD=password
AUTH_LDAP_DN_PATTERN="uid={0},ou=people"
AUTH_LDAP_GROUPS_SEARCH_BASE="dc=mycompany,dc=com"
AUTH_LDAP_GROUPS_FILTER="(member={0})"
AUTH_LDAP_GROUPS_ADMIN_GROUPS=admin
```
{% endtab %}
{% endtabs %}
