import React, { useMemo } from 'react';
import { Permission } from 'generated-sources';
import {
  getDataEntityPermissions,
  getGlobalPermissions,
} from 'redux/selectors';
import { useAppSelector } from 'lib/redux/hooks';
import PermissionContext, {
  PermissionContextProps,
} from './PermissionContext';

interface PermissionProviderProps {
  permissions: Permission[];
}

const PermissionProvider: React.FunctionComponent<
  PermissionProviderProps
> = ({ permissions, children }) => {
  const globalPermissions = useAppSelector(getGlobalPermissions);
  const dataEntityPermissions = useAppSelector(getDataEntityPermissions);

  const providerValue = useMemo<PermissionContextProps>(() => {
    const isAllowedTo = permissions.every(perm =>
      dataEntityPermissions.includes(perm)
    );
    const isAdmin = globalPermissions.includes(
      Permission.MANAGEMENT_CONTROL
    );

    return { isAllowedTo, isAdmin };
  }, [permissions, globalPermissions, dataEntityPermissions]);

  return (
    <PermissionContext.Provider value={providerValue}>
      {children}
    </PermissionContext.Provider>
  );
};

export default PermissionProvider;
