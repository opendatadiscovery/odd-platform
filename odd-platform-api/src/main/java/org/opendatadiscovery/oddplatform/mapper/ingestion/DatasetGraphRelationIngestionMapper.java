package org.opendatadiscovery.oddplatform.mapper.ingestion;

import java.util.List;
import java.util.Map;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.GraphRelationship;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.Relationship;
import org.opendatadiscovery.oddplatform.model.tables.pojos.GraphRelationshipPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RelationshipsPojo;

public interface DatasetGraphRelationIngestionMapper {
    Map<RelationshipsPojo, GraphRelationshipPojo> mapGraphRelations(final List<Relationship> relationships,
                                                                   final Long dataSourceId);

    GraphRelationshipPojo mapGraphRelation(final GraphRelationship field);
}
