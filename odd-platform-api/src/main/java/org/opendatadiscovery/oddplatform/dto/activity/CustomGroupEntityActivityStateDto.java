package org.opendatadiscovery.oddplatform.dto.activity;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record CustomGroupEntityActivityStateDto(Long id,
                                                @JsonProperty("internal_name") String internalName,
                                                @JsonProperty("external_name") String externalName,
                                                @JsonProperty("entity_classes") List<Integer> entityClasses) {
}
