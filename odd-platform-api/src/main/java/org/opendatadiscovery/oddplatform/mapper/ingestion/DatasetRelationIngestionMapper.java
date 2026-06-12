package org.opendatadiscovery.oddplatform.mapper.ingestion;

import org.opendatadiscovery.oddplatform.dto.ingestion.DataEntityIngestionDto.DataRelationshipDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RelationshipsPojo;

public interface DatasetRelationIngestionMapper {

    RelationshipsPojo mapToPojo(final DataRelationshipDto relationship, final RelationshipsPojo oldPojo);

    RelationshipsPojo mapToPojo(final DataRelationshipDto relationship);
}
