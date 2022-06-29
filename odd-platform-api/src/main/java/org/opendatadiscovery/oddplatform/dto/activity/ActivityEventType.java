package org.opendatadiscovery.oddplatform.dto.activity;

import lombok.Getter;

@Getter
public enum ActivityEventType {
    OWNERSHIP_CREATED(false),
    OWNERSHIP_UPDATED(false),
    OWNERSHIP_DELETED(false),
    TAGS_ASSOCIATION_UPDATED(false),
    DATA_ENTITY_CREATED(true),
    DATA_ENTITY_OVERVIEW_UPDATED(true),
    DATA_ENTITY_METADATA_UPDATED(true),
    DATA_ENTITY_SCHEMA_UPDATED(true),
    DATA_ENTITY_RELATION_UPDATED(true),
    TERM_ASSIGNED(false),
    TERM_ASSIGNMENT_DELETED(false),
    DESCRIPTION_UPDATED(false),
    INTERNAL_NAME_UPDATED(false),
    CUSTOM_METADATA_CREATED(false),
    CUSTOM_METADATA_UPDATED(false),
    CUSTOM_METADATA_DELETED(false),
    DATASET_FIELD_VALUES_UPDATED(false),
    DATASET_FIELD_INFORMATION_UPDATED(false),
    CUSTOM_GROUP_CREATED(false),
    CUSTOM_GROUP_UPDATED(false),
    CUSTOM_GROUP_DELETED(false);

    private final boolean systemEvent;

    ActivityEventType(final boolean systemEvent) {
        this.systemEvent = systemEvent;
    }
}
