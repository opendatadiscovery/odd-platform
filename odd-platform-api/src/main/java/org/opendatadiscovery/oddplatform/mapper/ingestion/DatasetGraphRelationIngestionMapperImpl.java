package org.opendatadiscovery.oddplatform.mapper.ingestion;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.CollectionUtils;
import org.jooq.JSONB;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.GraphRelationship;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.Relationship;
import org.opendatadiscovery.oddplatform.model.tables.pojos.GraphRelationshipPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RelationshipsPojo;
import org.opendatadiscovery.oddplatform.utils.JSONSerDeUtils;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DatasetGraphRelationIngestionMapperImpl implements DatasetGraphRelationIngestionMapper {
    private final DatasetRelationIngestionMapper relationIngestionMapper;

    @Override
    public Map<RelationshipsPojo, GraphRelationshipPojo> mapGraphRelations(final List<Relationship> relationships,
                                                                          final Long dataSourceId) {
        if (CollectionUtils.isEmpty(relationships)) {
            return Map.of();
        }

        return relationships.stream()
            .filter(item -> item.getGraphRelationship() != null)
            .collect(Collectors.toMap(item -> relationIngestionMapper.mapToPojo(item, dataSourceId),
                relationship -> mapGraphRelation(relationship.getGraphRelationship()), (a, b) -> b));
    }

    @Override
    public GraphRelationshipPojo mapGraphRelation(final GraphRelationship graphRelationship) {
        return new GraphRelationshipPojo()
            .setIsDirected(graphRelationship.getIsDirected())
            .setSpecificAttributes(JSONB.valueOf(JSONSerDeUtils.serializeJson(graphRelationship.getAttributes())));
    }
}
