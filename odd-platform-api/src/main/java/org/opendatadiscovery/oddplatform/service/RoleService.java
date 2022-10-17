package org.opendatadiscovery.oddplatform.service;

import org.opendatadiscovery.oddplatform.api.contract.model.Role;
import org.opendatadiscovery.oddplatform.api.contract.model.RoleFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.RoleList;
import reactor.core.publisher.Mono;

public interface RoleService {
    Mono<RoleList> list(final int page, final int size, final String query);

    Mono<Role> create(final RoleFormData formData);

    Mono<Role> update(final long id, final RoleFormData formData);

    Mono<Void> delete(final long id);
}
