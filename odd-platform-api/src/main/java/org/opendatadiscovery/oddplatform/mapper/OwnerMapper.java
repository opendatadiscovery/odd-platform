package org.opendatadiscovery.oddplatform.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.opendatadiscovery.oddplatform.api.contract.model.Owner;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnerFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnerList;
import org.opendatadiscovery.oddplatform.api.contract.model.PageInfo;
import org.opendatadiscovery.oddplatform.dto.OwnerDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.utils.Page;

@Mapper(config = MapperConfig.class)
public interface OwnerMapper {
    OwnerPojo mapToPojo(final OwnerFormData formData);

    OwnerPojo applyToPojo(final OwnerFormData formData, @MappingTarget final OwnerPojo pojo);

    Owner mapFromPojo(final OwnerPojo pojo);

    @Mapping(source = "ownerDto.ownerPojo", target = ".")
    Owner mapFromDto(final OwnerDto ownerDto);

    default OwnerList mapToOwnerList(final Page<OwnerDto> page) {
        return new OwnerList()
            .pageInfo(new PageInfo().total(page.getTotal()).hasNext(page.isHasNext()))
            .items(page.getData().stream().map(this::mapFromDto).toList());
    }
}
