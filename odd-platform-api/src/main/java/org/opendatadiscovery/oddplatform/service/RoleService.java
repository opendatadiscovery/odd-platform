package org.opendatadiscovery.oddplatform.service;

import org.opendatadiscovery.oddplatform.api.contract.model.Role;
import org.opendatadiscovery.oddplatform.api.contract.model.RoleFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.RoleList;
import org.opendatadiscovery.oddplatform.api.contract.model.RoleUpdateFormData;
import reactor.core.publisher.Mono;

public interface RoleService extends CRUDService<Role, RoleList, RoleFormData, RoleUpdateFormData> {
    Mono<Role> createOrGet(final RoleFormData formData);
    Role createOrGetModel(final RoleFormData formData);
}
