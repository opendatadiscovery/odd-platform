package org.opendatadiscovery.oddplatform.dto.activity;

import com.fasterxml.jackson.annotation.JsonProperty;

public record CustomNameActivityStateDto(@JsonProperty("internal_name") String internalName) {
}
