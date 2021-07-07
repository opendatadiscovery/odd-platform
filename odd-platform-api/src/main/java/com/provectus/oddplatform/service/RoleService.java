package com.provectus.oddplatform.service;

import com.provectus.oddplatform.api.contract.model.Role;
import com.provectus.oddplatform.api.contract.model.RoleFormData;
import com.provectus.oddplatform.api.contract.model.RoleList;
import com.provectus.oddplatform.api.contract.model.RoleUpdateFormData;
import reactor.core.publisher.Mono;

public interface RoleService extends CRUDService<Role, RoleList, RoleFormData, RoleUpdateFormData> {
    Mono<Role> createOrGet(final RoleFormData formData);
}
