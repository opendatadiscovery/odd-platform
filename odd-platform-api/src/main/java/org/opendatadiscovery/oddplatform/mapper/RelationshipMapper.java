package org.opendatadiscovery.oddplatform.mapper;

import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.model.DatasetRelationship;
import org.opendatadiscovery.oddplatform.api.contract.model.DatasetRelationshipList;
import org.opendatadiscovery.oddplatform.api.contract.model.DatasetRelationshipType;
import org.opendatadiscovery.oddplatform.api.contract.model.PageInfo;
import org.opendatadiscovery.oddplatform.dto.RelationshipDto;
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
            .id(item.relationshipPojo().getId())
            .name(item.relationshipPojo().getName())
            .oddrn(item.relationshipPojo().getRelationshipOddrn())
            .sourceDatasetOddrn(item.relationshipPojo().getSourceDatasetOddrn())
            .targetDatasetOddrn(item.relationshipPojo().getTargetDatasetOddrn())
            .sourceDataEntityId(item.sourceDataEntity() != null ? item.sourceDataEntity().getId() : null)
            .targetDataEntityId(item.targetDataEntity() != null ? item.targetDataEntity().getId() : null)
            .type(item.isErd() ? DatasetRelationshipType.ERD : DatasetRelationshipType.GRAPH)
            .erdRelationship(erdRelationshipMapper.mapPojoToDetails(item.erdRelationshipDetailsPojo()))
            .graphRelationship(graphRelationshipMapper.mapPojoToDetails(item.graphRelationshipPojo()));
    }

    public DatasetRelationshipList mapListToRelationshipPage(final Page<RelationshipDto> relationshipDtoPage) {
        return new DatasetRelationshipList()
            .items(mapToRelationshipList(relationshipDtoPage.getData()))
            .pageInfo(new PageInfo().total((relationshipDtoPage.getTotal())).hasNext(relationshipDtoPage.isHasNext()));
    }
}
