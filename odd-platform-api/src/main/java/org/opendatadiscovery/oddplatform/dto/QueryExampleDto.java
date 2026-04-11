package org.opendatadiscovery.oddplatform.dto;

import java.util.List;
import org.opendatadiscovery.oddplatform.dto.term.LinkedTermDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.QueryExamplePojo;

public record QueryExampleDto(QueryExamplePojo queryExamplePojo,
                              List<DataEntityPojo> linkedEntities,
                              List<LinkedTermDto> linkedTerms) {
}
