package org.opendatadiscovery.oddplatform.dto.activity;

import com.fasterxml.jackson.annotation.JsonProperty;

public record TermActivityStateDto(@JsonProperty("term_id") Long termId, String term, String namespace) {
}
