package org.opendatadiscovery.oddplatform.dto.activity;

import java.util.List;
import org.jooq.JSONB;

public record DatasetFieldValuesActivityStateDto(Long id, String name, JSONB type, String description,
                                                 List<DatasetFieldEnumValuesActivityStateDto> enumValues) {
}