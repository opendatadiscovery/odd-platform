import { PermissionContext } from 'components/shared/contexts';
import { useContext } from 'react';

interface UsePermissionProps {
  dataEntityId?: number;
}

interface UsePermissionReturn {
  isAllowedTo: boolean;
  isAdmin: boolean;
}

const usePermission = ({
  dataEntityId = undefined,
}: UsePermissionProps): UsePermissionReturn => {
  const { getIsAllowedTo, isAdmin } = useContext(PermissionContext);
  const isAllowedTo = getIsAllowedTo(dataEntityId);

  return { isAllowedTo, isAdmin };
};

export default usePermission;
