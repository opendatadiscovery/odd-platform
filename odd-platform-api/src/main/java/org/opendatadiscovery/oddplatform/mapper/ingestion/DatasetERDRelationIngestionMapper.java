package org.opendatadiscovery.oddplatform.mapper.ingestion;

import java.util.List;
import java.util.Map;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.ERDRelationship;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.Relationship;
import org.opendatadiscovery.oddplatform.model.tables.pojos.ErdRelationshipDetailsPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RelationshipsPojo;

public interface DatasetERDRelationIngestionMapper {
    Map<RelationshipsPojo, ErdRelationshipDetailsPojo> mapERDRelations(final List<Relationship> erdRelationship,
                                                                       final Long dataSourceId);

    ErdRelationshipDetailsPojo mapERDRelation(ERDRelationship field);
}
