import React, { useMemo } from 'react';
import { Permission } from 'generated-sources';
import { getDataEntityPermissions, getGlobalPermissions } from 'redux/selectors';
import { emptyArr } from 'lib/constants';
import { useAppSelector } from 'redux/lib/hooks';
import PermissionContext, { PermissionContextProps } from './PermissionContext';

interface PermissionProviderProps {
  permissions: Permission[];
}

const PermissionProvider: React.FunctionComponent<PermissionProviderProps> = ({
  permissions,
  children,
}) => {
  const globalPermissions = useAppSelector(getGlobalPermissions);
  const dataEntityPermissions = (dataEntityId?: number): Permission[] =>
    useAppSelector(getDataEntityPermissions(dataEntityId)) || emptyArr;

  const providerValue = useMemo<PermissionContextProps>(() => {
    const getIsAllowedTo = (dataEntityId?: number) =>
      permissions.every(perm =>
        [...globalPermissions, ...dataEntityPermissions(dataEntityId)].includes(perm)
      );
    const isAdmin = globalPermissions.includes(Permission.MANAGEMENT_CONTROL);

    return { getIsAllowedTo, isAdmin };
  }, [permissions, globalPermissions, dataEntityPermissions]);

  return (
    <PermissionContext.Provider value={providerValue}>
      {children}
    </PermissionContext.Provider>
  );
};

export default PermissionProvider;
