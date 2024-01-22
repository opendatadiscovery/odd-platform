package org.opendatadiscovery.oddplatform.mapper.ingestion;

import org.opendatadiscovery.oddplatform.ingestion.contract.model.Relationship;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RelationshipPojo;

public interface DatasetRelationIngestionMapper {
    RelationshipPojo mapToPojo(final Relationship relationship, final Long dataSourceId);
}
