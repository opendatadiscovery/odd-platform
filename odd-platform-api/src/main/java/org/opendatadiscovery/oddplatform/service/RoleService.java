package org.opendatadiscovery.oddplatform.service;

import org.opendatadiscovery.oddplatform.api.contract.model.Role;
import org.opendatadiscovery.oddplatform.api.contract.model.RoleFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.RoleList;
import org.opendatadiscovery.oddplatform.api.contract.model.RoleUpdateFormData;

public interface RoleService extends CRUDService<Role, RoleList, RoleFormData, RoleUpdateFormData> {
    Role createOrGet(final RoleFormData formData);
}
