import { PermissionContext } from 'components/shared/contexts';
import { useContext } from 'react';
import { Permission, PermissionResourceType } from 'generated-sources';

interface UsePermissionProps {
  resourceType?: PermissionResourceType;
  resourceId?: number;
}

interface UsePermissionReturn {
  isAllowedTo: boolean;
  hasAccessTo: (to: Permission) => boolean;
}

const usePermission = ({
  resourceId = undefined,
  resourceType = PermissionResourceType.DATA_ENTITY,
}: UsePermissionProps): UsePermissionReturn => {
  const { getIsAllowedTo, getHasAccessTo } = useContext(PermissionContext);
  const isAllowedTo = getIsAllowedTo(resourceType, resourceId);
  const hasAccessTo = getHasAccessTo(resourceType, resourceId);

  return { isAllowedTo, hasAccessTo };
};

export default usePermission;
