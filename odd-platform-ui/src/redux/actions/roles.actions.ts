import { createActionType } from 'redux/lib/helpers';

export const rolesActTypePrefix = 'roles';

export const fetchRolesActType = createActionType(rolesActTypePrefix, 'fetchRoles');
export const createRoleActType = createActionType(rolesActTypePrefix, 'createRole');
export const updateRoleActType = createActionType(rolesActTypePrefix, 'updateRole');
export const deleteRoleActType = createActionType(rolesActTypePrefix, 'deleteRole');
