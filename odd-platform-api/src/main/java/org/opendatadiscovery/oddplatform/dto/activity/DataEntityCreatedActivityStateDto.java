package org.opendatadiscovery.oddplatform.dto.activity;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record DataEntityCreatedActivityStateDto(Long id,
                                                @JsonProperty("external_name") String externalName,
                                                String oddrn,
                                                List<Integer> classes,
                                                @JsonProperty("type_id") Integer typeId) {
}
