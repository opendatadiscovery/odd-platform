package com.provectus.oddplatform.service;

import com.provectus.oddplatform.api.contract.model.Role;
import com.provectus.oddplatform.api.contract.model.RoleFormData;
import com.provectus.oddplatform.api.contract.model.RoleList;
import com.provectus.oddplatform.api.contract.model.RoleUpdateFormData;
import com.provectus.oddplatform.mapper.RoleMapper;
import com.provectus.oddplatform.model.tables.pojos.RolePojo;
import com.provectus.oddplatform.repository.RoleRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

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
    public Mono<Role> createOrGet(final RoleFormData formData) {
        return Mono
            .fromCallable(() -> entityRepository.createOrGet(entityMapper.mapForm(formData)))
            .map(entityMapper::mapPojo);
    }
}
