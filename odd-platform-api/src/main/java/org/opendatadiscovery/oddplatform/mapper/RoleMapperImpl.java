package org.opendatadiscovery.oddplatform.mapper;

import java.util.List;
import org.opendatadiscovery.oddplatform.api.contract.model.Role;
import org.opendatadiscovery.oddplatform.api.contract.model.RoleFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.RoleList;
import org.opendatadiscovery.oddplatform.api.contract.model.RoleUpdateFormData;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RolePojo;
import org.opendatadiscovery.oddplatform.utils.Page;
import org.springframework.stereotype.Component;

@Component
public class RoleMapperImpl implements RoleMapper {
    @Override
    public RolePojo mapForm(final RoleFormData form) {
        return new RolePojo().setName(form.getName());
    }

    @Override
    public RolePojo applyForm(final RolePojo pojo, final RoleUpdateFormData form) {
        return pojo.setName(form.getName());
    }

    @Override
    public Role mapPojo(final RolePojo pojo) {
        return new Role()
            .id(pojo.getId())
            .name(pojo.getName());
    }

    @Override
    public RoleList mapPojos(final List<RolePojo> pojos) {
        return new RoleList()
            .items(mapPojoList(pojos))
            .pageInfo(pageInfo(pojos.size()));
    }

    @Override
    public RoleList mapPojos(final Page<RolePojo> pojos) {
        return new RoleList()
            .items(mapPojoList(pojos.getData()))
            .pageInfo(pageInfo(pojos));
    }
}
