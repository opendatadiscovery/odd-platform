package org.opendatadiscovery.oddplatform.mapper;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnerAssociationRequest;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnerAssociationRequestList;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnerAssociationRequestStatus;
import org.opendatadiscovery.oddplatform.api.contract.model.PageInfo;
import org.opendatadiscovery.oddplatform.dto.OwnerAssociationRequestDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerAssociationRequestPojo;
import org.opendatadiscovery.oddplatform.utils.Page;

@Mapper(config = MapperConfig.class, uses = {OffsetDateTimeMapper.class, AssociatedOwnerMapper.class})
public interface OwnerAssociationRequestMapper {

    @Mapping(target = "status", expression = "java(OwnerAssociationRequestStatus.PENDING.getValue())")
    OwnerAssociationRequestPojo mapToPojo(final String username,
                                          final Long ownerId);

    @Mapping(target = ".", source = "dto.pojo")
    @Mapping(target = "statusUpdatedBy", source = "dto.statusUpdatedUser")
    OwnerAssociationRequest mapToOwnerAssociationRequest(final OwnerAssociationRequestDto dto);

    @Mapping(target = "status", expression = "java(OwnerAssociationRequestStatus.APPROVED)")
    OwnerAssociationRequest mapToApprovedRequest(final String username,
                                                 final String ownerName);

    List<OwnerAssociationRequest> mapList(final Collection<OwnerAssociationRequestDto> dtos);

    OwnerAssociationRequestPojo applyToPojo(@MappingTarget final OwnerAssociationRequestPojo pojo,
                                            final OwnerAssociationRequestStatus status,
                                            final String statusUpdatedBy,
                                            final LocalDateTime statusUpdatedAt);

    default OwnerAssociationRequestList mapPage(final Page<OwnerAssociationRequestDto> page) {
        return new OwnerAssociationRequestList()
            .items(mapList(page.getData()))
            .pageInfo(new PageInfo().total(page.getTotal()).hasNext(page.isHasNext()));
    }
}
