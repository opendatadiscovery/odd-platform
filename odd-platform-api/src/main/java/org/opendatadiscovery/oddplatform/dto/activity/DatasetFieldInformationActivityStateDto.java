package org.opendatadiscovery.oddplatform.dto.activity;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import org.jooq.JSONB;

public record DatasetFieldInformationActivityStateDto(Long id, String name,
                                                      @JsonProperty("internal_name") String internalName,
                                                      JSONB type, String description,
                                                      List<DatasetFieldTagActivityStateDto> tags) {
}