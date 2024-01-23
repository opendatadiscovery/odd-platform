package org.opendatadiscovery.oddplatform.mapper.ingestion;

import org.opendatadiscovery.oddplatform.ingestion.contract.model.Relationship;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RelationshipsPojo;

public interface DatasetRelationIngestionMapper {
    RelationshipsPojo mapToPojo(final Relationship relationship, final Long dataSourceId);
}
