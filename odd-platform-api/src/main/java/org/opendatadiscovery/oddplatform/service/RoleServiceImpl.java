package org.opendatadiscovery.oddplatform.service;

import org.opendatadiscovery.oddplatform.api.contract.model.Role;
import org.opendatadiscovery.oddplatform.api.contract.model.RoleFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.RoleList;
import org.opendatadiscovery.oddplatform.api.contract.model.RoleUpdateFormData;
import org.opendatadiscovery.oddplatform.mapper.RoleMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RolePojo;
import org.opendatadiscovery.oddplatform.repository.RoleRepository;
import org.springframework.stereotype.Service;

@Service
public class RoleServiceImpl
    extends
    AbstractCRUDService<Role, RoleList, RoleFormData, RoleUpdateFormData, RolePojo, RoleMapper, RoleRepository>
    implements RoleService {

    public RoleServiceImpl(final RoleMapper entityMapper,
                           final RoleRepository entityRepository) {
        super(entityMapper, entityRepository);
    }

    @Override
    public Role createOrGet(final RoleFormData formData) {
        return entityMapper.mapPojo(entityRepository.createOrGet(entityMapper.mapForm(formData)));
    }
}
