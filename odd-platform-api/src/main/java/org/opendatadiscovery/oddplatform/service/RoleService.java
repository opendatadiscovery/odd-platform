package org.opendatadiscovery.oddplatform.service;

import org.opendatadiscovery.oddplatform.api.contract.model.RoleList;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RolePojo;
import reactor.core.publisher.Mono;

public interface RoleService {
    Mono<RolePojo> getOrCreate(final String name);

    Mono<RoleList> list(final int page, final int size, final String query);
}
