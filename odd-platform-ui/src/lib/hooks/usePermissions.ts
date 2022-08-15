import PermissionContext from 'components/shared/contexts/Permission/PermissionContext';
import { useContext } from 'react';

const usePermission = () => {
  const { isAllowedTo } = useContext(PermissionContext);
  return isAllowedTo;
};

export default usePermission;
