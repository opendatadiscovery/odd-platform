import React, { useMemo } from 'react';
import { Permission } from 'generated-sources';
import { getGlobalPermissions } from 'redux/selectors';
import { useAppSelector } from 'lib/redux/hooks';
import PermissionContext, {
  PermissionContextProps,
} from './PermissionContext';

interface PermissionProviderProps {
  permissions: Permission[];
  dataEntityId?: number;
}

const PermissionProvider: React.FunctionComponent<
  PermissionProviderProps
> = ({ permissions, dataEntityId, children }) => {
  const globalPermissions = useAppSelector(getGlobalPermissions);
  const dataEntityPermissions = [];

  const providerValue = useMemo<PermissionContextProps>(() => {
    const isAllowedTo = permissions.every(perm =>
      globalPermissions.includes(perm)
    );
    const isAdmin = globalPermissions.includes(
      Permission.MANAGEMENT_CONTROL
    );

    return { isAllowedTo, isAdmin };
  }, [permissions, globalPermissions]);

  return (
    <PermissionContext.Provider value={providerValue}>
      {children}
    </PermissionContext.Provider>
  );
};

export default PermissionProvider;
