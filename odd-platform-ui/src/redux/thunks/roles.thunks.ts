import {
  Configuration,
  Role,
  RoleApi,
  RoleApiCreateRoleRequest,
  RoleApiDeleteRoleRequest,
  RoleApiGetRolesListRequest,
  RoleApiUpdateRoleRequest,
} from 'generated-sources';
import { CurrentPageInfo } from 'redux/interfaces/common';
import { createAsyncThunk } from '@reduxjs/toolkit';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';

const apiClientConf = new Configuration(BASE_PARAMS);
const roleApi = new RoleApi(apiClientConf);

export const fetchRolesList = createAsyncThunk<
  { items: Array<Role>; pageInfo: CurrentPageInfo },
  RoleApiGetRolesListRequest
>(actions.fetchRolesActType, async ({ page, size, query }) => {
  const { items, pageInfo } = await roleApi.getRolesList({ page, size, query });

  return { items, pageInfo: { ...pageInfo, page } };
});

export const createRole = createAsyncThunk<Role, RoleApiCreateRoleRequest>(
  actions.createRoleActType,
  async params => roleApi.createRole(params)
);

export const updateRole = createAsyncThunk<Role, RoleApiUpdateRoleRequest>(
  actions.updateRoleActType,
  async ({ roleId, roleFormData }) => roleApi.updateRole({ roleId, roleFormData })
);

export const deleteRole = createAsyncThunk<number, RoleApiDeleteRoleRequest>(
  actions.deleteRoleActType,
  async ({ roleId }) => {
    await roleApi.deleteRole({ roleId });

    return roleId;
  }
);
