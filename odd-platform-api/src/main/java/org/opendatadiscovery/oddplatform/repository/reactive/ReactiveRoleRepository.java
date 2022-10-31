package org.opendatadiscovery.oddplatform.repository.reactive;

import org.opendatadiscovery.oddplatform.dto.RoleDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RolePojo;
import org.opendatadiscovery.oddplatform.utils.Page;
import reactor.core.publisher.Mono;

public interface ReactiveRoleRepository extends ReactiveCRUDRepository<RolePojo> {
    Mono<RoleDto> getDto(final long id);

    Mono<Page<RoleDto>> listDto(final int page, final int size, final String nameQuery);

    Mono<RoleDto> getByName(final String name);
}