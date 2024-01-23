package org.opendatadiscovery.oddplatform.mapper.ingestion;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.dto.RelationshipStatusDto;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.Relationship;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RelationshipsPojo;
import org.opendatadiscovery.oddplatform.service.ingestion.util.DateTimeUtil;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DatasetRelationIngestionMapperImpl implements DatasetRelationIngestionMapper {
    @Override
    public RelationshipsPojo mapToPojo(final Relationship relationship, final Long dataSourceId) {
        if (relationship == null) {
            return null;
        }

        final RelationshipsPojo relationshipPojo = new RelationshipsPojo();

        relationshipPojo.setName(relationship.getName());
        relationshipPojo.setDataSourceId(dataSourceId);
        relationshipPojo.setRelationshipOddrn(relationship.getOddrn());
        relationshipPojo.setIsManualyCreated(false);
        relationshipPojo.setSourceDatasetOddrn(relationship.getSourceDatasetOddrn());
        relationshipPojo.setTargetDatasetOddrn(relationship.getTargetDatasetOddrn());
        relationshipPojo.setLastIngestedAt(DateTimeUtil.generateNow());
        relationshipPojo.setRelationshipStatus(RelationshipStatusDto.ACTIVE.getId());

        return relationshipPojo;
    }
}