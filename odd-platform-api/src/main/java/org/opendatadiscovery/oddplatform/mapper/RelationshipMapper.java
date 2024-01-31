package org.opendatadiscovery.oddplatform.mapper;

import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRelationship;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRelationshipList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRelationshipType;
import org.opendatadiscovery.oddplatform.api.contract.model.PageInfo;
import org.opendatadiscovery.oddplatform.dto.RelationshipDto;
import org.opendatadiscovery.oddplatform.dto.RelationshipTypeDto;
import org.opendatadiscovery.oddplatform.utils.Page;
import org.springframework.stereotype.Component;

@RequiredArgsConstructor
@Component
public class RelationshipMapper {
    public DataEntityRelationshipList mapListToRelationshipList(final List<RelationshipDto> relationshipDtos) {
        return new DataEntityRelationshipList()
            .items(mapToRelationshipList(relationshipDtos))
            .pageInfo(new PageInfo().total((long) relationshipDtos.size()).hasNext(false));
    }

    private List<DataEntityRelationship> mapToRelationshipList(final List<RelationshipDto> relationshipDtos) {
        return relationshipDtos.stream()
            .map(this::mapToDatasetRelationship)
            .collect(Collectors.toList());
    }

    public DataEntityRelationship mapToDatasetRelationship(final RelationshipDto item) {
        return new DataEntityRelationship()
            .id(item.dataEntityRelationship().getId())
            .name(item.dataEntityRelationship().getExternalName())
            .oddrn(item.dataEntityRelationship().getOddrn())
            .sourceDatasetOddrn(item.relationshipPojo().getSourceDatasetOddrn())
            .targetDatasetOddrn(item.relationshipPojo().getTargetDatasetOddrn())
            .sourceDataEntityId(item.sourceDataEntity() != null ? item.sourceDataEntity().getId() : null)
            .targetDataEntityId(item.targetDataEntity() != null ? item.targetDataEntity().getId() : null)
            .type(RelationshipTypeDto.ERD.name().equals(item.relationshipPojo().getRelationshipType())
                ? DataEntityRelationshipType.ERD
                : DataEntityRelationshipType.GRAPH);
    }

    public DataEntityRelationshipList mapListToRelationshipPage(final Page<RelationshipDto> relationshipDtoPage) {
        return new DataEntityRelationshipList()
            .items(mapToRelationshipList(relationshipDtoPage.getData()))
            .pageInfo(new PageInfo().total((relationshipDtoPage.getTotal())).hasNext(relationshipDtoPage.isHasNext()));
    }
}
