package org.opendatadiscovery.oddplatform.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record OwnershipPair(@JsonProperty("owner_name") String ownerName,
                            @JsonProperty("title_name") String titleName) {
}
