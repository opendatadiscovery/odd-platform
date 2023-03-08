import type {
  Permission,
  PermissionApiGetResourcePermissionsRequest,
  PermissionResourceType,
} from 'generated-sources';
import * as actions from 'redux/actions';
import { handleResponseAsyncThunk } from 'redux/lib/handleResponseThunk';
import { permissionApi } from 'lib/api';

export const fetchResourcePermissions = handleResponseAsyncThunk<
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
  },
  {}
);
