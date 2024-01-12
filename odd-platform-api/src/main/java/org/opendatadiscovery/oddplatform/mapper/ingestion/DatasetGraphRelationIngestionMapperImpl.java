package org.opendatadiscovery.oddplatform.mapper.ingestion;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.jooq.JSONB;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.GraphRelationship;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.Relationship;
import org.opendatadiscovery.oddplatform.model.tables.pojos.GraphRelationshipPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RelationshipPojo;
import org.opendatadiscovery.oddplatform.utils.JSONSerDeUtils;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DatasetGraphRelationIngestionMapperImpl implements DatasetGraphRelationIngestionMapper {
    private final DatasetRelationIngestionMapper relationIngestionMapper;

    @Override
    public Map<RelationshipPojo, GraphRelationshipPojo> mapGraphRelations(
        final List<Relationship> relationships) {
        return relationships.stream()
            .filter(item -> item.getGraphRelationship() != null)
            .collect(Collectors.toMap(relationIngestionMapper::mapToPojo,
                relationship -> mapGraphRelation(relationship.getGraphRelationship()), (a, b) -> b));
    }

    @Override
    public GraphRelationshipPojo mapGraphRelation(final GraphRelationship graphRelationship) {
        return new GraphRelationshipPojo()
            .setIsDerected(graphRelationship.getIsDirected())
            .setSpecificAttributes(JSONB.valueOf(JSONSerDeUtils.serializeJson(graphRelationship.getAttributes())));
    }
}
