# Policies

ODD Platform allows to manage access to resources by creating policies and attaching them to owners through roles.&#x20;

Policies are described in JSON format and validated with [JSON Schema](https://json-schema.org).&#x20;

## JSON policy structure

Each policy is represented by an array of statements and each statement defines a resource with optional conditions and [permissions](permissions.md) which will be allowed for given resource.

{% code title="Basic policy structure" %}
```json
{
  "statements": [
    {
      "resource": {
        "type": "",
        "conditions": {}
      },
      "permissions": []
    },
    {
      "resource": {
        "type": "",
        "conditions": {}
      },
      "permissions": []
    }
  ]
}
```
{% endcode %}

### Resource type

There are 3 possible types of policy resource:

* **DATA\_ENTITY** - Indicates, that current permissions are applied for data entity
* **TERM** - Indicates, that current permissions are applied for dictionary term
* **MANAGEMENT** - Indicates, that current permissions are general and work all over the platform

{% hint style="info" %}
Each type can be combined only with associated permissions and conditions, e.g. if you describe statement for **DATA\_ENTITY** type you can only use data entity's conditions and [permissions](permissions.md).
{% endhint %}

### Conditions

Conditions allow to specify the circumstances under which the policy grants permission.&#x20;

This is an optional field and in case of absence, permissions will be applied to all resource type entries.

{% hint style="warning" %}
Conditions can't be applied to **MANAGEMENT** resource type
{% endhint %}

In ODD Platform we have pre-defined [condition operators](policies.md#condition-operations) and [fields](policies.md#con), which can be used with these operators.

#### Condition operators

&#x20;Currently we support next operators:

* `all` - all conditions under this operator must be positive
* `any` - at least one condition under this operation must be positive
* `eq` **** - [condition field](policies.md#con) must be equal to some value
* `not_eq` **** - **** [condition field](policies.md#con) must not be equal to some value
* `match` **** - [condition field](policies.md#con) must match some value
* `not_match` **** - **** [condition field](policies.md#con) must not match some value
* `is` **** - **** [condition field](policies.md#con) must be true
* `not_is` **** - **** [condition field](policies.md#con) must be false

#### **Condition fields**

There are couple of pre-defined fields, which can be used in conditions. Each resource type has its own fields.

**Data entity**

* `dataEntity:oddrn` - data entity's ODDRN
* `dataEntity:internalName` - data entity's business name
* `dataEntity:externalName` - data entity's ingested name
* `dataEntity:type` - data entity's type name
* `dataEntity:class` - data entity's class name
* `dataEntity:datasource:oddrn` - data entity's datasource ODDRN
* `dataEntity:datasource:name` - data entity's datasource name
* `dataEntity:namespace:name` - data entity's namespace name
* `dataEntity:tag:name` - data entity's tag name
* `dataEntity:owner` - data entity's owner
* `dataEntity:owner:title` - data entity's owner title

**Term**

* `term:name` - term's name
* `term:namespace:name` - term's namespace name
* `term:tag:name` - term's tag name
* `term:owner` - term's owner
* `term:owner:title` - term's owner title

#### Condition examples

1.  User must be term's owner, term must be in Open Data Discovery namespace and have tag, which name equals to `Test`.

    ```json
    {
      "all": [
        {
          "is": "term:owner"
        },
        {
          "eq": {
            "term:namespace:name": "Open Data Discovery"
          }
        },
        {
          "match": {
            "term:tag:name": "Test"
          }
        }
      ]
    }
    ```
2.  At least one of the conditions must be positive:  User must be data entity's owner **OR** data entity shouldn't have tag `PII`.

    ```json
    {
      "any": [
        {
          "is": "dataEntity:owner"
        },
        {
          "not_eq": {
            "dataEntity:tag:name": "PII"
          }
        }
      ]
    }
    ```

## Permissions

Please check [permissions.md](permissions.md "mention") section for all available permissions list.

## Policy examples

#### Data entity policy with conditions

Policy allows to update business name, description and custom metadata if user is data entity's owner and this data entity is in `Open Data Discovery` namespace

```json
{
  "statements": [
    {
      "resource": {
        "type": "DATA_ENTITY",
        "conditions": {
          "all": [
            {
              "is": "dataEntity:owner"
            },
            {
              "eq": {
                "dataEntity:namespace:name": "Open Data Discovery"
              }
            }
          ]
        }
      },
      "permissions": [
        "DATA_ENTITY_INTERNAL_NAME_UPDATE",
        "DATA_ENTITY_CUSTOM_METADATA_CREATE",
        "DATA_ENTITY_CUSTOM_METADATA_UPDATE",
        "DATA_ENTITY_CUSTOM_METADATA_DELETE",
        "DATA_ENTITY_DESCRIPTION_UPDATE"
      ]
    }
  ]
}
```

#### Data entity policy without conditions

All actions are allowed for all data entities

```json
{
  "statements": [
    {
      "resource": {
        "type": "DATA_ENTITY"
      },
      "permissions": [
        "ALL"
      ]
    }
  ]
}
```

#### Dictionary term policy with conditions

Policy allows to update term information and ownership if it has `Customer` tag

```json
{
  "statements": [
    {
      "resource": {
        "type": "TERM",
        "conditions": {
          "eq": {
            "term:tag:name": "Customer"
          }
        }      
      },
      "permissions": [
        "TERM_UPDATE",
        "TERM_OWNERSHIP_CREATE",
        "TERM_OWNERSHIP_UPDATE",
        "TERM_OWNERSHIP_DELETE"
      ]
    }
  ]
}
```

#### Management policy

Policy allows to manage datasources, collectors and namespaces

```json
{
  "statements": [
    {
      "resource": {
        "type": "MANAGEMENT"
      },
      "permissions": [
        "DATA_SOURCE_CREATE",
        "DATA_SOURCE_UPDATE",
        "DATA_SOURCE_DELETE",
        "DATA_SOURCE_TOKEN_REGENERATE",
        "COLLECTOR_CREATE",
        "COLLECTOR_UPDATE",
        "COLLECTOR_DELETE",
        "COLLECTOR_TOKEN_REGENERATE",
        "NAMESPACE_CREATE",
        "NAMESPACE_UPDATE",
        "NAMESPACE_DELETE"
      ]
    }
  ]
}
```

#### Combined policy

Policy allows to edit term information and permits all actions for data entities from `Finance` namespace.

```json
{
  "statements": [
    {
      "resource": {
        "type": "TERM",
        "conditions": {
          "eq": {
            "term:namespace:name": "Finance"
          }
        }
      },
      "permissions": [
        "TERM_UPDATE"
      ]
    },
    {
      "resource": {
        "type": "DATA_ENTITY",
        "conditions": {
          "eq": {
            "dataEntity:namespace:name": "Finance"
          }
        }
      },
      "permissions": [
        "ALL"
      ]
    }
  ]
}
```
