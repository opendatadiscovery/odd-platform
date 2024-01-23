package org.opendatadiscovery.oddplatform.mapper.ingestion;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.CollectionUtils;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.ERDRelationship;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.Relationship;
import org.opendatadiscovery.oddplatform.model.tables.pojos.ErdRelationshipDetailsPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RelationshipsPojo;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DatasetERDRelationIngestionMapperImpl implements DatasetERDRelationIngestionMapper {
    private final DatasetRelationIngestionMapper relationIngestionMapper;

    @Override
    public Map<RelationshipsPojo, ErdRelationshipDetailsPojo>
        mapERDRelations(final List<Relationship> relationships,
                        final Long dataSourceId) {
        if (CollectionUtils.isEmpty(relationships)) {
            return Map.of();
        }

        return relationships.stream()
            .filter(item -> item.getErdRelationship() != null)
            .collect(Collectors.toMap(item -> relationIngestionMapper.mapToPojo(item, dataSourceId),
                relationship -> mapERDRelation(relationship.getErdRelationship()), (a, b) -> b));
    }

    @Override
    public ErdRelationshipDetailsPojo mapERDRelation(final ERDRelationship erd) {
        return new ErdRelationshipDetailsPojo()
            .setSourceDatasetFieldOddrn(erd.getSourceDatasetFieldOddrnsList().toArray(String[]::new))
            .setTargetDatasetFieldOddrn(erd.getTargetDatasetFieldOddrnsList().toArray(String[]::new))
            .setCardinality(erd.getCardinality().getValue())
            .setIsIdentifying(erd.getIsIdentifying());
    }
}
