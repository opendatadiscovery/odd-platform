package org.opendatadiscovery.oddplatform.mapper;

import java.util.List;
import java.util.stream.Collectors;
import org.mapstruct.Mapper;
import org.opendatadiscovery.oddplatform.api.contract.model.DatasetRelationship;
import org.opendatadiscovery.oddplatform.api.contract.model.DatasetRelationshipType;
import org.opendatadiscovery.oddplatform.api.contract.model.PageInfo;
import org.opendatadiscovery.oddplatform.api.contract.model.RelationshipList;
import org.opendatadiscovery.oddplatform.dto.RelationshipDto;

@Mapper(config = MapperConfig.class,
    uses = {
        DateTimeMapper.class,
        DataEntityMapper.class,
    })
public abstract class RelationshipMapper {
    public RelationshipList mapListToRelationshipList(final List<RelationshipDto> relationshipDtos) {
        return new RelationshipList()
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
            .type(item.isErd() ? DatasetRelationshipType.ERD : DatasetRelationshipType.GRAPH);
    }
}
