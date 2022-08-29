import { PermissionContext } from 'components/shared/contexts';
import { useContext } from 'react';

const usePermission = () => {
  const { isAllowedTo, isAdmin } = useContext(PermissionContext);
  return { isAllowedTo, isAdmin };
};

export default usePermission;
