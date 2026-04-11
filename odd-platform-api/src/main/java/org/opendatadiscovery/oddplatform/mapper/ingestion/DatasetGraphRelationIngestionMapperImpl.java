package org.opendatadiscovery.oddplatform.mapper.ingestion;

import lombok.RequiredArgsConstructor;
import org.jooq.JSONB;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.GraphRelationship;
import org.opendatadiscovery.oddplatform.model.tables.pojos.GraphRelationshipPojo;
import org.opendatadiscovery.oddplatform.utils.JSONSerDeUtils;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DatasetGraphRelationIngestionMapperImpl implements DatasetGraphRelationIngestionMapper {

    @Override
    public GraphRelationshipPojo mapGraphRelation(final GraphRelationship graphRelationship) {
        return new GraphRelationshipPojo()
            .setIsDirected(graphRelationship.getIsDirected())
            .setSpecificAttributes(JSONB.valueOf(JSONSerDeUtils.serializeJson(graphRelationship.getAttributes())));
    }
}
