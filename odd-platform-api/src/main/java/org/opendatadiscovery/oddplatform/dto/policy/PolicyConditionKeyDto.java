package org.opendatadiscovery.oddplatform.dto.policy;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Getter
public enum PolicyConditionKeyDto {
    DATA_ENTITY_ODDRN("dataEntity:oddrn"),
    DATA_ENTITY_INTERNAL_NAME("dataEntity:internalName"),
    DATA_ENTITY_EXTERNAL_NAME("dataEntity:externalName"),
    DATA_ENTITY_TYPE("dataEntity:type"),
    DATA_ENTITY_CLASS("dataEntity:class"),
    DATA_ENTITY_DATASOURCE_ODDRN("dataEntity:datasource:oddrn"),
    DATA_ENTITY_DATASOURCE_NAME("dataEntity:datasource:name"),
    DATA_ENTITY_NAMESPACE_NAME("dataEntity:namespace:name"),
    DATA_ENTITY_TAG_NAME("dataEntity:tag:name"),
    DATA_ENTITY_OWNER("dataEntity:owner"),
    DATA_ENTITY_OWNER_TITLE("dataEntity:owner:title"),
    TERM_NAME("term:name"),
    TERM_NAMESPACE_NAME("term:namespace:name"),
    TERM_TAG_NAME("term:tag:name"),
    TERM_OWNER("term:owner"),
    TERM_OWNER_TITLE("term:owner:title");

    private final String value;

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static PolicyConditionKeyDto fromValue(final String value) {
        for (final PolicyConditionKeyDto key : PolicyConditionKeyDto.values()) {
            if (key.value.equals(value)) {
                return key;
            }
        }
        throw new IllegalArgumentException("Unexpected value '" + value + "'");
    }
}
