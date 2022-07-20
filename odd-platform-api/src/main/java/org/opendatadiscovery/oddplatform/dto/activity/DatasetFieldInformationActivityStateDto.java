package org.opendatadiscovery.oddplatform.dto.activity;

import java.util.List;
import org.jooq.JSONB;

public record DatasetFieldInformationActivityStateDto(Long id, String name, JSONB type, String description,
                                                      List<DatasetFieldLabelActivityStateDto> labels) {
}