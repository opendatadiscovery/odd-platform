package org.opendatadiscovery.oddplatform.mapper;

import org.opendatadiscovery.oddplatform.api.contract.model.Role;
import org.opendatadiscovery.oddplatform.api.contract.model.RoleFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.RoleList;
import org.opendatadiscovery.oddplatform.api.contract.model.RoleUpdateFormData;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RolePojo;

public interface RoleMapper extends CRUDMapper<Role, RoleList, RoleFormData, RoleUpdateFormData, RolePojo> {
}
