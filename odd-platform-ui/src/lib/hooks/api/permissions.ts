import { useQuery } from '@tanstack/react-query';
import type { PermissionApiGetResourcePermissionsRequest } from 'generated-sources/apis/PermissionApi';
import { permissionApi } from 'lib/api';

export function useResourcePermissions(
  params: PermissionApiGetResourcePermissionsRequest
) {
  return useQuery({
    queryKey: ['resourcePermissions', params],
    queryFn: async () => permissionApi.getResourcePermissions(params),
  });
}
