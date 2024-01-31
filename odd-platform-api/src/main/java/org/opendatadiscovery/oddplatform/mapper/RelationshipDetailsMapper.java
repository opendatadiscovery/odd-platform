package org.opendatadiscovery.oddplatform.mapper;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityERDRelationshipDetails;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityGraphRelationshipDetails;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRelationshipType;
import org.opendatadiscovery.oddplatform.dto.RelationshipDetailsDto;
import org.opendatadiscovery.oddplatform.dto.RelationshipTypeDto;
import org.springframework.stereotype.Component;

@RequiredArgsConstructor
@Component
public class RelationshipDetailsMapper {
    private final ErdRelationshipMapper erdRelationshipMapper;
    private final GraphRelationshipMapper graphRelationshipMapper;

    public DataEntityERDRelationshipDetails mapToDataEntityERDRelationshipDetails(
        final RelationshipDetailsDto relationshipDetailsDto) {
        return new DataEntityERDRelationshipDetails()
            .id(relationshipDetailsDto.dataEntityRelationship().getId())
            .name(relationshipDetailsDto.dataEntityRelationship().getExternalName())
            .oddrn(relationshipDetailsDto.dataEntityRelationship().getOddrn())
            .sourceDatasetOddrn(relationshipDetailsDto.relationshipPojo().getSourceDatasetOddrn())
            .targetDatasetOddrn(relationshipDetailsDto.relationshipPojo().getTargetDatasetOddrn())
            .sourceDataEntityId(
                relationshipDetailsDto.sourceDataEntity() != null ? relationshipDetailsDto.sourceDataEntity().getId() :
                    null)
            .targetDataEntityId(
                relationshipDetailsDto.targetDataEntity() != null ? relationshipDetailsDto.targetDataEntity().getId() :
                    null)
            .type(RelationshipTypeDto.ERD.name().equals(relationshipDetailsDto.relationshipPojo().getRelationshipType())
                ? DataEntityRelationshipType.ERD
                : DataEntityRelationshipType.GRAPH)
            .erdRelationship(
                erdRelationshipMapper.mapPojoToDetails(relationshipDetailsDto.erdRelationshipDetailsPojo()));
    }

    public DataEntityGraphRelationshipDetails mapToDataEntityGraphRelationshipDetails(
        final RelationshipDetailsDto relationshipDetailsDto) {
        return new DataEntityGraphRelationshipDetails()
            .id(relationshipDetailsDto.dataEntityRelationship().getId())
            .name(relationshipDetailsDto.dataEntityRelationship().getExternalName())
            .oddrn(relationshipDetailsDto.dataEntityRelationship().getOddrn())
            .sourceDatasetOddrn(relationshipDetailsDto.relationshipPojo().getSourceDatasetOddrn())
            .targetDatasetOddrn(relationshipDetailsDto.relationshipPojo().getTargetDatasetOddrn())
            .sourceDataEntityId(
                relationshipDetailsDto.sourceDataEntity() != null ? relationshipDetailsDto.sourceDataEntity().getId() :
                    null)
            .targetDataEntityId(
                relationshipDetailsDto.targetDataEntity() != null ? relationshipDetailsDto.targetDataEntity().getId() :
                    null)
            .type(RelationshipTypeDto.ERD.name().equals(relationshipDetailsDto.relationshipPojo().getRelationshipType())
                ? DataEntityRelationshipType.ERD
                : DataEntityRelationshipType.GRAPH)
            .graphRelationship(
                graphRelationshipMapper.mapPojoToDetails(relationshipDetailsDto.graphRelationshipPojo()));
    }
}
