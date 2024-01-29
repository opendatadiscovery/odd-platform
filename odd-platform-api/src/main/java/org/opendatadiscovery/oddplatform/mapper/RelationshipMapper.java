package org.opendatadiscovery.oddplatform.mapper;

import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.model.DatasetERDRelationshipDetails;
import org.opendatadiscovery.oddplatform.api.contract.model.DatasetGraphRelationshipDetails;
import org.opendatadiscovery.oddplatform.api.contract.model.DatasetRelationship;
import org.opendatadiscovery.oddplatform.api.contract.model.DatasetRelationshipList;
import org.opendatadiscovery.oddplatform.api.contract.model.DatasetRelationshipType;
import org.opendatadiscovery.oddplatform.api.contract.model.PageInfo;
import org.opendatadiscovery.oddplatform.dto.RelationshipDetailsDto;
import org.opendatadiscovery.oddplatform.dto.RelationshipDto;
import org.opendatadiscovery.oddplatform.dto.RelationshipTypeDto;
import org.opendatadiscovery.oddplatform.utils.Page;
import org.springframework.stereotype.Component;

@RequiredArgsConstructor
@Component
public class RelationshipMapper {
    private final ErdRelationshipMapper erdRelationshipMapper;
    private final GraphRelationshipMapper graphRelationshipMapper;

    public DatasetRelationshipList mapListToRelationshipList(final List<RelationshipDto> relationshipDtos) {
        return new DatasetRelationshipList()
            .items(mapToRelationshipList(relationshipDtos))
            .pageInfo(new PageInfo().total((long) relationshipDtos.size()).hasNext(false));
    }

    private List<DatasetRelationship> mapToRelationshipList(final List<RelationshipDto> relationshipDtos) {
        return relationshipDtos.stream()
            .map(this::mapToDatasetRelationship)
            .collect(Collectors.toList());
    }

    public DatasetRelationship mapToDatasetRelationship(final RelationshipDto item) {
        return new DatasetRelationship()
            .id(item.dataEntityRelationship().getId())
            .name(item.dataEntityRelationship().getExternalName())
            .oddrn(item.dataEntityRelationship().getOddrn())
            .sourceDatasetOddrn(item.relationshipPojo().getSourceDatasetOddrn())
            .targetDatasetOddrn(item.relationshipPojo().getTargetDatasetOddrn())
            .sourceDataEntityId(item.sourceDataEntity() != null ? item.sourceDataEntity().getId() : null)
            .targetDataEntityId(item.targetDataEntity() != null ? item.targetDataEntity().getId() : null)
            .type(RelationshipTypeDto.ERD.name().equals(item.relationshipPojo().getRelationshipType())
                ? DatasetRelationshipType.ERD
                : DatasetRelationshipType.GRAPH);
    }

    public DatasetRelationshipList mapListToRelationshipPage(final Page<RelationshipDto> relationshipDtoPage) {
        return new DatasetRelationshipList()
            .items(mapToRelationshipList(relationshipDtoPage.getData()))
            .pageInfo(new PageInfo().total((relationshipDtoPage.getTotal())).hasNext(relationshipDtoPage.isHasNext()));
    }

    public DatasetERDRelationshipDetails mapToDatasetERDRelationshipDetails(
        final RelationshipDetailsDto relationshipDetailsDto) {
        return new DatasetERDRelationshipDetails()
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
                ? DatasetRelationshipType.ERD
                : DatasetRelationshipType.GRAPH)
            .erdRelationship(
                erdRelationshipMapper.mapPojoToDetails(relationshipDetailsDto.erdRelationshipDetailsPojo()));
    }

    public DatasetGraphRelationshipDetails mapToDatasetGraphRelationshipDetails(
        final RelationshipDetailsDto relationshipDetailsDto) {
        return new DatasetGraphRelationshipDetails()
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
                ? DatasetRelationshipType.ERD
                : DatasetRelationshipType.GRAPH)
            .graphRelationship(
                graphRelationshipMapper.mapPojoToDetails(relationshipDetailsDto.graphRelationshipPojo()));
    }
}
