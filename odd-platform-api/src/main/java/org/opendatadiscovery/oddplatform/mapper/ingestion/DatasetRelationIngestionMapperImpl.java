package org.opendatadiscovery.oddplatform.mapper.ingestion;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.dto.ingestion.DataEntityIngestionDto.DataRelationshipDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RelationshipsPojo;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DatasetRelationIngestionMapperImpl implements DatasetRelationIngestionMapper {
    @Override
    public RelationshipsPojo mapToPojo(final DataRelationshipDto relationship, final RelationshipsPojo oldPojo) {
        if (relationship == null) {
            return null;
        }

        final RelationshipsPojo relationshipPojo = mapToPojo(relationship);

        relationshipPojo.setId(oldPojo.getId());
        relationshipPojo.setDataEntityId(oldPojo.getDataEntityId());

        return relationshipPojo;
    }

    @Override
    public RelationshipsPojo mapToPojo(final DataRelationshipDto relationship) {
        final RelationshipsPojo relationshipPojo = new RelationshipsPojo();

        relationshipPojo.setSourceDatasetOddrn(relationship.sourceOddrn());
        relationshipPojo.setTargetDatasetOddrn(relationship.targetOddrn());
        relationshipPojo.setRelationshipType(relationship.relationshipType().name());

        return relationshipPojo;
    }
}
