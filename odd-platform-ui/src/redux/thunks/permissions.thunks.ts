import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  Configuration,
  type Permission,
  PermissionApi,
  type PermissionApiGetResourcePermissionsRequest,
  type PermissionResourceType,
} from 'generated-sources';
import { BASE_PARAMS } from 'lib/constants';
import * as actions from 'redux/actions';

const apiClientConf = new Configuration(BASE_PARAMS);
const permissionApi = new PermissionApi(apiClientConf);

export const fetchResourcePermissions = createAsyncThunk<
  {
    resourceId: number;
    permissionResourceType: PermissionResourceType;
    permissions: Permission[];
  },
  PermissionApiGetResourcePermissionsRequest
>(
  actions.fetchResourcePermissionsActionType,
  async ({ resourceId, permissionResourceType }) => {
    const permissions = await permissionApi.getResourcePermissions({
      resourceId,
      permissionResourceType,
    });

    return { resourceId, permissionResourceType, permissions };
  }
);
