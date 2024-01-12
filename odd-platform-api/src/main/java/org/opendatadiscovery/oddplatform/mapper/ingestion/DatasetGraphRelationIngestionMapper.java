package org.opendatadiscovery.oddplatform.mapper.ingestion;

import java.util.List;
import java.util.Map;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.GraphRelationship;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.Relationship;
import org.opendatadiscovery.oddplatform.model.tables.pojos.GraphRelationshipPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RelationshipPojo;

public interface DatasetGraphRelationIngestionMapper {
    Map<RelationshipPojo, GraphRelationshipPojo> mapGraphRelations(List<Relationship> relationships);

    GraphRelationshipPojo mapGraphRelation(GraphRelationship field);
}
