# Permissions

There are 3 types of permissions in ODD Platform:

* [Data entity permissions](permissions.md#data-entity-permissions)
* [Term permissions](permissions.md#term-permissions)
* [Management permissions](permissions.md#common-permissions)

Data entity permissions are always related to particular data entity or list of data entities. Term permissions allow actions for one or several dictionary terms. Finally, management permissions are about general actions in platform (e.g. create new owner or tag etc.).

This is the full list of permissions divided by types:

#### **Data entity permissions**

* `DATA_ENTITY_INTERNAL_NAME_UPDATE`. Allows to edit/delete data entity's business name
* `DATA_ENTITY_CUSTOM_METADATA_CREATE`. Allows to create custom metadata for data entity
* `DATA_ENTITY_CUSTOM_METADATA_UPDATE`. Allows to edit custom metadata for data entity
* `DATA_ENTITY_CUSTOM_METADATA_DELETE`. Allows to delete custom metadata for data entity
* `DATA_ENTITY_DESCRIPTION_UPDATE`. Allows to edit/delete data entity's custom description
* `DATA_ENTITY_OWNERSHIP_CREATE`. Allows to create ownership for data entity
* `DATA_ENTITY_OWNERSHIP_UPDATE`. Allows to edit title for data entity ownership
* `DATA_ENTITY_OWNERSHIP_DELETE`. Allows to delete ownership for data entity
* `DATA_ENTITY_ADD_TO_GROUP`. Allows to add data entity to manually created group
* `DATA_ENTITY_DELETE_FROM_GROUP`. Allows to remove data entity from manually created group
* `DATA_ENTITY_TAGS_UPDATE`. Allows to edit data entity's tags
* `DATA_ENTITY_ADD_TERM`. Allows to add term for data entity
* `DATA_ENTITY_DELETE_TERM`. Allows to remove term from data entity
* `DATA_ENTITY_ALERT_RESOLVE`. Allows to resolve alerts for data entity
* `DATASET_TEST_RUN_SET_SEVERITY`. Allows to set severity for dataset's quality tests
* `DATASET_FIELD_INFO_UPDATE`. Allows to edit dataset's field information (description and labels)
* `DATASET_FIELD_ENUMS_UPDATE`. Allows to edit dataset's enum values
* `DATA_ENTITY_GROUP_UPDATE`. Allows to edit manually created data entity group
* `DATA_ENTITY_GROUP_DELETE`. Allows to delete manually created data entity group
* `ALL`. Includes all permissions above

#### **Term permissions**

* `TERM_UPDATE`. Allows to edit name/namespace and definition for term
* `TERM_DELETE`. Allows to delete term
* `TERM_TAGS_UPDATE`. Allows to edit tags for term
* `TERM_OWNERSHIP_CREATE`. Allows to create ownerhip for term
* `TERM_OWNERSHIP_UPDATE`. Allows to edit title for term ownership
* `TERM_OWNERSHIP_DELETE`. Allows to delete ownership for term
* `ALL`. Includes all permissions above

#### Management permissions

* `DATA_ENTITY_GROUP_CREATE`. Allows to create data entity group
* `TERM_CREATE`. Allows to create dictionary term
* `DATA_SOURCE_CREATE`. Allows to create data source
* `DATA_SOURCE_UPDATE`. Allows to edit data source
* `DATA_SOURCE_DELETE`. Allows to delete data source
* `DATA_SOURCE_TOKEN_REGENERATE`. Allows to regenerate security token for data source
* `COLLECTOR_CREATE`. Allows to create collector
* `COLLECTOR_UPDATE`. Allows to edit collector
* `COLLECTOR_DELETE`. Allows to delete collector
* `COLLECTOR_TOKEN_REGENERATE`. Allows to regenerate security token for collector
* `NAMESPACE_CREATE`. Allows to create namespace
* `NAMESPACE_UPDATE`. Allows to edit namespace
* `NAMESPACE_DELETE`. Allows to delete namespace
* `TAG_CREATE`. Allows to create tag
* `TAG_UPDATE`. Allows to edit tag
* `TAG_DELETE`. Allows to delete tag
* `LABEL_CREATE`. Allows to create label
* `LABEL_UPDATE`. Allows to edit label
* `LABEL_DELETE`. Allows to delete label
* `OWNER_CREATE`. Allows to create owner
* `OWNER_UPDATE`. Allows to edit owner
* `OWNER_DELETE`. Allows to delete owner
* `OWNER_ASSOCIATION_MANAGE`. Allows to approve/deny user-owner association requests. (for more details please check [user-owner-association.md](user-owner-association.md "mention") section)
* `DIRECT_OWNER_SYNC`. Allows to associate user with owner wihout creating association request
* `POLICY_CREATE`. Allows to create policy
* `POLICY_UPDATE`. Allows to edit policy
* `POLICY_DELETE`. Allows to delete policy
* `ROLE_CREATE`. Allows to create role
* `ROLE_UPDATE`. Allows to edit role
* `ROLE_DELETE`. Allows to delete role
* `ALL`. Includes all permissions above
