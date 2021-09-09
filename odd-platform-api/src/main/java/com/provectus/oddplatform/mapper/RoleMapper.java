package com.provectus.oddplatform.mapper;

import com.provectus.oddplatform.api.contract.model.Role;
import com.provectus.oddplatform.api.contract.model.RoleFormData;
import com.provectus.oddplatform.api.contract.model.RoleList;
import com.provectus.oddplatform.api.contract.model.RoleUpdateFormData;
import com.provectus.oddplatform.model.tables.pojos.RolePojo;

public interface RoleMapper extends CRUDMapper<Role, RoleList, RoleFormData, RoleUpdateFormData, RolePojo> {
}
