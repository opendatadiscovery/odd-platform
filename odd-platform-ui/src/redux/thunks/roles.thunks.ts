import {
  Configuration,
  type Role,
  RoleApi,
  type RoleApiCreateRoleRequest,
  type RoleApiDeleteRoleRequest,
  type RoleApiGetRolesListRequest,
  type RoleApiUpdateRoleRequest,
} from 'generated-sources';
import type { CurrentPageInfo } from 'redux/interfaces';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';
import { handleResponseAsyncThunk } from 'redux/lib/handleResponseThunk';

const apiClientConf = new Configuration(BASE_PARAMS);
const roleApi = new RoleApi(apiClientConf);

export const fetchRolesList = handleResponseAsyncThunk<
  { items: Array<Role>; pageInfo: CurrentPageInfo },
  RoleApiGetRolesListRequest
>(
  actions.fetchRolesActType,
  async ({ page, size, query }) => {
    const { items, pageInfo } = await roleApi.getRolesList({ page, size, query });

    return { items, pageInfo: { ...pageInfo, page } };
  },
  {}
);

export const createRole = handleResponseAsyncThunk<Role, RoleApiCreateRoleRequest>(
  actions.createRoleActType,
  async ({ roleFormData }) => await roleApi.createRole({ roleFormData }),
  {
    setSuccessOptions: ({ roleFormData }) => ({
      id: `role-creating-${roleFormData.name}`,
      message: `Role ${roleFormData.name} successfully created.`,
    }),
  }
);

export const updateRole = handleResponseAsyncThunk<Role, RoleApiUpdateRoleRequest>(
  actions.updateRoleActType,
  async ({ roleId, roleFormData }) => await roleApi.updateRole({ roleId, roleFormData }),
  {
    setSuccessOptions: ({ roleFormData }) => ({
      id: `role-updating-${roleFormData.name}`,
      message: `Role ${roleFormData.name} successfully updated.`,
    }),
  }
);

export const deleteRole = handleResponseAsyncThunk<number, RoleApiDeleteRoleRequest>(
  actions.deleteRoleActType,
  async ({ roleId }) => {
    await roleApi.deleteRole({ roleId });
    return roleId;
  },
  {
    setSuccessOptions: ({ roleId }) => ({
      id: `role-deleting-${roleId}`,
      message: `Role successfully deleted.`,
    }),
  }
);
