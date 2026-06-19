package org.opendatadiscovery.oddplatform.dto.activity;

import com.fasterxml.jackson.annotation.JsonProperty;

public record LookupTableNameActivityStateDto(@JsonProperty("name") String name) {
}
