package org.opendatadiscovery.oddplatform.mapper.ingestion;

import java.util.List;
import java.util.Map;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.ERDRelationship;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.Relationship;
import org.opendatadiscovery.oddplatform.model.tables.pojos.ErdRelationshipPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RelationshipPojo;

public interface DatasetERDRelationIngestionMapper {
    Map<RelationshipPojo, List<ErdRelationshipPojo>> mapERDRelations(final List<Relationship> erdRelationship,
                                                                     final Long dataSourceId);

    List<ErdRelationshipPojo> mapERDRelation(ERDRelationship field);
}
