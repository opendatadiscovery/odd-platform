package org.opendatadiscovery.oddplatform.dto;

import org.opendatadiscovery.oddplatform.model.tables.pojos.TagPojo;

public record TagDto(TagPojo tagPojo, Long usedCount) {
}
