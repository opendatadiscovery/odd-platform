package org.opendatadiscovery.oddplatform.mapper;

import org.mapstruct.Mapper;
import org.opendatadiscovery.oddplatform.api.contract.model.PageInfo;
import org.opendatadiscovery.oddplatform.api.contract.model.Role;
import org.opendatadiscovery.oddplatform.api.contract.model.RoleList;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RolePojo;
import org.opendatadiscovery.oddplatform.utils.Page;

@Mapper(config = MapperConfig.class)
public interface RoleMapper {

    Role mapToRole(final RolePojo pojo);

    default RoleList mapToRoleList(final Page<RolePojo> page) {
        return new RoleList()
            .pageInfo(new PageInfo().total(page.getTotal()).hasNext(page.isHasNext()))
            .items(page.getData().stream().map(this::mapToRole).toList());
    }
}
