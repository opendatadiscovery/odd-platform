package org.opendatadiscovery.oddplatform.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.opendatadiscovery.oddplatform.api.contract.model.PageInfo;
import org.opendatadiscovery.oddplatform.api.contract.model.Role;
import org.opendatadiscovery.oddplatform.api.contract.model.RoleFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.RoleList;
import org.opendatadiscovery.oddplatform.dto.RoleDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RolePojo;
import org.opendatadiscovery.oddplatform.utils.Page;

@Mapper(config = MapperConfig.class)
public interface RoleMapper {
    RolePojo mapToPojo(final RoleFormData formData);

    RolePojo applyToPojo(final RoleFormData formData, @MappingTarget final RolePojo pojo);

    @Mapping(source = "roleDto.pojo", target = ".")
    Role mapFromDto(final RoleDto roleDto);

    default RoleList mapToRoleList(final Page<RoleDto> page) {
        return new RoleList()
            .pageInfo(new PageInfo().total(page.getTotal()).hasNext(page.isHasNext()))
            .items(page.getData().stream().map(this::mapFromDto).toList());
    }
}
