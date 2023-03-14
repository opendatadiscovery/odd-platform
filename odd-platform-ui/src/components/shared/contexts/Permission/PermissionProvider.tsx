import React from 'react';
import type { Permission } from 'generated-sources';
import { getGlobalPermissions } from 'redux/selectors';
import { useAppSelector } from 'redux/lib/hooks';
import PermissionContext, { type PermissionContextProps } from './PermissionContext';

interface PermissionProviderProps extends React.PropsWithChildren {
  allowedPermissions: Permission[];
  resourcePermissions: Permission[];
}

const PermissionProvider: React.FunctionComponent<PermissionProviderProps> = ({
  allowedPermissions,
  resourcePermissions,
  children,
}) => {
  const globalPermissions = useAppSelector(getGlobalPermissions);

  const isAllowedTo = React.useMemo(
    () =>
      allowedPermissions.every(perm =>
        [...globalPermissions, ...resourcePermissions].includes(perm)
      ),
    [allowedPermissions, resourcePermissions, globalPermissions]
  );

  const getHasAccessTo = React.useCallback(
    (to: Permission) =>
      [...globalPermissions, ...resourcePermissions].includes(to) &&
      allowedPermissions.includes(to),
    [allowedPermissions, resourcePermissions, globalPermissions]
  );

  const providerValue = React.useMemo<PermissionContextProps>(
    () => ({ isAllowedTo, getHasAccessTo }),
    [isAllowedTo, getHasAccessTo]
  );

  return (
    <PermissionContext.Provider value={providerValue}>
      {children}
    </PermissionContext.Provider>
  );
};

export default PermissionProvider;
