package org.opendatadiscovery.oddplatform.dto.activity;

import com.fasterxml.jackson.annotation.JsonProperty;

public record OwnershipActivityStateDto(@JsonProperty("owner_name") String ownerName,
                                        @JsonProperty("role_name") String roleName) {
}
