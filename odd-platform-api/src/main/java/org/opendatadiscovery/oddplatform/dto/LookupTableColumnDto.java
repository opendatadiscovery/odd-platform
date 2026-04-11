package org.opendatadiscovery.oddplatform.dto;

import org.opendatadiscovery.oddplatform.model.tables.pojos.LookupTablesDefinitionsPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LookupTablesPojo;

public record LookupTableColumnDto(LookupTablesPojo tablesPojo,
                                   LookupTablesDefinitionsPojo columnPojo) {
}
