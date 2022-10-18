package org.opendatadiscovery.oddplatform.notification.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record OwnershipPair(@JsonProperty("owner_name") String ownerName,
                            @JsonProperty("title_name") String titleName) {
}
