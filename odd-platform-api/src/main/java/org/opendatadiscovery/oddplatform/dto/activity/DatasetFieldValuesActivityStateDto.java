package org.opendatadiscovery.oddplatform.dto.activity;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import org.jooq.JSONB;

public record DatasetFieldValuesActivityStateDto(
    Long id,
    String name,
    JSONB type,
    String description,
    @JsonProperty("enum_values") List<DatasetFieldEnumValuesActivityStateDto> enumValues) {
}