package org.opendatadiscovery.oddplatform.mapper.ingestion;

import org.opendatadiscovery.oddplatform.ingestion.contract.model.ERDRelationship;
import org.opendatadiscovery.oddplatform.model.tables.pojos.ErdRelationshipDetailsPojo;

public interface DatasetERDRelationIngestionMapper {
    ErdRelationshipDetailsPojo mapERDRelation(ERDRelationship field);
}
