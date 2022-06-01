package org.opendatadiscovery.oddplatform.service;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.model.RoleList;
import org.opendatadiscovery.oddplatform.mapper.RoleMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RolePojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveRoleRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class RoleServiceImpl implements RoleService {

    private final ReactiveRoleRepository roleRepository;
    private final RoleMapper roleMapper;

    @Override
    public Mono<RolePojo> getOrCreate(final String name) {
        return roleRepository.getByName(name)
            .switchIfEmpty(roleRepository.create(new RolePojo().setName(name)));
    }

    @Override
    public Mono<RoleList> list(final int page, final int size, final String query) {
        return roleRepository.list(page, size, query).map(roleMapper::mapToRoleList);
    }
}
