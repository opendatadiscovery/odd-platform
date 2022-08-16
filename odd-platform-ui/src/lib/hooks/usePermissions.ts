import { PermissionContext } from 'components/shared/contexts';
import { useContext } from 'react';

const usePermission = () => {
  const { isAllowedTo } = useContext(PermissionContext);
  return isAllowedTo;
};

export default usePermission;
