package org.opendatadiscovery.oddplatform.mapper.ingestion;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.CollectionUtils;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.ERDRelationship;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.Relationship;
import org.opendatadiscovery.oddplatform.model.tables.pojos.ErdRelationshipPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RelationshipPojo;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DatasetERDRelationIngestionMapperImpl implements DatasetERDRelationIngestionMapper {
    private final DatasetRelationIngestionMapper relationIngestionMapper;

    @Override
    public Map<RelationshipPojo, List<ErdRelationshipPojo>> mapERDRelations(final List<Relationship> relationships,
                                                                            final Long dataSourceId) {
        if (CollectionUtils.isEmpty(relationships)) {
            return Map.of();
        }

        return relationships.stream()
            .filter(item -> item.getErdRelationship() != null)
            .collect(Collectors.toMap(item -> relationIngestionMapper.mapToPojo(item, dataSourceId),
                relationship -> new ArrayList<>(mapERDRelation(relationship.getErdRelationship())), (a, b) -> b));
    }

    @Override
    public List<ErdRelationshipPojo> mapERDRelation(final ERDRelationship erd) {
        final List<ErdRelationshipPojo> erdRelationshipPojos = new ArrayList<>();

        for (int i = 0; i < erd.getSourceDatasetFieldOddrnsList().size(); i++) {
            erdRelationshipPojos.add(new ErdRelationshipPojo()
                .setSourceDatasetFieldOddrn(erd.getSourceDatasetFieldOddrnsList().get(i))
                .setTargetDatasetFieldOddrn(erd.getTargetDatasetFieldOddrnsList().get(i))
                .setCardinality(erd.getCardinality().getValue())
                .setIsIdentifying(erd.getIsIdentifying()));
        }

        return erdRelationshipPojos;
    }
}
