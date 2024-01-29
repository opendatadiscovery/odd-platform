package org.opendatadiscovery.oddplatform.mapper.ingestion;

import org.opendatadiscovery.oddplatform.ingestion.contract.model.GraphRelationship;
import org.opendatadiscovery.oddplatform.model.tables.pojos.GraphRelationshipPojo;

public interface DatasetGraphRelationIngestionMapper {
    GraphRelationshipPojo mapGraphRelation(final GraphRelationship field);
}
