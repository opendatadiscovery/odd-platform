import PermissionContext from 'components/shared/contexts/Permission/PermissionContext';
import { useContext } from 'react';
import type { Permission } from 'generated-sources';

interface UsePermissionReturn {
  isAllowedTo: boolean;
  hasAccessTo: (to: Permission) => boolean;
}

const usePermissions = (): UsePermissionReturn => {
  const { isAllowedTo, getHasAccessTo } = useContext(PermissionContext);
  const hasAccessTo = getHasAccessTo;

  return { isAllowedTo, hasAccessTo };
};

export default usePermissions;
