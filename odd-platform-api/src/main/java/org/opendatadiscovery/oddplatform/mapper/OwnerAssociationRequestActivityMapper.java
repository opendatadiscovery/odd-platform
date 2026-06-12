package org.opendatadiscovery.oddplatform.mapper;

import java.util.Collection;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnerAssociationRequestActivity;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnerAssociationRequestActivityList;
import org.opendatadiscovery.oddplatform.api.contract.model.PageInfo;
import org.opendatadiscovery.oddplatform.dto.OwnerAssociationRequestActivityDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerAssociationRequestActivityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerAssociationRequestPojo;
import org.opendatadiscovery.oddplatform.utils.Page;

@Mapper(config = MapperConfig.class, uses = {DateTimeMapper.class, AssociatedOwnerMapper.class})
public interface OwnerAssociationRequestActivityMapper {

    @Mapping(target = "activityId", source = "dto.activityPojo.id")
    @Mapping(target = ".", source = "dto.associationRequestDto.pojo")
    @Mapping(target = "statusUpdatedBy", source = "dto.associationRequestDto.statusUpdatedUser")
    @Mapping(target = "status", source = "dto.activityPojo.status")
    @Mapping(target = "roles", source = "dto.associationRequestDto.roles")
    @Mapping(target = "ownerName", source = "dto.associationRequestDto.ownerName")
    @Mapping(target = "eventType", source = "dto.activityPojo.eventType")
    @Mapping(target = "statusUpdatedAt", source = "dto.activityPojo.createdAt")
    OwnerAssociationRequestActivity mapToOwnerAssociationRequestActivity(final OwnerAssociationRequestActivityDto dto);

    List<OwnerAssociationRequestActivity> mapList(final Collection<OwnerAssociationRequestActivityDto> dtos);

    default OwnerAssociationRequestActivityList mapPage(final Page<OwnerAssociationRequestActivityDto> page) {
        final List<OwnerAssociationRequestActivity> items = mapList(page.getData());
        final PageInfo pageInfo = new PageInfo(page.getTotal(), page.isHasNext());
        return new OwnerAssociationRequestActivityList(items, pageInfo);
    }

    @Mapping(target = "ownerAssociationRequestId", source = "pojo.id")
    @Mapping(target = "status", source = "pojo.status")
    @Mapping(target = "statusUpdatedBy", source = "statusUpdatedBy")
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    OwnerAssociationRequestActivityPojo mapToPojo(final OwnerAssociationRequestPojo pojo,
                                                  final String statusUpdatedBy,
                                                  final String eventType);
}
