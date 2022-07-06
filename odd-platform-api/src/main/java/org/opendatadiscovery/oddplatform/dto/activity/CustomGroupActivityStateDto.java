package org.opendatadiscovery.oddplatform.dto.activity;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record CustomGroupActivityStateDto(Long id, String name,
                                          @JsonProperty("entity_classes") List<Integer> entityClasses,
                                          @JsonProperty("type_id") Integer typeId,
                                          @JsonProperty("namespace_name") String namespaceName,
                                          List<CustomGroupEntityActivityStateDto> entities) {
}
