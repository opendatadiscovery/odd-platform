package org.opendatadiscovery.oddplatform.dto;

import java.util.Set;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TagPojo;

public record DatasetFieldWithTagsDto(DatasetFieldPojo datasetFieldPojo, Set<TagPojo> tags) {
}
